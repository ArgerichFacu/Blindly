begin;
-- Cada jugador declara su propia acción en mesas con fichas físicas.
-- El dealer conserva en accion_mesa el permiso exclusivo para cerrar la mano.
create or replace function public.accion_mesa_v2(p_sala uuid,p_accion text,p_datos jsonb,p_solicitud text) returns public.salas
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
   if s.configuracion#>>'{fichas,tipo}'<>'fisicas' then raise exception 'ESTADO_INVALIDO'; end if;
   if j.id is distinct from s.turno_id then raise exception 'TURNO_AJENO'; end if;
   if coalesce(p_datos->>'tipo','') not in ('pasar','igualar','subir','retirarse') then raise exception 'ACCION_INVALIDA'; end if;
   if p_datos->>'tipo'='retirarse' then update public.jugadores set retirado=true where id=j.id; end if;
   update public.salas set pendientes=array_remove(pendientes,j.id) where id=s.id;
   if p_datos->>'tipo'='subir' then update public.salas set pendientes=array(select id from public.jugadores where sala_id=s.id and id<>j.id and eliminado_en is null and not retirado and fichas>0) where id=s.id; end if;
   perform public.avanzar_apuestas(s.id,j.id);
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

revoke all on function public.accion_mesa_v2(uuid,text,jsonb,text) from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
