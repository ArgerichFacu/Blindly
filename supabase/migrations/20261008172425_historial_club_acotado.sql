begin;
create index liga_partidas_historial_idx on public.liga_partidas(temporada_id,finalizada_en desc,sala_id desc) where finalizada_en is not null;
create function public.historial_club(p_liga uuid,p_temporada uuid,p_antes timestamptz default null,p_sala uuid default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r jsonb; begin
 perform private.exigir_cuenta();
 if not private.puede_ver_liga(p_liga) then raise exception 'LIGA_NO_DISPONIBLE'; end if;
 if not exists(select 1 from public.liga_temporadas where id=p_temporada and liga_id=p_liga) then raise exception 'TEMPORADA_NO_EXISTE'; end if;
 if (p_antes is null) <> (p_sala is null) then raise exception 'DATOS_INVALIDOS'; end if;
 with pagina as (
  select * from public.liga_partidas where temporada_id=p_temporada and finalizada_en is not null
    and (p_antes is null or (finalizada_en,sala_id)<(p_antes,p_sala))
  order by finalizada_en desc,sala_id desc limit 21
 ), visibles as (select * from pagina order by finalizada_en desc,sala_id desc limit 20)
 select jsonb_build_object('hay_mas',(select count(*)>20 from pagina),'partidas',coalesce((
   select jsonb_agg(jsonb_build_object('sala_id',p.sala_id,'codigo_sala',p.codigo_sala,
     'finalizada_en',p.finalizada_en,'duracion_ms',p.duracion_ms,'jugadores',p.jugadores,
     'ganador',(select string_agg(coalesce(r.nombre_jugador,'Jugador'),' · ' order by r.user_id)
       from public.puntuacion_partidas r where r.sala_id=p.sala_id and r.puesto=1)) order by p.finalizada_en desc,p.sala_id desc)
   from visibles p),'[]'::jsonb)) into r;
 return r;
end; $$;
revoke all on function public.historial_club(uuid,uuid,timestamptz,uuid) from public,anon;
grant execute on function public.historial_club(uuid,uuid,timestamptz,uuid) to authenticated;
-- Acotar ANTES de agregar JSON en el detalle base, no después de transferirlo.
do $$ declare original text; fuente text; begin
 original:=pg_catalog.pg_get_functiondef('private.detalle_liga_base_club(uuid,uuid)'::regprocedure);
 fuente:='from public.liga_partidas p'||chr(10)||'      where p.temporada_id = v_temporada.id and p.finalizada_en is not null';
 if position(fuente in original)=0 then raise exception 'HISTORIAL_FUENTE_INESPERADA'; end if;
 original:=replace(original,fuente,'from (select * from public.liga_partidas where temporada_id=v_temporada.id and finalizada_en is not null order by finalizada_en desc,sala_id desc limit 20) p');
 original:=replace(original,'order by p.finalizada_en desc)','order by p.finalizada_en desc,p.sala_id desc)');
 original:=replace(original,'select r.nombre_jugador from public.puntuacion_partidas r','select string_agg(coalesce(r.nombre_jugador,''Jugador''),'' · '' order by r.user_id) from public.puntuacion_partidas r');
 original:=replace(original,'order by r.nombre_jugador limit 1','');
 execute original;
end; $$;
alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_historial_acotado;
revoke all on function private.detalle_liga_sin_historial_acotado(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare r jsonb; begin
 r:=private.detalle_liga_sin_historial_acotado(p_liga,p_temporada);
 return r || jsonb_build_object('historial_hay_mas',exists(select 1 from public.liga_partidas where temporada_id=(r#>>'{temporada,id}')::uuid and finalizada_en is not null order by finalizada_en desc,sala_id desc offset 20 limit 1));
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;
commit;
