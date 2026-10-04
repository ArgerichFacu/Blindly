-- Blindly Plus: ligas privadas, temporadas y ranking derivado de resultados.
-- Las partidas normales siguen siendo gratuitas; solo las operaciones de
-- administración de una liga exigen un entitlement verificado en servidor.
begin;

create table public.accesos_plus (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activo boolean not null default false,
  entitlement text not null default 'blindly_plus'
    check (entitlement = 'blindly_plus'),
  vence_en timestamptz,
  verificado_en timestamptz not null default pg_catalog.now(),
  entorno text not null default 'production'
    check (entorno in ('production', 'sandbox', 'unknown'))
);

create table public.ligas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 2 and 50),
  owner_id uuid not null references auth.users(id) on delete cascade,
  estado text not null default 'activa'
    check (estado in ('activa', 'archivada')),
  creada_en timestamptz not null default pg_catalog.now(),
  actualizada_en timestamptz not null default pg_catalog.now()
);

create table public.liga_temporadas (
  id uuid primary key default gen_random_uuid(),
  liga_id uuid not null references public.ligas(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 2 and 50),
  estado text not null default 'activa'
    check (estado in ('activa', 'finalizada')),
  inicio date not null default current_date,
  fin date,
  creada_en timestamptz not null default pg_catalog.now(),
  check (fin is null or fin >= inicio)
);

create unique index liga_temporada_activa_unica
  on public.liga_temporadas(liga_id)
  where estado = 'activa';

create table public.liga_miembros (
  liga_id uuid not null references public.ligas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 30),
  activo boolean not null default true,
  unido_en timestamptz not null default pg_catalog.now(),
  primary key (liga_id, user_id)
);

create table public.liga_partidas (
  sala_id uuid primary key,
  temporada_id uuid not null references public.liga_temporadas(id) on delete restrict,
  codigo_sala text not null,
  creada_en timestamptz not null default pg_catalog.now(),
  iniciada_en timestamptz,
  finalizada_en timestamptz,
  duracion_ms bigint check (duracion_ms is null or duracion_ms >= 0),
  jugadores integer check (jugadores is null or jugadores between 2 and 10)
);

create index ligas_owner_idx on public.ligas(owner_id, estado);
create index liga_miembros_usuario_idx
  on public.liga_miembros(user_id, activo, liga_id);
create index liga_temporadas_liga_idx
  on public.liga_temporadas(liga_id, inicio desc);
create index liga_partidas_temporada_idx
  on public.liga_partidas(temporada_id, finalizada_en desc);

alter table public.salas
  add column temporada_id uuid references public.liga_temporadas(id) on delete set null;

alter table public.puntuacion_partidas
  add column temporada_id uuid references public.liga_temporadas(id) on delete set null,
  add column nombre_jugador text,
  add column duracion_ms bigint;

alter table public.puntuacion_partidas
  add constraint puntuacion_nombre_jugador_valido
    check (nombre_jugador is null or char_length(trim(nombre_jugador)) between 1 and 30),
  add constraint puntuacion_duracion_valida
    check (duracion_ms is null or duracion_ms >= 0);

create index puntuacion_temporada_idx
  on public.puntuacion_partidas(temporada_id, finalizada_en, puntos desc)
  where temporada_id is not null and finalizada_en is not null;

alter table public.accesos_plus enable row level security;
alter table public.ligas enable row level security;
alter table public.liga_temporadas enable row level security;
alter table public.liga_miembros enable row level security;
alter table public.liga_partidas enable row level security;

revoke all on table public.accesos_plus from public, anon, authenticated;
revoke all on table public.ligas from public, anon, authenticated;
revoke all on table public.liga_temporadas from public, anon, authenticated;
revoke all on table public.liga_miembros from public, anon, authenticated;
revoke all on table public.liga_partidas from public, anon, authenticated;

grant select on table public.ligas, public.liga_temporadas,
  public.liga_miembros, public.liga_partidas to authenticated;
grant select, insert, update, delete on table public.accesos_plus to service_role;

create or replace function private.tiene_plus(p_usuario uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.accesos_plus a
    where a.user_id = p_usuario
      and a.activo
      and a.verificado_en >= pg_catalog.now() - interval '15 minutes'
      and (a.vence_en is null or a.vence_en > pg_catalog.now())
  );
