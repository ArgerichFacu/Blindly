begin;
alter table public.ligas add column descripcion text not null default '' check (char_length(descripcion) <= 280);
alter table public.liga_miembros add column rol text not null default 'member' check (rol in ('member','admin'));

create function private.cuenta_recuperable() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from auth.users u where u.id = auth.uid() and u.is_anonymous is false);
$$;
create function private.exigir_cuenta() returns void language plpgsql security definer set search_path = '' as $$
begin if not private.cuenta_recuperable() then raise exception 'CUENTA_REQUERIDA'; end if; end;
$$;
create function private.puede_administrar_liga(p_liga uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select private.cuenta_recuperable() and exists(select 1 from public.ligas l where l.id = p_liga and
 (l.owner_id = auth.uid() or exists(select 1 from public.liga_miembros m where m.liga_id=l.id and m.user_id=auth.uid() and m.activo and m.rol='admin')));
$$;
revoke all on function private.cuenta_recuperable(),private.exigir_cuenta(),private.puede_administrar_liga(uuid) from public,anon,authenticated;

-- Reemplazos acotados sobre las funciones previas, con abort si cambia la base esperada.
-- Conserva validación de niveles, idempotencia y cálculo de puntos original.
do $$ declare firma text; original text; nueva text; begin
 foreach firma in array array['public.crear_liga(text,text,text)','public.actualizar_liga(uuid,text,boolean)',
 'public.crear_temporada(uuid,text)','public.finalizar_temporada(uuid)',
 'public.crear_sala(jsonb,uuid)','public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)'] loop
 original := pg_catalog.pg_get_functiondef(firma::regprocedure);
 nueva := replace(original,'perform private.exigir_plus(auth.uid());','perform private.exigir_cuenta();');
 if nueva=original then raise exception 'BASE_CLUB_INCOMPATIBLE: %',firma; end if;
 if firma='public.crear_temporada(uuid,text)' then
 nueva := replace(nueva,'owner_id = auth.uid() and estado = ''activa''','private.puede_administrar_liga(p_liga) and estado = ''activa''');
 elsif firma='public.finalizar_temporada(uuid)' then
 nueva := replace(nueva,'l.owner_id = auth.uid() and t.estado','private.puede_administrar_liga(l.id) and t.estado');
 elsif firma='public.crear_sala(jsonb,uuid)' then
 nueva := replace(nueva,'if v_liga.owner_id <> auth.uid() then','if not private.puede_administrar_liga(v_liga.id) then');
 elsif firma='public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)' then
 nueva := replace(nueva,'from public.jugadores j where j.sala_id = v_sala.id',
 'from public.jugadores j where j.sala_id = v_sala.id and exists(select 1 from auth.users u where u.id=j.user_id and u.is_anonymous is false)');
 end if;
 execute nueva;
 end loop;
end; $$;

create or replace function public.quitar_miembro(p_liga uuid,p_usuario uuid) returns void language plpgsql security definer set search_path = '' as $$
declare propietario uuid; rol_actual text; begin
 perform private.exigir_cuenta();
 select owner_id into propietario from public.ligas where id=p_liga for update;
 if not found or not private.puede_administrar_liga(p_liga) then raise exception 'SOLO_ADMIN'; end if;
 select rol into rol_actual from public.liga_miembros where liga_id=p_liga and user_id=p_usuario and activo;
 if p_usuario=propietario then raise exception 'OWNER_REQUERIDO'; end if;
 if auth.uid()<>propietario and rol_actual='admin' then raise exception 'SOLO_OWNER'; end if;
 update public.liga_miembros set activo=false where liga_id=p_liga and user_id=p_usuario and activo;
 if not found then raise exception 'MIEMBRO_NO_EXISTE'; end if;
end; $$;
create function public.cambiar_rol_liga(p_liga uuid,p_usuario uuid,p_rol text) returns void language plpgsql security definer set search_path = '' as $$
declare propietario uuid; begin
 perform private.exigir_cuenta();
 select owner_id into propietario from public.ligas where id=p_liga for update;
 if not found or propietario<>auth.uid() then raise exception 'SOLO_OWNER'; end if;
 if p_usuario=propietario then raise exception 'OWNER_REQUERIDO'; end if;
 if p_rol not in ('admin','member') or p_rol is null then raise exception 'DATOS_INVALIDOS'; end if;
 if p_rol='admin' and not exists(select 1 from auth.users where id=p_usuario and is_anonymous is false) then raise exception 'CUENTA_REQUERIDA'; end if;
 update public.liga_miembros set rol=p_rol where liga_id=p_liga and user_id=p_usuario and activo;
 if not found then raise exception 'MIEMBRO_NO_EXISTE'; end if;
end; $$;
create function public.actualizar_club(p_liga uuid,p_descripcion text) returns void language plpgsql security definer set search_path = '' as $$
begin
 perform private.exigir_cuenta();
 perform 1 from public.ligas where id=p_liga for update;
 if not private.puede_administrar_liga(p_liga) then raise exception 'SOLO_ADMIN'; end if;
 if p_descripcion is null or char_length(trim(p_descripcion))>280 then raise exception 'DATOS_INVALIDOS'; end if;
 update public.ligas set descripcion=trim(p_descripcion),actualizada_en=pg_catalog.now() where id=p_liga;
end; $$;

alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_base_club;
revoke all on function private.detalle_liga_base_club(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare resultado jsonb; begin
 resultado := private.detalle_liga_base_club(p_liga,p_temporada);
 resultado := jsonb_set(resultado,'{liga}',(resultado->'liga') || jsonb_build_object(
 'descripcion',(select descripcion from public.ligas where id=p_liga),
 'puede_administrar',private.puede_administrar_liga(p_liga),
 'rol',case when (resultado#>>'{liga,soy_owner}')::boolean then 'owner' else coalesce((select rol from public.liga_miembros where liga_id=p_liga and user_id=auth.uid() and activo),'member') end));
 resultado := jsonb_set(resultado,'{miembros}',coalesce((select jsonb_agg(v || jsonb_build_object('rol',case when (v->>'owner')::boolean then 'owner' else coalesce((select m.rol from public.liga_miembros m where m.liga_id=p_liga and m.user_id=(v->>'user_id')::uuid),'member') end)) from jsonb_array_elements(resultado->'miembros') v),'[]'::jsonb));
 return resultado;
end; $$;
revoke all on function public.detalle_liga(uuid,uuid),public.cambiar_rol_liga(uuid,uuid,text),public.actualizar_club(uuid,text) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid),public.cambiar_rol_liga(uuid,uuid,text),public.actualizar_club(uuid,text) to authenticated;
commit;
