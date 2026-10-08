begin;
-- Derivado sólo de resultados propios y rivales autorizados de la temporada.
create function private.rivalidades_temporada(p_temporada uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare club uuid; rivales jsonb; nemesis jsonb; begin
 perform private.exigir_cuenta();
 select liga_id into club from public.liga_temporadas where id=p_temporada;
 if club is null or not private.puede_ver_liga(club) then raise exception 'LIGA_NO_DISPONIBLE'; end if;
 with encuentros as (
  select r.user_id,m.nombre,m.titulo_personalizado,p.puesto as propio,r.puesto as rival,
   row_number() over(partition by r.user_id order by p.finalizada_en desc,p.sala_id asc) as reciente
  from public.puntuacion_partidas p
  join public.puntuacion_partidas r on r.sala_id=p.sala_id and r.temporada_id=p_temporada and r.user_id<>p.user_id and r.finalizada_en is not null
  join public.liga_miembros m on m.liga_id=club and m.user_id=r.user_id and m.activo
  join auth.users u on u.id=r.user_id and u.is_anonymous is false
  where p.user_id=auth.uid() and p.temporada_id=p_temporada and p.finalizada_en is not null
 ), totales as (
  select user_id,nombre,titulo_personalizado,count(*) as compartidas,
   count(*) filter(where propio<rival) as victorias,count(*) filter(where propio>rival) as derrotas,
   count(*) filter(where propio=rival) as empates,
   count(*) filter(where reciente<=4) as recientes,
   count(*) filter(where reciente<=4 and propio>rival) as derrotas_recientes
  from encuentros group by user_id,nombre,titulo_personalizado having count(*)>=3
 ), limitados as (
  select * from totales order by derrotas desc,compartidas desc,user_id asc limit 5
 ) select coalesce(jsonb_agg(to_jsonb(t) order by derrotas desc,compartidas desc,user_id asc),'[]'::jsonb),
   (select to_jsonb(n) from totales n where n.derrotas>n.victorias order by n.derrotas desc,n.compartidas desc,n.user_id asc limit 1)
   into rivales,nemesis from limitados t;
 return jsonb_build_object('rivales',rivales,'nemesis',nemesis);
end; $$;
revoke all on function private.rivalidades_temporada(uuid) from public,anon,authenticated;

alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_rivalidades;
revoke all on function private.detalle_liga_sin_rivalidades(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb; rivalidades jsonb; begin
 resultado:=private.detalle_liga_sin_rivalidades(p_liga,p_temporada);
 if resultado#>>'{temporada,id}' is not null then
  rivalidades:=private.rivalidades_temporada((resultado#>>'{temporada,id}')::uuid);
 else rivalidades:=jsonb_build_object('rivales','[]'::jsonb,'nemesis',null); end if;
 return resultado||jsonb_build_object('rivalidades',rivalidades);
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;
commit;