$$;

create or replace function private.exigir_plus(p_usuario uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.tiene_plus(p_usuario) then
    raise exception 'PLUS_REQUERIDO';
  end if;
end;
$$;

create or replace function private.puede_ver_liga(p_liga uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.ligas l
    where l.id = p_liga and l.owner_id = auth.uid()
  ) or exists (
    select 1 from public.liga_miembros m
    where m.liga_id = p_liga and m.user_id = auth.uid() and m.activo
  );
$$;

revoke all on function private.tiene_plus(uuid),
  private.exigir_plus(uuid), private.puede_ver_liga(uuid)
  from public, anon, authenticated;
grant execute on function private.puede_ver_liga(uuid) to authenticated;

create policy "miembros ven ligas" on public.ligas
  for select to authenticated
  using (private.puede_ver_liga(ligas.id));

create policy "miembros ven temporadas" on public.liga_temporadas
  for select to authenticated
  using (private.puede_ver_liga(liga_temporadas.liga_id));

create policy "miembros ven miembros" on public.liga_miembros
  for select to authenticated
  using (private.puede_ver_liga(liga_miembros.liga_id));

create policy "miembros ven partidas" on public.liga_partidas
  for select to authenticated
  using (
    private.puede_ver_liga((
      select t.liga_id from public.liga_temporadas t
      where t.id = liga_partidas.temporada_id
    ))
  );

create or replace function public.mi_estado_plus()
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select case
    when auth.uid() is null then pg_catalog.jsonb_build_object('activo', false)
    else pg_catalog.jsonb_build_object(
      'activo', private.tiene_plus(auth.uid()),
      'vence_en', a.vence_en,
      'verificado_en', a.verificado_en
    )
  end
  from (select 1) base
  left join public.accesos_plus a on a.user_id = auth.uid();
$$;

create or replace function public.crear_liga(
  p_nombre text,
  p_temporada text,
  p_nombre_owner text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_liga public.ligas;
  v_temporada public.liga_temporadas;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  if char_length(trim(coalesce(p_nombre, ''))) not between 2 and 50
    or char_length(trim(coalesce(p_temporada, ''))) not between 2 and 50
    or char_length(trim(coalesce(p_nombre_owner, ''))) not between 1 and 30
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  insert into public.ligas(nombre, owner_id)
  values (trim(p_nombre), auth.uid()) returning * into v_liga;
  insert into public.liga_miembros(liga_id, user_id, nombre)
  values (v_liga.id, auth.uid(), trim(p_nombre_owner));
  insert into public.liga_temporadas(liga_id, nombre)
  values (v_liga.id, trim(p_temporada)) returning * into v_temporada;

  return pg_catalog.jsonb_build_object(
    'liga_id', v_liga.id,
    'temporada_id', v_temporada.id
  );
end;
$$;

create or replace function public.actualizar_liga(
  p_liga uuid,
  p_nombre text,
  p_archivada boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  if char_length(trim(coalesce(p_nombre, ''))) not between 2 and 50
  then raise exception 'DATOS_INVALIDOS'; end if;
  update public.ligas
  set nombre = trim(p_nombre),
      estado = case when p_archivada then 'archivada' else 'activa' end,
      actualizada_en = pg_catalog.now()
  where id = p_liga and owner_id = auth.uid();
  if not found then raise exception 'SOLO_OWNER'; end if;
end;
$$;

create or replace function public.crear_temporada(
  p_liga uuid,
  p_nombre text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  if char_length(trim(coalesce(p_nombre, ''))) not between 2 and 50
  then raise exception 'DATOS_INVALIDOS'; end if;
  if not exists (
    select 1 from public.ligas
    where id = p_liga and owner_id = auth.uid() and estado = 'activa'
  ) then raise exception 'SOLO_OWNER'; end if;
  if exists (
    select 1 from public.liga_temporadas
    where liga_id = p_liga and estado = 'activa'
  ) then raise exception 'TEMPORADA_ACTIVA'; end if;
  insert into public.liga_temporadas(liga_id, nombre)
  values (p_liga, trim(p_nombre)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.finalizar_temporada(p_temporada uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  update public.liga_temporadas t
  set estado = 'finalizada', fin = current_date
  from public.ligas l
  where t.id = p_temporada and l.id = t.liga_id
    and l.owner_id = auth.uid() and t.estado = 'activa'
    and not exists (
      select 1 from public.liga_partidas p
      join public.salas s on s.id = p.sala_id
      where p.temporada_id = t.id
        and s.estado in ('esperando', 'jugando', 'pausado')
    );
  if not found then raise exception 'TEMPORADA_NO_FINALIZABLE'; end if;
end;
$$;

create or replace function public.quitar_miembro(
  p_liga uuid,
  p_usuario uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  if exists (
    select 1 from public.ligas
    where id = p_liga and owner_id = p_usuario
  ) then raise exception 'OWNER_REQUERIDO'; end if;
  update public.liga_miembros m
  set activo = false
  from public.ligas l
  where m.liga_id = p_liga and m.user_id = p_usuario
    and l.id = m.liga_id and l.owner_id = auth.uid();
  if not found then raise exception 'SOLO_OWNER'; end if;
end;
$$;

create or replace function public.mis_ligas()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare v_resultado jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'id', l.id,
    'nombre', l.nombre,
    'estado', l.estado,
    'soy_owner', l.owner_id = auth.uid(),
    'temporada', (
      select pg_catalog.jsonb_build_object('id', t.id, 'nombre', t.nombre, 'estado', t.estado)
      from public.liga_temporadas t where t.liga_id = l.id
      order by (t.estado = 'activa') desc, t.inicio desc, t.creada_en desc limit 1
    ),
    'miembros', (select count(*) from public.liga_miembros m where m.liga_id = l.id and m.activo),
    'ultima_partida', (
      select p.finalizada_en from public.liga_partidas p
      join public.liga_temporadas t on t.id = p.temporada_id
      where t.liga_id = l.id and p.finalizada_en is not null
      order by p.finalizada_en desc limit 1
    )
  ) order by l.estado, l.actualizada_en desc), '[]'::jsonb)
  into v_resultado
  from public.ligas l
  where private.puede_ver_liga(l.id);
  return v_resultado;
end;
$$;

create or replace function public.mis_temporadas_propias()
returns table(
  liga_id uuid,
  liga_nombre text,
  temporada_id uuid,
  temporada_nombre text,
  plus_activo boolean
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  return query
  select l.id, l.nombre, t.id, t.nombre, private.tiene_plus(auth.uid())
  from public.ligas l
  join public.liga_temporadas t on t.liga_id = l.id and t.estado = 'activa'
  where l.owner_id = auth.uid() and l.estado = 'activa'
  order by l.nombre, t.inicio desc;
end;
$$;

create or replace function public.ranking_liga(p_temporada uuid)
returns table(
  posicion bigint,
  user_id uuid,
  nombre text,
  partidas bigint,
  victorias bigint,
  podios bigint,
  puntos numeric,
  posicion_media numeric
)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare v_liga uuid;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  select t.liga_id into v_liga from public.liga_temporadas t where t.id = p_temporada;
  if v_liga is null or not private.puede_ver_liga(v_liga)
  then raise exception 'LIGA_NO_DISPONIBLE'; end if;
  return query
  with totales as (
    select r.user_id,
      coalesce(max(m.nombre), max(r.nombre_jugador), 'Jugador') as nombre,
      count(*)::bigint as partidas,
      count(*) filter (where r.puesto = 1)::bigint as victorias,
      count(*) filter (where r.puesto <= 3)::bigint as podios,
      coalesce(sum(r.puntos), 0)::numeric as puntos,
      round(avg(r.puesto)::numeric, 2) as posicion_media
    from public.puntuacion_partidas r
    left join public.liga_miembros m
      on m.liga_id = v_liga and m.user_id = r.user_id
    where r.temporada_id = p_temporada and r.finalizada_en is not null
    group by r.user_id
  )
  select rank() over (
      order by t.puntos desc, t.victorias desc, t.podios desc,
        t.posicion_media asc, t.nombre asc
    ),
    t.user_id, t.nombre, t.partidas, t.victorias, t.podios,
    t.puntos, t.posicion_media
  from totales t
  order by 1, t.nombre;
end;
$$;

create or replace function public.detalle_liga(
  p_liga uuid,
  p_temporada uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_liga public.ligas;
  v_temporada public.liga_temporadas;
  v_resultado jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  select * into v_liga from public.ligas where id = p_liga;
  if not found or not private.puede_ver_liga(p_liga)
  then raise exception 'LIGA_NO_DISPONIBLE'; end if;

  if p_temporada is not null then
    select * into v_temporada from public.liga_temporadas
    where id = p_temporada and liga_id = p_liga;
    if not found then raise exception 'TEMPORADA_NO_EXISTE'; end if;
  else
    select * into v_temporada from public.liga_temporadas
    where liga_id = p_liga
    order by (estado = 'activa') desc, inicio desc, creada_en desc limit 1;
  end if;

  select pg_catalog.jsonb_build_object(
    'liga', pg_catalog.jsonb_build_object(
      'id', v_liga.id, 'nombre', v_liga.nombre, 'estado', v_liga.estado,
      'soy_owner', v_liga.owner_id = auth.uid(),
      'puede_administrar', v_liga.owner_id = auth.uid()
        and private.tiene_plus(auth.uid())
    ),
    'temporada', case when v_temporada.id is null then null else pg_catalog.to_jsonb(v_temporada) end,
    'temporadas', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(t) order by t.inicio desc, t.creada_en desc)
      from public.liga_temporadas t where t.liga_id = p_liga
    ), '[]'::jsonb),
    'ranking', case when v_temporada.id is null then '[]'::jsonb else coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(r) order by r.posicion, r.nombre)
      from public.ranking_liga(v_temporada.id) r
    ), '[]'::jsonb) end,
    'partidas', case when v_temporada.id is null then '[]'::jsonb else coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'sala_id', p.sala_id, 'codigo_sala', p.codigo_sala,
        'finalizada_en', p.finalizada_en, 'duracion_ms', p.duracion_ms,
        'jugadores', p.jugadores,
        'ganador', (
          select r.nombre_jugador from public.puntuacion_partidas r
          where r.sala_id = p.sala_id and r.puesto = 1
          order by r.nombre_jugador limit 1
        )
      ) order by p.finalizada_en desc)
      from public.liga_partidas p
      where p.temporada_id = v_temporada.id and p.finalizada_en is not null
    ), '[]'::jsonb) end,
    'miembros', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'user_id', m.user_id, 'nombre', m.nombre,
        'activo', m.activo, 'owner', m.user_id = v_liga.owner_id
      ) order by (m.user_id = v_liga.owner_id) desc, m.nombre)
      from public.liga_miembros m where m.liga_id = p_liga and m.activo
    ), '[]'::jsonb)
  ) into v_resultado;
  return v_resultado;
