begin;
-- Estado mínimo de la identidad propia para proteger recuperaciones. No divulga
-- historial, miembros ni resultados y también funciona con identidades legacy.
create function public.mi_identidad_tiene_datos() returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 return exists(select 1 from public.puntuacion_partidas where user_id=auth.uid())
 or exists(select 1 from public.ligas where owner_id=auth.uid())
 or exists(select 1 from public.liga_miembros where user_id=auth.uid())
 or exists(select 1 from public.mesas_habituales where owner_id=auth.uid());
end; $$;
revoke all on function public.mi_identidad_tiene_datos() from public,anon;
grant execute on function public.mi_identidad_tiene_datos() to authenticated;

create or replace function private.puede_ver_liga(p_liga uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select private.cuenta_recuperable() and (exists(select 1 from public.ligas where id=p_liga and owner_id=auth.uid())
 or exists(select 1 from public.liga_miembros where liga_id=p_liga and user_id=auth.uid() and activo));
$$;
-- Las políticas existentes usan este helper. Conserva su permiso de ejecución.

do $$ declare firma text; original text; nueva text; begin
 foreach firma in array array['public.mis_ligas()','public.mis_temporadas_propias()',
 'public.ranking_liga(uuid)','public.detalle_liga(uuid,uuid)','public.mi_puntuacion()','public.mi_head_to_head()'] loop
  original := pg_catalog.pg_get_functiondef(firma::regprocedure);
  nueva := replace(original,E'begin\n',E'begin\n  perform private.exigir_cuenta();\n');
  if nueva=original then raise exception 'BASE_IDENTIDAD_INCOMPATIBLE: %',firma; end if;
  if firma='public.mis_temporadas_propias()' then
   nueva := replace(nueva,'where l.owner_id = auth.uid() and l.estado', 'where private.puede_administrar_liga(l.id) and l.estado');
  end if;
  execute nueva;
 end loop;
end; $$;
alter function public.unirse_mesa(text,text) set schema private;
alter function private.unirse_mesa(text,text) rename to unirse_mesa_base_identidad;
revoke all on function private.unirse_mesa_base_identidad(text,text) from public,anon,authenticated;
create function public.unirse_mesa(p_codigo text,p_nombre text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare club uuid; estado_sala text; begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 select t.liga_id,s.estado into club,estado_sala from public.salas s
 left join public.liga_temporadas t on t.id=s.temporada_id where s.codigo=upper(trim(p_codigo));
 -- Las mesas ya iniciadas conservan reconexión legacy. Las casuales no cambian.
 if club is not null and estado_sala='esperando' then
  perform private.exigir_cuenta();
  perform 1 from public.ligas where id=club for update;
  if not private.puede_ver_liga(club) then raise exception 'MEMBRESIA_REQUERIDA'; end if;
 end if;
 return private.unirse_mesa_base_identidad(p_codigo,p_nombre);
end; $$;
revoke all on function public.unirse_mesa(text,text) from public,anon;
grant execute on function public.unirse_mesa(text,text) to authenticated;

do $$ declare original text; nueva text; begin
 original := pg_catalog.pg_get_functiondef('public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)'::regprocedure);
 nueva := replace(original,'perform private.exigir_cuenta();',E'perform private.exigir_cuenta();\n    if exists(select 1 from public.salas where id=p_sala and estado=''esperando'') then\n      select t.liga_id into v_liga from public.salas s join public.liga_temporadas t on t.id=s.temporada_id where s.id=p_sala;\n      perform 1 from public.ligas where id=v_liga for update;\n      if exists(select 1 from public.jugadores j where j.sala_id=p_sala and (not exists(select 1 from auth.users u where u.id=j.user_id and u.is_anonymous is false) or not exists(select 1 from public.liga_miembros m where m.liga_id=v_liga and m.user_id=j.user_id and m.activo))) then raise exception ''MEMBRESIA_REQUERIDA''; end if;\n    end if;');
 if nueva=original then raise exception 'BASE_PARTIDA_IDENTIDAD_INCOMPATIBLE'; end if;
 execute nueva;
end; $$;
-- Los resultados legacy se conservan, pero los rangos sólo muestran cuentas
-- protegidas. Al proteger el mismo UUID, sus resultados vuelven a contar.
do $$ declare firma text; original text; nueva text; begin
 foreach firma in array array['public.mi_puntuacion()','public.rangos_mesa(uuid)','public.ranking_liga(uuid)'] loop
  original := pg_catalog.pg_get_functiondef(firma::regprocedure);
  if firma='public.mi_puntuacion()' then
   nueva := replace(original,'from public.puntuacion_partidas where finalizada_en is not null','from public.puntuacion_partidas where finalizada_en is not null and exists(select 1 from auth.users u where u.id=puntuacion_partidas.user_id and u.is_anonymous is false)');
  elsif firma='public.rangos_mesa(uuid)' then
   nueva := replace(original,'where r.finalizada_en is not null group by r.user_id','where r.finalizada_en is not null and exists(select 1 from auth.users u where u.id=r.user_id and u.is_anonymous is false) group by r.user_id');
  else
   nueva := replace(original,'where r.temporada_id = p_temporada and r.finalizada_en is not null','where r.temporada_id = p_temporada and r.finalizada_en is not null and exists(select 1 from auth.users u where u.id=r.user_id and u.is_anonymous is false)');
  end if;
  if nueva=original then raise exception 'BASE_RANGO_IDENTIDAD_INCOMPATIBLE: %',firma; end if;
  execute nueva;
 end loop;
end; $$;
commit;
