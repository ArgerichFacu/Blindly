begin;
-- Identidad por presets versionados: sin URLs ni archivos de terceros.
alter table public.ligas add column identidad jsonb not null default '{"version":1,"color":"oro","emblema":"picas","banner":"liso"}'::jsonb;
create function private.capacidad_club(p_liga uuid,p_capacidad text) returns boolean
language sql stable security definer set search_path='' as $$
 select p_capacidad in ('editar_titulos','editar_identidad')
   and private.puede_administrar_liga(p_liga) and private.liga_tiene_plus(p_liga)
   and exists(select 1 from public.ligas where id=p_liga and estado='activa');
$$;
create or replace function private.puede_editar_titulos(p_liga uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select private.capacidad_club(p_liga,'editar_titulos');
$$;
revoke all on function private.capacidad_club(uuid,text) from public,anon,authenticated;
create function public.guardar_identidad_club(p_liga uuid,p_identidad jsonb) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform private.exigir_cuenta();
 perform 1 from public.ligas where id=p_liga for update;
 if not private.puede_administrar_liga(p_liga) then raise exception 'SOLO_ADMIN'; end if;
 if not private.capacidad_club(p_liga,'editar_identidad') then raise exception 'PLUS_CLUB_REQUERIDO'; end if;
 if p_identidad is null or jsonb_typeof(p_identidad)<>'object'
   or p_identidad->'version' is distinct from '1'::jsonb
   or coalesce(p_identidad->>'color','') not in ('oro','esmeralda','rubí','zafiro')
   or coalesce(p_identidad->>'emblema','') not in ('picas','corazones','diamantes','treboles')
   or coalesce(p_identidad->>'banner','') not in ('liso','rayas','diamantes')
   or (select count(*) from jsonb_object_keys(p_identidad))<>4 then raise exception 'IDENTIDAD_CLUB_INVALIDA'; end if;
 update public.ligas set identidad=p_identidad where id=p_liga;
end; $$;
revoke all on function public.guardar_identidad_club(uuid,jsonb) from public,anon;
grant execute on function public.guardar_identidad_club(uuid,jsonb) to authenticated;
alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_identidad;
revoke all on function private.detalle_liga_sin_identidad(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare r jsonb; begin
 r:=private.detalle_liga_sin_identidad(p_liga,p_temporada);
 return jsonb_set(r,'{liga}',(r->'liga') || jsonb_build_object(
   'identidad',(select identidad from public.ligas where id=p_liga),
   'permisos',(r#>'{liga,permisos}') || jsonb_build_object('editar_identidad',private.capacidad_club(p_liga,'editar_identidad'))));
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;

-- Recap: UUID estable y MVP registrado al cierre, nunca el líder actual inventado.
do $$ declare original text; begin
 original:=pg_catalog.pg_get_functiondef('public.recap_partida(uuid)'::regprocedure);
 if position('''puesto'', r.puesto' in original)=0 then raise exception 'RECAP_FUENTE_INESPERADA'; end if;
 execute replace(original,'''puesto'', r.puesto','''user_id'', r.user_id, ''puesto'', r.puesto');
end; $$;
alter function public.recap_partida(uuid) set schema private;
alter function private.recap_partida(uuid) rename to recap_partida_base;
revoke all on function private.recap_partida_base(uuid) from public,anon,authenticated;
create function public.recap_partida(p_sala uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare r jsonb; mvp jsonb; begin
 r:=private.recap_partida_base(p_sala);
 if exists(select 1 from public.salas where id=p_sala and estado<>'finalizada')
   or exists(select 1 from public.liga_partidas where sala_id=p_sala and finalizada_en is null)
   then raise exception 'RECAP_NO_DISPONIBLE'; end if;
 select jsonb_build_object('nombre',e.datos->>'nombre','user_id',e.datos->>'user_id') into mvp
 from private.eventos_club e where e.id='mvp:'||p_sala::text
   and exists(select 1 from auth.users where id=auth.uid() and is_anonymous is false)
   and exists(select 1 from public.liga_miembros where liga_id=e.liga_id and user_id=auth.uid() and activo);
 return r || jsonb_build_object('nuevo_mvp',mvp);
end; $$;
revoke all on function public.recap_partida(uuid) from public,anon;
grant execute on function public.recap_partida(uuid) to authenticated;
commit;