end;
$$;

create or replace function public.crear_sala(
  p_niveles jsonb,
  p_temporada uuid default null
) returns public.salas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sala public.salas;
  v_temporada public.liga_temporadas;
  v_liga public.ligas;
  v_codigo text;
  v_intento integer;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  if p_niveles is null or pg_catalog.jsonb_typeof(p_niveles) <> 'array'
  then raise exception 'DATOS_INVALIDOS'; end if;

  if p_temporada is not null then
    select * into v_temporada from public.liga_temporadas
    where id = p_temporada for update;
    if not found or v_temporada.estado <> 'activa'
    then raise exception 'TEMPORADA_NO_EXISTE'; end if;
    select * into v_liga from public.ligas where id = v_temporada.liga_id;
    if v_liga.owner_id <> auth.uid() then raise exception 'SOLO_OWNER'; end if;
    if v_liga.estado <> 'activa' then raise exception 'LIGA_ARCHIVADA'; end if;
    perform private.exigir_plus(auth.uid());
  end if;

  for v_intento in 1..8 loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      floor(random() * 32)::integer + 1, 1), '')
    into v_codigo from generate_series(1, 5);
    begin
      insert into public.salas(codigo, host_id, niveles, temporada_id)
      values (v_codigo, auth.uid(), p_niveles, p_temporada)
      returning * into v_sala;
      exit;
    exception when unique_violation then
      v_sala := null;
    end;
  end loop;
  if v_sala.id is null then raise exception 'CODIGO_NO_DISPONIBLE'; end if;

  if p_temporada is not null then
    insert into public.liga_partidas(sala_id, temporada_id, codigo_sala)
    values (v_sala.id, p_temporada, v_sala.codigo);
  end if;
  return v_sala;
