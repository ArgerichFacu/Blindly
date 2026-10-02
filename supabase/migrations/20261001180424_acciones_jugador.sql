create table salas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  host_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  niveles jsonb not null,
  estado text not null default 'esperando',
  creada_en timestamptz not null default now()
);

alter table salas enable row level security;

grant select, insert, update, delete on public.salas to authenticated;

create policy "ver salas" on salas
  for select to authenticated using (true);

create policy "crear sala propia" on salas
  for insert to authenticated with check (host_id = (select auth.uid()));

create policy "editar sala propia" on salas
  for update to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()));

create policy "borrar sala propia" on salas
  for delete to authenticated using (host_id = (select auth.uid()));

alter publication supabase_realtime add table salas;
create table jugadores (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid not null references salas(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 30),
  unido_en timestamptz not null default now(),
  unique (sala_id, user_id)
);

alter table jugadores enable row level security;

grant select, insert, update, delete on public.jugadores to authenticated;

create policy "ver jugadores propios o de mi sala" on jugadores
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from salas s
      where s.id = jugadores.sala_id and s.host_id = (select auth.uid())
    )
  );

create policy "unirme yo mismo" on jugadores
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "cambiar mi nombre" on jugadores
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "salir de la sala" on jugadores
  for delete to authenticated
  using (user_id = (select auth.uid()));

alter publication supabase_realtime add table jugadores;
alter table salas
  add column if not exists nivel_indice int not null default 0,
  add column if not exists acumulado_ms bigint not null default 0,
  add column if not exists inicio_en timestamptz;

create or replace function hora_servidor()
returns timestamptz
language sql
stable
as $$ select now(); $$;

grant execute on function hora_servidor() to authenticated;
alter table jugadores
  add column if not exists fichas bigint not null default 0,
  add column if not exists eliminado_en timestamptz;

create policy "host da fichas" on jugadores
  for update to authenticated
  using (
    exists (
      select 1 from salas s
      where s.id = jugadores.sala_id and s.host_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from salas s
      where s.id = jugadores.sala_id and s.host_id = (select auth.uid())
    )
  );
create policy "ver jugadores de mi sala" on jugadores
  for select to authenticated
  using (
    exists (
      select 1 from jugadores yo
      where yo.sala_id = jugadores.sala_id and yo.user_id = (select auth.uid())
    )
  );
create or replace function soy_jugador_de(sala_id_param uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from jugadores
    where jugadores.sala_id = sala_id_param
      and jugadores.user_id = auth.uid()
  );
$$;

grant execute on function soy_jugador_de(uuid) to authenticated;

drop policy if exists "ver jugadores de mi sala" on jugadores;

create policy "ver jugadores de mi sala" on jugadores
  for select to authenticated
  using (soy_jugador_de(jugadores.sala_id));
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
