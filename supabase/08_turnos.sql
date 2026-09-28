begin;
alter table public.salas add column if not exists sb_id uuid, add column if not exists bb_id uuid, add column if not exists boton_id uuid, add column if not exists turno_id uuid,
 add column if not exists calle text not null default 'reparto', add column if not exists pendientes uuid[] not null default '{}',
 add column if not exists apuesta_actual bigint not null default 0, add column if not exists subida_minima bigint not null default 1,
 add column if not exists ciega_mano bigint not null default 1;
alter table public.jugadores add column if not exists aporte_calle bigint not null default 0,
 add column if not exists retirado boolean not null default false, add column if not exists apuesta_al_actuar bigint;
-- Las manos anteriores conservan balances y quedan listas para repartir.
update public.salas set boton_id=dealer_id where boton_id is null;
do $$ begin
 if to_regprocedure('public.accion_mesa_v1(uuid,text,jsonb,text)') is null then
  alter function public.accion_mesa(uuid,text,jsonb,text) rename to accion_mesa_v1;
 end if;
end $$;
revoke all on function public.accion_mesa_v1(uuid,text,jsonb,text) from public,anon,authenticated;

create or replace function public.pozos_mesa(p_sala uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 with escalones as (select distinct apuesta_mano as tope from public.jugadores where sala_id=p_sala and apuesta_mano>0),
 capas as (select tope, tope-lag(tope,1,0::bigint) over(order by tope) as ancho from escalones)
 select coalesce(jsonb_agg(jsonb_build_object('tope',tope,'monto',ancho*(select count(*) from public.jugadores where sala_id=p_sala and apuesta_mano>=tope),
 'elegibles',(select coalesce(jsonb_agg(id),'[]') from public.jugadores where sala_id=p_sala and apuesta_mano>=tope and not retirado and eliminado_en is null)) order by tope),'[]') from capas
$$;

create or replace function public.avanzar_apuestas(p_sala uuid,p_despues uuid) returns void
language plpgsql security definer set search_path='' as $$
declare s public.salas; vivos integer; capaces integer; proximo uuid; i integer; inicio integer;
begin
 select * into s from public.salas where id=p_sala;
 select count(*),count(*) filter(where fichas>0) into vivos,capaces from public.jugadores where sala_id=s.id and eliminado_en is null and not retirado;
 select coalesce(array_agg(x), '{}') into s.pendientes from unnest(s.pendientes) x join public.jugadores j on j.id=x where not j.retirado and j.eliminado_en is null and j.fichas>0;
 if vivos<=1 or (capaces<=1 and not exists(select 1 from public.jugadores where sala_id=s.id and not retirado and eliminado_en is null and fichas>0 and aporte_calle<s.apuesta_actual)) then
  update public.salas set calle='reparto',turno_id=null,pendientes='{}' where id=s.id; return;
 end if;
 if cardinality(s.pendientes)=0 then
  if s.calle='river' then update public.salas set calle='reparto',turno_id=null,pendientes='{}' where id=s.id; return; end if;
  s.calle:=case s.calle when 'preflop' then 'flop' when 'flop' then 'turn' else 'river' end;
  update public.jugadores set aporte_calle=0,apuesta_al_actuar=null where sala_id=s.id;
  select array_agg(id) into s.pendientes from public.jugadores where sala_id=s.id and not retirado and eliminado_en is null and fichas>0;
  s.apuesta_actual:=0; s.subida_minima:=s.ciega_mano; p_despues:=s.boton_id;
 end if;
 inicio:=coalesce(array_position(s.orden,p_despues),0);
 for i in 1..cardinality(s.orden) loop
  proximo:=s.orden[1+((inicio-1+i)%cardinality(s.orden))]; exit when proximo=any(s.pendientes);
 end loop;
 update public.salas set turno_id=proximo,pendientes=s.pendientes,calle=s.calle,apuesta_actual=s.apuesta_actual,subida_minima=s.subida_minima where id=s.id;
end $$;

create or replace function public.preparar_apuestas(p_sala uuid,p_rotar boolean) returns void
language plpgsql security definer set search_path='' as $$
declare s public.salas; activos uuid[]; b uuid; sb uuid; bb uuid; i integer; pos integer; n integer; nivel jsonb; elegido jsonb; tiempo numeric; acumulado numeric:=0; chica bigint; grande bigint; pago bigint; jugador uuid;
begin
 select * into s from public.salas where id=p_sala;
 select array_agg(x order by z) into activos from unnest(s.orden) with ordinality as u(x,z) join public.jugadores j on j.id=x where j.eliminado_en is null and j.fichas>0;
 n:=coalesce(cardinality(activos),0);
 if n<2 then
  update public.salas set estado='finalizada',turno_id=null,calle='reparto',pendientes='{}',acumulado_ms=acumulado_ms+case when inicio_en is null then 0 else greatest(0,floor(extract(epoch from(now()-inicio_en))*1000))::bigint end,inicio_en=null where id=s.id; return;
 end if;
 b:=coalesce(s.boton_id,s.dealer_id);
 if p_rotar or not b=any(activos) then
  pos:=coalesce(array_position(s.orden,b),0);
  for i in 1..cardinality(s.orden) loop
   b:=s.orden[1+((pos-1+i)%cardinality(s.orden))]; exit when b=any(activos);
  end loop;
 end if;
 -- La ciega grande avanza al siguiente jugador activo, incluso al pasar a heads-up.
 if p_rotar and s.bb_id is not null then
  pos:=coalesce(array_position(s.orden,s.bb_id),0);
  for i in 1..cardinality(s.orden) loop
   bb:=s.orden[1+((pos-1+i)%cardinality(s.orden))]; exit when bb=any(activos);
  end loop;
  pos:=array_position(activos,bb);
  b:=activos[1+((pos-1+n-case when n=2 then 1 else 2 end)%n)];
 end if;
 pos:=array_position(activos,b);
 sb:=case when n=2 then b else activos[1+(pos%n)] end;
 bb:=activos[1+((pos+case when n=2 then 0 else 1 end)%n)];
 tiempo:=s.acumulado_ms+case when s.inicio_en is null then 0 else greatest(0,extract(epoch from(now()-s.inicio_en))*1000) end;
 for nivel in select * from jsonb_array_elements(s.niveles) loop
  if not coalesce((nivel->>'esBreak')::boolean,false) then elegido:=nivel; end if;
  acumulado:=acumulado+(nivel->>'minutos')::numeric*60000;
  exit when acumulado>tiempo and elegido is not null;
 end loop;
 chica:=(elegido->>'smallBlind')::bigint; grande:=(elegido->>'bigBlind')::bigint;
 update public.jugadores set aporte_calle=0,apuesta_mano=0,retirado=false,apuesta_al_actuar=null where sala_id=s.id;
 update public.salas set sb_id=sb,bb_id=bb,boton_id=b,calle='preflop',pendientes=activos,turno_id=null,apuesta_actual=grande,subida_minima=grande,ciega_mano=grande,pozo=0 where id=s.id;
 if s.configuracion#>>'{fichas,tipo}'='virtuales' then
  foreach jugador in array array[sb,bb] loop
   select least(fichas,case when jugador=sb then chica else grande end) into pago from public.jugadores where id=jugador;
   update public.jugadores set fichas=fichas-pago,aporte_calle=pago,apuesta_mano=pago where id=jugador;
   update public.salas set pozo=pozo+pago where id=s.id;
  end loop;
 else update public.salas set apuesta_actual=0 where id=s.id;
 end if;
 perform public.avanzar_apuestas(s.id,bb);
end $$;

create or replace function public.accion_mesa(p_sala uuid,p_accion text,p_datos jsonb,p_solicitud text) returns public.salas
language plpgsql security definer set search_path='' as $$
declare s public.salas; j public.jugadores; anterior public.operaciones_mesa; tipo text; objetivo bigint; pago bigint:=0; incremento bigint; total bigint:=0; capa jsonb; entrega jsonb; premio jsonb; destino uuid; total_capa bigint; capas jsonb;
begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 if p_solicitud is null or length(p_solicitud) not between 8 and 160 or p_datos is null then raise exception 'DATOS_INVALIDOS'; end if;
 select * into s from public.salas where id=p_sala for update;
 if not found then raise exception 'SALA_NO_EXISTE'; end if;
 select * into j from public.jugadores where sala_id=s.id and user_id=auth.uid();
 if not found then raise exception 'NO_PERTENECES'; end if;
 select * into anterior from public.operaciones_mesa where solicitud=p_solicitud;
 if found then
  if anterior.sala_id<>s.id or anterior.user_id<>auth.uid() or anterior.accion<>p_accion or anterior.datos<>p_datos then raise exception 'SOLICITUD_INVALIDA'; end if;
  return s;
 end if;
 if p_accion not in ('apostar','cerrar_mano','turno_fisico') then
  s:=public.accion_mesa_v1(p_sala,p_accion,p_datos,p_solicitud);
  if p_accion='ordenar' then update public.salas set boton_id=dealer_id where id=s.id; end if;
  if p_accion='iniciar' then perform public.preparar_apuestas(s.id,false); end if;
  if p_accion='fichas' and s.turno_id is not null and exists(select 1 from public.jugadores where id=s.turno_id and eliminado_en is not null) then perform public.avanzar_apuestas(s.id,s.turno_id); end if;
  select * into s from public.salas where id=p_sala; return s;
 end if;
 if (p_datos->>'mano')::integer is distinct from s.mano then raise exception 'MANO_CAMBIO'; end if;
 if p_accion in ('apostar','turno_fisico') then
  if s.estado<>'jugando' or s.calle='reparto' then raise exception 'ESTADO_INVALIDO'; end if;
  if (p_datos->>'calle') is distinct from s.calle or (p_datos->>'revision')::bigint is distinct from s.revision then raise exception 'MANO_CAMBIO'; end if;
  if p_accion='turno_fisico' then
   if j.id is distinct from s.dealer_id then raise exception 'SOLO_DEALER'; end if;
   if s.configuracion#>>'{fichas,tipo}'<>'fisicas' then raise exception 'ESTADO_INVALIDO'; end if;
   if coalesce(p_datos->>'tipo','') not in ('pasar','subir','retirarse') then raise exception 'ACCION_INVALIDA'; end if;
   if p_datos->>'tipo'='retirarse' then update public.jugadores set retirado=true where id=s.turno_id; end if;
   update public.salas set pendientes=array_remove(pendientes,s.turno_id) where id=s.id;
   if p_datos->>'tipo'='subir' then update public.salas set pendientes=array(select id from public.jugadores where sala_id=s.id and id<>s.turno_id and eliminado_en is null and not retirado and fichas>0) where id=s.id; end if;
   perform public.avanzar_apuestas(s.id,s.turno_id);
  else
   if s.configuracion#>>'{fichas,tipo}'<>'virtuales' then raise exception 'ESTADO_INVALIDO'; end if;
   if j.id is distinct from s.turno_id then raise exception 'TURNO_AJENO'; end if;
   tipo:=p_datos->>'tipo'; objetivo:=j.aporte_calle;
   if tipo='retirarse' then update public.jugadores set retirado=true where id=j.id;
   elsif tipo='pasar' then if j.aporte_calle<s.apuesta_actual then raise exception 'APUESTA_PENDIENTE'; end if;
   elsif tipo='igualar' then objetivo:=least(j.aporte_calle+j.fichas,s.apuesta_actual);
   elsif tipo='allin' then objetivo:=j.aporte_calle+j.fichas;
   elsif tipo='subir' then
    if coalesce(p_datos->>'monto','') !~ '^[0-9]+$' then raise exception 'MONTO_INVALIDO'; end if;
    objetivo:=(p_datos->>'monto')::bigint;
    if objetivo<=s.apuesta_actual then raise exception 'SUBIDA_INVALIDA'; end if;
   else raise exception 'ACCION_INVALIDA'; end if;
   if objetivo>j.aporte_calle+j.fichas or objetivo<j.aporte_calle then raise exception 'MONTO_INVALIDO'; end if;
   if objetivo>s.apuesta_actual then
    if j.apuesta_al_actuar is not null and s.apuesta_actual-j.apuesta_al_actuar<s.subida_minima then raise exception 'SUBIDA_NO_REABIERTA'; end if;
    if not exists(select 1 from public.jugadores where sala_id=s.id and id<>j.id and not retirado and eliminado_en is null and fichas>0) then raise exception 'SUBIDA_INVALIDA'; end if;
    incremento:=objetivo-s.apuesta_actual;
    if incremento<s.subida_minima and objetivo<>j.aporte_calle+j.fichas then raise exception 'SUBIDA_INVALIDA'; end if;
    update public.salas set apuesta_actual=objetivo,subida_minima=case when incremento>=s.subida_minima then incremento else subida_minima end,
     pendientes=array(select id from public.jugadores where sala_id=s.id and id<>j.id and not retirado and eliminado_en is null and fichas>0) where id=s.id;
   end if;
   pago:=objetivo-j.aporte_calle;
   update public.jugadores set fichas=fichas-pago,aporte_calle=objetivo,apuesta_mano=apuesta_mano+pago,apuesta_al_actuar=greatest(objetivo,s.apuesta_actual) where id=j.id;
   update public.salas set pozo=pozo+pago,pendientes=array_remove(pendientes,j.id) where id=s.id;
   perform public.avanzar_apuestas(s.id,j.id);
  end if;
 else
  if j.id is distinct from s.dealer_id then raise exception 'SOLO_DEALER'; end if;
  if s.estado not in ('jugando','pausado') then raise exception 'ESTADO_INVALIDO'; end if;
  if s.calle<>'reparto' then raise exception 'APUESTAS_ABIERTAS'; end if;
  if (p_datos->>'pozo')::bigint is distinct from s.pozo then raise exception 'MANO_CAMBIO'; end if;
  if s.configuracion#>>'{fichas,tipo}'='virtuales' then
   capas:=public.pozos_mesa(s.id);
   if jsonb_typeof(p_datos->'pozos') is distinct from 'array' then raise exception 'REPARTO_INVALIDO'; end if;
   if jsonb_array_length(p_datos->'pozos')<>jsonb_array_length(capas) then raise exception 'REPARTO_INVALIDO'; end if;
   for capa in select * from jsonb_array_elements(capas) loop
    if (select count(*) from jsonb_array_elements(p_datos->'pozos') x where x->>'tope'=capa->>'tope')<>1 then raise exception 'REPARTO_INVALIDO'; end if;
    select x into entrega from jsonb_array_elements(p_datos->'pozos') x where x->>'tope'=capa->>'tope';
    if jsonb_typeof(entrega->'premios') is distinct from 'array' then raise exception 'REPARTO_INVALIDO'; end if;
    total_capa:=0;
    for premio in select * from jsonb_array_elements(entrega->'premios') loop
     if coalesce(premio->>'monto','') !~ '^[0-9]+$' then raise exception 'REPARTO_INVALIDO'; end if;
     pago:=(premio->>'monto')::bigint; destino:=(premio->>'jugador')::uuid;
     if pago<0 or pago>(capa->>'monto')::bigint or not (capa->'elegibles') @> jsonb_build_array(destino) then raise exception 'REPARTO_INVALIDO'; end if;
     update public.jugadores set fichas=fichas+pago where id=destino;
     total_capa:=total_capa+pago;
    end loop;
    if total_capa<>(capa->>'monto')::bigint then raise exception 'REPARTO_INVALIDO'; end if;
    total:=total+total_capa;
   end loop;
   if total<>s.pozo then raise exception 'REPARTO_INVALIDO'; end if;
   update public.jugadores set eliminado_en=case when fichas=0 then now() else null end where sala_id=s.id;
  end if;
  update public.salas set mano=mano+1,pozo=0 where id=s.id;
  perform public.preparar_apuestas(s.id,true);
 end if;
 update public.salas set revision=revision+1 where id=s.id returning * into s;
 insert into public.operaciones_mesa(solicitud,sala_id,user_id,accion,datos) values(p_solicitud,s.id,auth.uid(),p_accion,p_datos);
 return s;
end $$;
revoke all on function public.pozos_mesa(uuid),public.avanzar_apuestas(uuid,uuid),public.preparar_apuestas(uuid,boolean),public.accion_mesa(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.accion_mesa(uuid,text,jsonb,text) to authenticated;
notify pgrst,'reload schema';
commit;
