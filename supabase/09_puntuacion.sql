begin;
-- Historial privado: no se borra al eliminar una sala y nunca admite escrituras del cliente.
create table if not exists public.puntuacion_partidas (
 sala_id uuid not null, user_id uuid not null references auth.users(id) on delete cascade,
 jugador_id uuid not null, jugadores integer not null check(jugadores between 2 and 10),
 stack_inicio bigint not null, mano_eliminacion integer, puesto integer,
 puntos numeric(8,3), finalizada_en timestamptz,
 primary key(sala_id,user_id)
);
create index if not exists puntuacion_usuario on public.puntuacion_partidas(user_id) where finalizada_en is not null;
alter table public.puntuacion_partidas enable row level security;
revoke all on public.puntuacion_partidas from public,anon,authenticated;

create or replace function public.puntos_posicion(p_jugadores integer,p_puesto integer) returns integer
language sql immutable set search_path='' as $$
 select case when p_jugadores between 2 and 10 and p_puesto between 1 and p_jugadores
 then (array[25,18,15,12,10,8,6,4,2,1])[10-p_jugadores+p_puesto] else null end
$$;

do $$ begin
 if to_regprocedure('public.accion_mesa_v2(uuid,text,jsonb,text)') is null then
  alter function public.accion_mesa(uuid,text,jsonb,text) rename to accion_mesa_v2;
 end if;
end $$;
revoke all on function public.accion_mesa_v2(uuid,text,jsonb,text) from public,anon,authenticated;

create or replace function public.accion_mesa(p_sala uuid,p_accion text,p_datos jsonb,p_solicitud text) returns public.salas
language plpgsql security definer set search_path='' as $$
declare s public.salas; previa public.salas; repetida boolean;
begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 select * into previa from public.salas where id=p_sala for update;
 if not exists(select 1 from public.jugadores where sala_id=p_sala and user_id=auth.uid()) then raise exception 'NO_PERTENECES'; end if;
 select exists(select 1 from public.operaciones_mesa where solicitud=p_solicitud) into repetida;
 if p_accion='fichas' and not repetida and coalesce((p_datos->>'monto')::numeric,0)>0 and exists(select 1 from public.puntuacion_partidas where sala_id=p_sala and jugador_id=(p_datos->>'jugador')::uuid and mano_eliminacion is not null) then
  raise exception 'ELIMINACION_CONFIRMADA';
 end if;
 -- Antes de repartir, las fichas más el aporte reflejan el stack al inicio de la mano virtual.
 if p_accion='cerrar_mano' and not repetida and previa.configuracion#>>'{fichas,tipo}'='virtuales' then
  update public.puntuacion_partidas r set stack_inicio=j.fichas+j.apuesta_mano
  from public.jugadores j where r.sala_id=p_sala and j.id=r.jugador_id and r.mano_eliminacion is null and r.finalizada_en is null;
 end if;
 -- La función anterior valida pertenencia, rol, estado y reintentos. Un error revierte todo.
 s:=public.accion_mesa_v2(p_sala,p_accion,p_datos,p_solicitud);
 if repetida then return s; end if;
 if p_accion='iniciar' then
  insert into public.puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio)
  select s.id,j.user_id,j.id,cardinality(s.orden),j.fichas+j.apuesta_mano from public.jugadores j where j.sala_id=s.id;
 end if;
 if p_accion='cerrar_mano' then
  update public.puntuacion_partidas r set mano_eliminacion=previa.mano
  from public.jugadores j where r.sala_id=s.id and j.id=r.jugador_id and r.mano_eliminacion is null
   and r.finalizada_en is null and j.eliminado_en is not null;
  if s.estado='finalizada' and exists(select 1 from public.puntuacion_partidas where sala_id=s.id) then
   if (select count(*) from public.jugadores where sala_id=s.id and eliminado_en is null and fichas>0)<>1 then
    raise exception 'GANADOR_REQUERIDO';
   end if;
   -- Empates exactos comparten puesto y el promedio de los puntos que ocupan.
   with puestos as (
    select user_id,jugadores,rank() over(order by mano_eliminacion desc nulls first,stack_inicio desc) as pos,
     count(*) over(partition by mano_eliminacion,stack_inicio) as empate
    from public.puntuacion_partidas where sala_id=s.id
   )
   update public.puntuacion_partidas r set puesto=p.pos,
    puntos=(select avg(public.puntos_posicion(p.jugadores,x::integer)) from generate_series(p.pos,p.pos+p.empate-1) x),finalizada_en=now()
   from puestos p where r.sala_id=s.id and r.user_id=p.user_id and r.finalizada_en is null;
  else
   -- En mesas físicas, el host registra los stacks al cerrar cada mano.
   update public.puntuacion_partidas r set stack_inicio=j.fichas+j.apuesta_mano
   from public.jugadores j where r.sala_id=s.id and j.id=r.jugador_id and r.mano_eliminacion is null and r.finalizada_en is null;
  end if;
 end if;
 return s;
end $$;

create or replace function public.mi_puntuacion() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb;
begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 with totales as (select user_id,sum(puntos) puntos,count(*) partidas from public.puntuacion_partidas where finalizada_en is not null group by user_id),
 rangos as (select *,rank() over(order by puntos desc) rango from totales)
 select jsonb_build_object('puntos',coalesce((select puntos from rangos where user_id=auth.uid()),0),
 'partidas',coalesce((select partidas from rangos where user_id=auth.uid()),0),
 'rango',(select rango from rangos where user_id=auth.uid()),
 'historial',coalesce((select jsonb_agg(to_jsonb(h) order by h.finalizada_en desc) from
  (select sala_id,jugadores,puesto,puntos,finalizada_en from public.puntuacion_partidas where user_id=auth.uid() and finalizada_en is not null order by finalizada_en desc,sala_id limit 30) h),'[]'::jsonb)) into resultado;
 return resultado;
end $$;

create or replace function public.rangos_mesa(p_sala uuid) returns table(jugador_id uuid,rango bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 if not exists(select 1 from public.jugadores where sala_id=p_sala and user_id=auth.uid()) then raise exception 'NO_PERTENECES'; end if;
 return query
 with totales as (select r.user_id,sum(r.puntos) puntos from public.puntuacion_partidas r where r.finalizada_en is not null group by r.user_id),
 rangos as (select t.user_id,rank() over(order by t.puntos desc) rango from totales t)
 select j.id,r.rango from public.jugadores j left join rangos r on r.user_id=j.user_id where j.sala_id=p_sala;
end $$;
revoke all on function public.puntos_posicion(integer,integer),public.mi_puntuacion(),public.rangos_mesa(uuid),public.accion_mesa(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.mi_puntuacion(),public.rangos_mesa(uuid),public.accion_mesa(uuid,text,jsonb,text) to authenticated;
notify pgrst,'reload schema';
commit;
