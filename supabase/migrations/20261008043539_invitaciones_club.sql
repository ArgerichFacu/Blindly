begin;
-- El código permite solicitar ingreso; no expone resultados ni roles privados.
create table public.liga_invitaciones (
 liga_id uuid primary key references public.ligas(id) on delete cascade,
 codigo text not null unique check (codigo ~ '^[A-F0-9]{20}$'),
 vence_en timestamptz not null
);
alter table public.liga_invitaciones enable row level security;
revoke all on public.liga_invitaciones from public,anon,authenticated;

create function public.obtener_invitacion_liga(p_liga uuid,p_renovar boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare invitacion public.liga_invitaciones; begin
 perform private.exigir_cuenta();
 perform 1 from public.ligas where id=p_liga and estado='activa' for update;
 if not found or not private.puede_administrar_liga(p_liga) then raise exception 'SOLO_ADMIN'; end if;
 select * into invitacion from public.liga_invitaciones where liga_id=p_liga;
 if invitacion.liga_id is null or invitacion.vence_en<=pg_catalog.now() or coalesce(p_renovar,false) then
  insert into public.liga_invitaciones(liga_id,codigo,vence_en)
  values(p_liga,upper(substr(replace(pg_catalog.gen_random_uuid()::text,'-',''),13,20)),pg_catalog.now()+interval '30 days')
  on conflict(liga_id) do update set codigo=excluded.codigo,vence_en=excluded.vence_en
  returning * into invitacion;
 end if;
 return jsonb_build_object('codigo',invitacion.codigo,'vence_en',invitacion.vence_en);
end; $$;

create function public.consultar_invitacion_liga(p_codigo text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare resultado jsonb; begin
 perform private.exigir_cuenta();
 if p_codigo is null or upper(trim(p_codigo)) !~ '^[A-F0-9]{20}$' then raise exception 'INVITACION_INVALIDA'; end if;
 select jsonb_build_object('liga_id',l.id,'nombre',l.nombre,'descripcion',l.descripcion,
 'ya_miembro',l.owner_id=auth.uid() or exists(select 1 from public.liga_miembros m where m.liga_id=l.id and m.user_id=auth.uid() and m.activo))
 into resultado from public.liga_invitaciones i join public.ligas l on l.id=i.liga_id
 where i.codigo=upper(trim(p_codigo)) and i.vence_en>pg_catalog.now() and l.estado='activa';
 if resultado is null then raise exception 'INVITACION_INVALIDA'; end if;
 return resultado;
end; $$;

create function public.aceptar_invitacion_liga(p_codigo text,p_nombre text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare club uuid; miembro_activo boolean; begin
 perform private.exigir_cuenta();
 if p_codigo is null or upper(trim(p_codigo)) !~ '^[A-F0-9]{20}$' then raise exception 'INVITACION_INVALIDA'; end if;
 if char_length(trim(coalesce(p_nombre,''))) not between 1 and 30 then raise exception 'DATOS_INVALIDOS'; end if;
 select liga_id into club from public.liga_invitaciones where codigo=upper(trim(p_codigo));
 if club is null then raise exception 'INVITACION_INVALIDA'; end if;
 -- Mismo orden de bloqueo que renovar: club primero, código después.
 perform 1 from public.ligas where id=club and estado='activa' for update;
 if not found or not exists(select 1 from public.liga_invitaciones where liga_id=club and codigo=upper(trim(p_codigo)) and vence_en>pg_catalog.now()) then raise exception 'INVITACION_INVALIDA'; end if;
 select activo into miembro_activo from public.liga_miembros where liga_id=club and user_id=auth.uid();
 if miembro_activo is false then raise exception 'MIEMBRO_RETIRADO'; end if;
 insert into public.liga_miembros(liga_id,user_id,nombre,rol) values(club,auth.uid(),trim(p_nombre),'member')
 on conflict(liga_id,user_id) do nothing;
 return club;
end; $$;
revoke all on function public.obtener_invitacion_liga(uuid,boolean),public.consultar_invitacion_liga(text),public.aceptar_invitacion_liga(text,text) from public,anon;
grant execute on function public.obtener_invitacion_liga(uuid,boolean),public.consultar_invitacion_liga(text),public.aceptar_invitacion_liga(text,text) to authenticated;
-- El ingreso permanente requiere confirmación. Iniciar una partida ya no
-- incorpora personas ni reactiva a miembros retirados por un administrador.
do $$ declare original text; nueva text; bloque text; begin
 original := pg_catalog.pg_get_functiondef('public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)'::regprocedure);
 bloque := E'insert into public.liga_miembros(liga_id, user_id, nombre, activo)\n    select v_liga, j.user_id, j.nombre, true\n    from public.jugadores j where j.sala_id = v_sala.id and exists(select 1 from auth.users u where u.id=j.user_id and u.is_anonymous is false)\n    on conflict (liga_id, user_id) do update\n      set nombre = excluded.nombre, activo = true;';
 nueva := replace(original,bloque,E'update public.liga_miembros m set nombre = j.nombre\n    from public.jugadores j where j.sala_id = v_sala.id and m.liga_id=v_liga and m.user_id=j.user_id and m.activo;');
 if nueva=original then raise exception 'BASE_INVITACION_INCOMPATIBLE'; end if;
 execute nueva;
end; $$;
commit;