end;
$$;

do $$
begin
  if pg_catalog.to_regprocedure(
    'public.accion_mesa_sin_ligas(uuid,text,jsonb,text)'
  ) is null then
    alter function public.accion_mesa(uuid,text,jsonb,text)
      rename to accion_mesa_sin_ligas;
  end if;
end;
$$;

revoke all on function public.accion_mesa_sin_ligas(uuid,text,jsonb,text)
  from public, anon, authenticated;

create or replace function public.accion_mesa(
  p_sala uuid,
  p_accion text,
  p_datos jsonb,
  p_solicitud text
) returns public.salas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sala public.salas;
  v_repetida boolean;
  v_liga uuid;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  if p_accion = 'iniciar' and exists (
    select 1
    from public.salas s
    join public.liga_temporadas t on t.id = s.temporada_id
    where s.id = p_sala and t.estado <> 'activa'
  ) then
    raise exception 'TEMPORADA_NO_FINALIZABLE';
  end if;
  if p_accion = 'iniciar' and exists (
    select 1 from public.salas s
    where s.id = p_sala and s.temporada_id is not null
  ) then
    perform private.exigir_plus(auth.uid());
  end if;
  select exists (
    select 1 from public.operaciones_mesa where solicitud = p_solicitud
  ) into v_repetida;

  v_sala := public.accion_mesa_sin_ligas(
    p_sala, p_accion, p_datos, p_solicitud
  );
  if v_repetida or v_sala.temporada_id is null then return v_sala; end if;

  select t.liga_id into v_liga
  from public.liga_temporadas t where t.id = v_sala.temporada_id;

  if p_accion = 'iniciar' then
    insert into public.liga_miembros(liga_id, user_id, nombre, activo)
    select v_liga, j.user_id, j.nombre, true
    from public.jugadores j where j.sala_id = v_sala.id
    on conflict (liga_id, user_id) do update
      set nombre = excluded.nombre, activo = true;

    update public.puntuacion_partidas r
    set temporada_id = v_sala.temporada_id,
        nombre_jugador = j.nombre
    from public.jugadores j
    where r.sala_id = v_sala.id and j.id = r.jugador_id;

    update public.liga_partidas
    set iniciada_en = pg_catalog.now(),
        jugadores = (select count(*) from public.jugadores where sala_id = v_sala.id)
    where sala_id = v_sala.id;
  end if;

  if p_accion = 'cerrar_mano' and v_sala.estado = 'finalizada' then
    update public.puntuacion_partidas
    set duracion_ms = v_sala.acumulado_ms
    where sala_id = v_sala.id and finalizada_en is not null;
    update public.liga_partidas
    set finalizada_en = coalesce((
          select max(finalizada_en) from public.puntuacion_partidas
          where sala_id = v_sala.id
        ), pg_catalog.now()),
        duracion_ms = v_sala.acumulado_ms,
        jugadores = (select count(*) from public.jugadores where sala_id = v_sala.id)
    where sala_id = v_sala.id;
  end if;
  return v_sala;
end;
$$;

revoke all on function public.mi_estado_plus(),
  public.crear_liga(text,text,text),
  public.actualizar_liga(uuid,text,boolean),
  public.crear_temporada(uuid,text),
  public.finalizar_temporada(uuid),
  public.quitar_miembro(uuid,uuid),
  public.mis_ligas(), public.mis_temporadas_propias(),
  public.ranking_liga(uuid), public.detalle_liga(uuid,uuid),
  public.crear_sala(jsonb,uuid),
  public.accion_mesa(uuid,text,jsonb,text)
  from public, anon, authenticated;

grant execute on function public.mi_estado_plus(),
  public.crear_liga(text,text,text),
  public.actualizar_liga(uuid,text,boolean),
  public.crear_temporada(uuid,text),
  public.finalizar_temporada(uuid),
  public.quitar_miembro(uuid,uuid),
  public.mis_ligas(), public.mis_temporadas_propias(),
  public.ranking_liga(uuid), public.detalle_liga(uuid,uuid),
  public.crear_sala(jsonb,uuid),
  public.accion_mesa(uuid,text,jsonb,text)
  to authenticated;

commit;

notify pgrst, 'reload schema';
