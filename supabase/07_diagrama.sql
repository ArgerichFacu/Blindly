-- Ejecutar después de 01..06. Todas las operaciones de una mesa se serializan
-- bloqueando su sala. Ningún cliente puede modificar balances directamente.
begin;
alter table public.salas
  add column if not exists configuracion jsonb not null default '{}',
  add column if not exists orden uuid[] not null default '{}',
  add column if not exists dealer_id uuid,
  add column if not exists mano integer not null default 0,
  add column if not exists pozo bigint not null default 0,
  add column if not exists revision bigint not null default 0;
alter table public.jugadores add column if not exists apuesta_mano bigint not null default 0;

create table if not exists public.operaciones_mesa (
  solicitud text primary key, sala_id uuid not null references public.salas on delete cascade,
  user_id uuid not null, accion text not null, datos jsonb not null,
  creada_en timestamptz not null default now()
);
alter table public.operaciones_mesa enable row level security;
revoke all on public.operaciones_mesa from anon, authenticated;
revoke all on public.jugadores from anon, authenticated;
revoke all on public.salas from anon, authenticated;
grant select on public.jugadores, public.salas to authenticated;
grant delete on public.salas to authenticated;
grant insert(codigo, host_id, niveles) on public.salas to authenticated;

create or replace function public.unirse_mesa(p_codigo text, p_nombre text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare s public.salas; j public.jugadores;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  if p_nombre is null or length(trim(p_nombre)) not between 1 and 30 then raise exception 'NOMBRE_INVALIDO'; end if;
  select * into s from public.salas where codigo = upper(trim(p_codigo)) for update;
  if not found then raise exception 'SALA_NO_EXISTE'; end if;
  select * into j from public.jugadores where sala_id=s.id and user_id=auth.uid();
  if found then
    update public.jugadores set nombre=trim(p_nombre) where id=j.id returning * into j;
  else
    if s.estado <> 'esperando' then raise exception 'PARTIDA_INICIADA'; end if;
    if (select count(*) from public.jugadores where sala_id=s.id) >= 10 then raise exception 'SALA_LLENA'; end if;
    insert into public.jugadores(sala_id,user_id,nombre) values(s.id,auth.uid(),trim(p_nombre)) returning * into j;
    -- Una incorporación exige que el host confirme de nuevo los asientos.
    update public.salas set orden='{}',dealer_id=null,revision=revision+1 where id=s.id returning * into s;
  end if;
  return jsonb_build_object('sala',to_jsonb(s),'jugadorId',j.id);
end $$;

create or replace function public.accion_mesa(p_sala uuid, p_accion text, p_datos jsonb, p_solicitud text)
returns public.salas language plpgsql security definer set search_path = '' as $$
declare
  s public.salas; j public.jugadores; anterior public.operaciones_mesa;
  ordenado uuid[]; vivos uuid[]; destino uuid; elemento jsonb;
  configuracion_validada jsonb; fichas_validadas jsonb; niveles_validados jsonb; cantidad integer;
  monto bigint; total bigint:=0; stack_inicial bigint:=0; indice integer;
  valores bigint[]:='{}'; valor bigint; unidades bigint; indice_dealer integer;
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
  if p_accion in ('ordenar','configurar','iniciar','comenzar','pausar','saltar','fichas') and s.host_id<>auth.uid() then raise exception 'SOLO_HOST'; end if;

  case p_accion
  when 'ordenar' then
    if s.estado<>'esperando' then raise exception 'PARTIDA_INICIADA'; end if;
    select array_agg(x::uuid) into ordenado from jsonb_array_elements_text(p_datos->'orden') x;
    select count(*) into cantidad from public.jugadores where sala_id=s.id;
    if coalesce(cardinality(ordenado),0)<>cantidad or cantidad not between 1 and 10
      or (select count(distinct x) from unnest(ordenado) x)<>cantidad
      or exists(select 1 from unnest(ordenado) x where not exists(select 1 from public.jugadores where id=x and sala_id=s.id))
    then raise exception 'ORDEN_INVALIDO'; end if;
    destino := (p_datos->>'dealer')::uuid;
    if destino is null or not destino=any(ordenado) then raise exception 'DEALER_INVALIDO'; end if;
    update public.salas set orden=ordenado,dealer_id=destino where id=s.id;

  when 'configurar' then
    if s.estado<>'esperando' then raise exception 'PARTIDA_INICIADA'; end if;
    if p_datos->>'seccion' not in ('fichas','modo','musica') or p_datos->>'seccion' is null then raise exception 'DATOS_INVALIDOS'; end if;
    update public.salas set configuracion=jsonb_set(configuracion,array[p_datos->>'seccion'],p_datos->'valor') where id=s.id;

  when 'iniciar' then
    if s.estado<>'esperando' then raise exception 'PARTIDA_INICIADA'; end if;
    select count(*) into cantidad from public.jugadores where sala_id=s.id;
    if cantidad not between 2 and 10 then raise exception 'JUGADORES_INVALIDOS'; end if;
    if cardinality(s.orden)<>cantidad or s.dealer_id is null or not s.dealer_id=any(s.orden)
      or exists(select 1 from public.jugadores where sala_id=s.id and not id=any(s.orden)) then raise exception 'ORDEN_INVALIDO'; end if;
    configuracion_validada:=s.configuracion; fichas_validadas:=configuracion_validada->'fichas'; niveles_validados:=configuracion_validada#>'{modo,niveles}';
    if coalesce(fichas_validadas->>'tipo','') not in ('fisicas','virtuales')
      or coalesce(configuracion_validada#>>'{modo,id}','') not in ('turbo','regular','deep','personalizado') then raise exception 'CONFIGURACION_INCOMPLETA'; end if;
    if fichas_validadas->>'tipo'='fisicas' then
      if jsonb_typeof(fichas_validadas->'denominaciones') is distinct from 'array' then raise exception 'FICHAS_INVALIDAS'; end if;
      if jsonb_array_length(fichas_validadas->'denominaciones') not between 1 and 5 then raise exception 'FICHAS_INVALIDAS'; end if;
      for elemento in select * from jsonb_array_elements(fichas_validadas->'denominaciones') loop
        if coalesce(elemento->>'valor','') !~ '^[0-9]+$' or coalesce(elemento->>'cantidad','') !~ '^[0-9]+$' then raise exception 'FICHAS_INVALIDAS'; end if;
        valor:=(elemento->>'valor')::bigint; unidades:=(elemento->>'cantidad')::bigint;
        if valor not between 1 and 1000000 or unidades not between 0 and 1000000 or valor=any(valores) then raise exception 'FICHAS_INVALIDAS'; end if;
        valores:=array_append(valores,valor); stack_inicial:=stack_inicial+(unidades/cantidad)*valor;
      end loop;
    else
      if coalesce(fichas_validadas->>'stack','') !~ '^[0-9]+$' then raise exception 'FICHAS_INVALIDAS'; end if;
      stack_inicial:=(fichas_validadas->>'stack')::bigint;
    end if;
    if stack_inicial not between 1 and 1000000000 then raise exception 'FICHAS_INVALIDAS'; end if;
    if jsonb_typeof(niveles_validados) is distinct from 'array' then raise exception 'NIVELES_INVALIDOS'; end if;
    if jsonb_array_length(niveles_validados) not between 1 and 100 then raise exception 'NIVELES_INVALIDOS'; end if;
    cantidad:=0;
    for elemento in select * from jsonb_array_elements(niveles_validados) loop
      if (elemento->>'minutos') is null or (elemento->>'minutos')::numeric not between 0.25 and 180 then raise exception 'NIVELES_INVALIDOS'; end if;
      if coalesce((elemento->>'esBreak')::boolean,false)=false then
        if coalesce(elemento->>'smallBlind','') !~ '^[0-9]+$' or coalesce(elemento->>'bigBlind','') !~ '^[0-9]+$' then raise exception 'NIVELES_INVALIDOS'; end if;
        if (elemento->>'smallBlind')::bigint not between 1 and 1000000000 or (elemento->>'bigBlind')::bigint < (elemento->>'smallBlind')::bigint or (elemento->>'bigBlind')::bigint > 1000000000 then raise exception 'NIVELES_INVALIDOS'; end if;
        cantidad:=cantidad+1;
      end if;
    end loop;
    if cantidad=0 then raise exception 'NIVELES_INVALIDOS'; end if;
    update public.jugadores set fichas=stack_inicial,apuesta_mano=0,eliminado_en=null where sala_id=s.id;
    update public.salas set niveles=niveles_validados,estado='jugando',inicio_en=now(),acumulado_ms=0,nivel_indice=0,mano=1,pozo=0 where id=s.id;

  when 'comenzar' then
    if s.estado<>'pausado' then raise exception 'ESTADO_INVALIDO'; end if;
    update public.salas set estado='jugando',inicio_en=now() where id=s.id;
  when 'pausar' then
    if s.estado<>'jugando' then raise exception 'ESTADO_INVALIDO'; end if;
    update public.salas set estado='pausado',acumulado_ms=s.acumulado_ms+greatest(0,floor(extract(epoch from (now()-s.inicio_en))*1000))::bigint,inicio_en=null where id=s.id;
  when 'saltar' then
    if s.estado not in ('jugando','pausado') then raise exception 'ESTADO_INVALIDO'; end if;
    indice:=(p_datos->>'indice')::integer;
    if indice is null or indice<0 or indice>=jsonb_array_length(s.niveles) then raise exception 'NIVELES_INVALIDOS'; end if;
    select coalesce(sum((x->>'minutos')::numeric*60000),0)::bigint into total from jsonb_array_elements(s.niveles) with ordinality as e(x,n) where n<=indice;
    update public.salas set acumulado_ms=total,nivel_indice=indice,inicio_en=case when s.estado='jugando' then now() else null end where id=s.id;

  when 'apostar' then
    if s.estado<>'jugando' or s.configuracion#>>'{fichas,tipo}' is distinct from 'virtuales' then raise exception 'ESTADO_INVALIDO'; end if;
    if (p_datos->>'mano')::integer is distinct from s.mano then raise exception 'MANO_CAMBIO'; end if;
    if coalesce(p_datos->>'monto','') !~ '^[0-9]+$' then raise exception 'MONTO_INVALIDO'; end if;
    monto:=(p_datos->>'monto')::bigint;
    if monto<1 or monto>j.fichas or j.eliminado_en is not null then raise exception 'MONTO_INVALIDO'; end if;
    update public.jugadores set fichas=fichas-monto,apuesta_mano=apuesta_mano+monto where id=j.id;
    update public.salas set pozo=pozo+monto where id=s.id;

  when 'cerrar_mano' then
    if j.id is distinct from s.dealer_id then raise exception 'SOLO_DEALER'; end if;
    if s.estado not in ('jugando','pausado') then raise exception 'ESTADO_INVALIDO'; end if;
    if (p_datos->>'mano')::integer is distinct from s.mano or (p_datos->>'pozo')::bigint is distinct from s.pozo then raise exception 'MANO_CAMBIO'; end if;
    if s.configuracion#>>'{fichas,tipo}'='virtuales' then
      if jsonb_typeof(p_datos->'premios') is distinct from 'array' then raise exception 'REPARTO_INVALIDO'; end if;
      for elemento in select * from jsonb_array_elements(p_datos->'premios') loop
        destino:=(elemento->>'jugador')::uuid;
        if coalesce(elemento->>'monto','') !~ '^[0-9]+$' then raise exception 'REPARTO_INVALIDO'; end if;
        monto:=(elemento->>'monto')::bigint;
        if monto<0 or monto>s.pozo or not exists(select 1 from public.jugadores where id=destino and sala_id=s.id and eliminado_en is null) then raise exception 'REPARTO_INVALIDO'; end if;
        total:=total+monto;
        update public.jugadores set fichas=fichas+monto where id=destino;
      end loop;
      if total<>s.pozo then raise exception 'REPARTO_INVALIDO'; end if;
      update public.jugadores set eliminado_en=case when fichas=0 then now() else null end,apuesta_mano=0 where sala_id=s.id;
    end if;
    select array_agg(x order by n) into vivos from unnest(s.orden) with ordinality as o(x,n)
      join public.jugadores p on p.id=x where p.eliminado_en is null;
    indice_dealer:=array_position(s.orden,s.dealer_id);
    -- Busca el siguiente asiento activo, conservando la numeración original.
    for indice in 1..cardinality(s.orden) loop
      destino:=s.orden[1+((indice_dealer-1+indice)%cardinality(s.orden))];
      exit when destino=any(vivos);
    end loop;
    update public.salas set pozo=0,mano=mano+1,dealer_id=destino,
      estado=case when coalesce(cardinality(vivos),0)<2 then 'finalizada' else estado end,
      acumulado_ms=case when coalesce(cardinality(vivos),0)<2 and inicio_en is not null then acumulado_ms+greatest(0,floor(extract(epoch from (now()-inicio_en))*1000))::bigint else acumulado_ms end,
      inicio_en=case when coalesce(cardinality(vivos),0)<2 then null else inicio_en end where id=s.id;

  when 'fichas' then
    if s.configuracion#>>'{fichas,tipo}' is distinct from 'fisicas' or s.estado not in ('jugando','pausado') then raise exception 'ESTADO_INVALIDO'; end if;
    destino:=(p_datos->>'jugador')::uuid;
    if coalesce(p_datos->>'monto','') !~ '^[0-9]+$' then raise exception 'MONTO_INVALIDO'; end if;
    monto:=(p_datos->>'monto')::bigint;
    if monto not between 0 and 1000000000 then raise exception 'MONTO_INVALIDO'; end if;
    update public.jugadores set fichas=monto,eliminado_en=case when monto=0 then now() else null end where id=destino and sala_id=s.id;
    if not found then raise exception 'NO_PERTENECES'; end if;
  else raise exception 'ACCION_INVALIDA';
  end case;
  update public.salas set revision=revision+1 where id=s.id returning * into s;
  insert into public.operaciones_mesa(solicitud,sala_id,user_id,accion,datos) values(p_solicitud,s.id,auth.uid(),p_accion,p_datos);
  return s;
end $$;
revoke all on function public.unirse_mesa(text,text) from public;
revoke all on function public.accion_mesa(uuid,text,jsonb,text) from public;
grant execute on function public.unirse_mesa(text,text) to authenticated;
grant execute on function public.accion_mesa(uuid,text,jsonb,text) to authenticated;
notify pgrst, 'reload schema';
commit;
