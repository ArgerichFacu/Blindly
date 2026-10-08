begin;
create function private.feed_club(p_liga uuid,p_temporada uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb; begin
 perform private.exigir_cuenta();
 if not private.puede_ver_liga(p_liga) or not exists(select 1 from public.liga_temporadas where id=p_temporada and liga_id=p_liga)
   then raise exception 'LIGA_NO_DISPONIBLE'; end if;
 with partidas as (
  select p.sala_id,p.codigo_sala,p.finalizada_en,p.jugadores from public.liga_partidas p
   where p.temporada_id=p_temporada and p.finalizada_en is not null order by p.finalizada_en desc,p.sala_id asc limit 20
 ), eventos as (
  select 'partida:'||p.sala_id::text as id,p.finalizada_en as orden,
   jsonb_build_object('id','partida:'||p.sala_id::text,'tipo','partida','fecha',p.finalizada_en,'precision','instante','codigo',p.codigo_sala,'jugadores',p.jugadores) as datos
   from partidas p
  union all
  select 'temporada:'||t.id::text, (t.fin+time '23:59:59') at time zone 'UTC',
   jsonb_build_object('id','temporada:'||t.id::text,'tipo','temporada','fecha',t.fin,'precision','dia','nombre',t.nombre)
   from public.liga_temporadas t where t.id=p_temporada and t.estado='finalizada' and t.fin is not null
  union all
  select 'fecha:'||f.id::text,f.creada_en,
   jsonb_build_object('id','fecha:'||f.id::text,'tipo','fecha','fecha',f.creada_en,'precision','instante','cuando',f.cuando)
   from public.liga_fechas f where f.liga_id=p_liga and f.estado='programada' and f.cuando>now()
 ), limitados as (
  select * from eventos order by orden desc,id asc limit 20
 ) select coalesce(jsonb_agg(datos order by orden desc,id asc),'[]'::jsonb) into resultado from limitados;
 return resultado;
end; $$;
revoke all on function private.feed_club(uuid,uuid) from public,anon,authenticated;
alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_feed;
revoke all on function private.detalle_liga_sin_feed(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb; eventos jsonb; begin
 resultado:=private.detalle_liga_sin_feed(p_liga,p_temporada);
 if resultado#>>'{temporada,id}' is not null then eventos:=private.feed_club(p_liga,(resultado#>>'{temporada,id}')::uuid);
 else eventos:='[]'::jsonb; end if;
 return resultado||jsonb_build_object('feed',eventos);
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;
commit;
