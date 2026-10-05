-- Blindly Plus: mesas habituales, estadisticas privadas, head-to-head e historial.
-- Los resultados siguen siendo autoritativos en puntuacion_partidas y nunca se
-- aceptan puntos, puestos ni ganadores enviados directamente por el cliente.
begin;

create table public.mesas_habituales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 2 and 50),
  jugadores text[] not null default '{}',
  configuracion jsonb not null,
  tema_id text not null default 'verde'
    check (tema_id in ('verde', 'rojo', 'negro')),
  temporada_id uuid references public.liga_temporadas(id) on delete set null,
  creada_en timestamptz not null default pg_catalog.now(),
  actualizada_en timestamptz not null default pg_catalog.now(),
  check (cardinality(jugadores) between 0 and 10),
  check (pg_catalog.jsonb_typeof(configuracion) = 'object')
);

create index mesas_habituales_owner_idx
  on public.mesas_habituales(owner_id, actualizada_en desc);

alter table public.mesas_habituales enable row level security;
revoke all on table public.mesas_habituales from public, anon, authenticated;
grant select on table public.mesas_habituales to authenticated;

create policy "owner ve sus mesas habituales" on public.mesas_habituales
  for select to authenticated
  using (owner_id = auth.uid());

create or replace function private.validar_mesa_habitual(
  p_nombre text,
  p_jugadores text[],
  p_configuracion jsonb,
  p_tema text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jugador text;
  v_niveles jsonb;
begin
  if char_length(trim(coalesce(p_nombre, ''))) not between 2 and 50
    or coalesce(cardinality(p_jugadores), 0) > 10
    or p_tema not in ('verde', 'rojo', 'negro')
    or pg_catalog.jsonb_typeof(p_configuracion) <> 'object'
    or p_configuracion#>>'{fichas,tipo}' not in ('fisicas', 'virtuales')
    or p_configuracion#>>'{modo,id}' not in ('turbo', 'regular', 'deep', 'personalizado')
  then raise exception 'DATOS_INVALIDOS'; end if;

  v_niveles := p_configuracion#>'{modo,niveles}';
  if pg_catalog.jsonb_typeof(v_niveles) <> 'array'
    or pg_catalog.jsonb_array_length(v_niveles) not between 1 and 100
  then raise exception 'DATOS_INVALIDOS'; end if;

  foreach v_jugador in array coalesce(p_jugadores, '{}') loop
    if char_length(trim(coalesce(v_jugador, ''))) not between 1 and 30
    then raise exception 'DATOS_INVALIDOS'; end if;
  end loop;

  if p_configuracion#>>'{fichas,tipo}' = 'virtuales'
    and coalesce((p_configuracion#>>'{fichas,stack}')::numeric, 0) <= 0
  then raise exception 'DATOS_INVALIDOS'; end if;
end;
$$;

revoke all on function private.validar_mesa_habitual(text,text[],jsonb,text)
  from public, anon, authenticated;

create or replace function public.mis_mesas_habituales()
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
    'id', m.id,
    'nombre', m.nombre,
    'jugadores', pg_catalog.to_jsonb(m.jugadores),
    'configuracion', m.configuracion,
    'tema_id', m.tema_id,
    'temporada_id', m.temporada_id,
    'liga', case when l.id is null then null else pg_catalog.jsonb_build_object(
      'id', l.id, 'nombre', l.nombre,
      'temporada', t.nombre, 'temporada_estado', t.estado
    ) end,
    'plus_activo', private.tiene_plus(auth.uid()),
    'creada_en', m.creada_en,
    'actualizada_en', m.actualizada_en
  ) order by m.actualizada_en desc), '[]'::jsonb)
  into v_resultado
  from public.mesas_habituales m
  left join public.liga_temporadas t on t.id = m.temporada_id
  left join public.ligas l on l.id = t.liga_id
  where m.owner_id = auth.uid();
  return v_resultado;
end;
$$;

create or replace function public.guardar_mesa_habitual(
  p_id uuid,
  p_nombre text,
  p_jugadores text[],
  p_configuracion jsonb,
  p_tema text,
  p_temporada uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  perform private.validar_mesa_habitual(
    p_nombre, coalesce(p_jugadores, '{}'), p_configuracion, p_tema
  );
  if p_temporada is not null and not exists (
    select 1 from public.liga_temporadas t
    join public.ligas l on l.id = t.liga_id
    where t.id = p_temporada and t.estado = 'activa'
      and l.owner_id = auth.uid() and l.estado = 'activa'
  ) then raise exception 'TEMPORADA_NO_EXISTE'; end if;

  if p_id is null then
    insert into public.mesas_habituales(
      owner_id, nombre, jugadores, configuracion, tema_id, temporada_id
    ) values (
      auth.uid(), trim(p_nombre), coalesce(p_jugadores, '{}'),
      p_configuracion, p_tema, p_temporada
    ) returning id into v_id;
  else
    update public.mesas_habituales
    set nombre = trim(p_nombre), jugadores = coalesce(p_jugadores, '{}'),
        configuracion = p_configuracion, tema_id = p_tema,
        temporada_id = p_temporada, actualizada_en = pg_catalog.now()
    where id = p_id and owner_id = auth.uid()
    returning id into v_id;
    if v_id is null then raise exception 'MESA_NO_DISPONIBLE'; end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.eliminar_mesa_habitual(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  delete from public.mesas_habituales
  where id = p_id and owner_id = auth.uid();
  if not found then raise exception 'MESA_NO_DISPONIBLE'; end if;
end;
$$;

create or replace function public.crear_sala_desde_mesa(p_mesa uuid)
returns public.salas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mesa public.mesas_habituales;
  v_sala public.salas;
  v_temporada public.liga_temporadas;
  v_liga public.ligas;
  v_codigo text;
  v_intento integer;
  v_configuracion jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  select * into v_mesa from public.mesas_habituales
  where id = p_mesa and owner_id = auth.uid();
  if not found then raise exception 'MESA_NO_DISPONIBLE'; end if;

  if v_mesa.temporada_id is not null then
    select * into v_temporada from public.liga_temporadas
    where id = v_mesa.temporada_id for update;
    if not found or v_temporada.estado <> 'activa'
    then raise exception 'TEMPORADA_NO_EXISTE'; end if;
    select * into v_liga from public.ligas where id = v_temporada.liga_id;
    if v_liga.owner_id <> auth.uid() then raise exception 'SOLO_OWNER'; end if;
    if v_liga.estado <> 'activa' then raise exception 'LIGA_ARCHIVADA'; end if;
  end if;

  v_configuracion := v_mesa.configuracion || pg_catalog.jsonb_build_object(
    'mesa_habitual_id', v_mesa.id,
    'mesa_habitual_nombre', v_mesa.nombre,
    'jugadores_habituales', pg_catalog.to_jsonb(v_mesa.jugadores),
    'tema_id', v_mesa.tema_id
  );
  for v_intento in 1..8 loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      floor(random() * 32)::integer + 1, 1), '')
    into v_codigo from generate_series(1, 5);
    begin
      insert into public.salas(
        codigo, host_id, niveles, temporada_id, configuracion
      ) values (
        v_codigo, auth.uid(), v_mesa.configuracion#>'{modo,niveles}',
        v_mesa.temporada_id, v_configuracion
      ) returning * into v_sala;
      exit;
    exception when unique_violation then
      v_sala := null;
    end;
  end loop;
  if v_sala.id is null then raise exception 'CODIGO_NO_DISPONIBLE'; end if;

  if v_mesa.temporada_id is not null then
    insert into public.liga_partidas(sala_id, temporada_id, codigo_sala)
    values (v_sala.id, v_mesa.temporada_id, v_sala.codigo);
  end if;
  return v_sala;
end;
$$;

create or replace function public.mi_puntuacion()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_plus boolean;
  v_resultado jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  v_plus := private.tiene_plus(auth.uid());
  with propios as (
    select * from public.puntuacion_partidas
    where user_id = auth.uid() and finalizada_en is not null
  ), totales as (
    select user_id, sum(puntos) puntos, count(*) partidas
    from public.puntuacion_partidas where finalizada_en is not null
    group by user_id
  ), mi_total as (
    select coalesce(sum(puntos), 0) puntos, count(*) partidas,
      count(*) filter (where puesto = 1) victorias,
      count(*) filter (where puesto <= 3) podios,
      round(avg(puesto)::numeric, 2) posicion_media,
      min(puesto) mejor_posicion, max(puesto) peor_posicion
    from propios
  ), con_rango as (
    select user_id, rank() over(order by puntos desc) rango from totales
  ), historial as (
    select sala_id, jugadores, puesto, puntos, finalizada_en,
      duracion_ms, temporada_id
    from propios order by finalizada_en desc, sala_id
    limit case when v_plus then 2147483647 else 10 end
  ), evolucion as (
    select finalizada_en, puntos,
      sum(puntos) over(order by finalizada_en, sala_id) acumulado
    from propios order by finalizada_en, sala_id
  ), meses as (
    select to_char(finalizada_en at time zone 'UTC', 'YYYY-MM') mes,
      count(*) partidas, count(*) filter (where puesto = 1) victorias,
      sum(puntos) puntos, round(avg(puesto)::numeric, 2) posicion_media
    from propios group by 1 order by 1
  ), marcas as (
    select puesto, finalizada_en, sala_id,
      row_number() over(order by finalizada_en, sala_id)
      - row_number() over(partition by (puesto = 1) order by finalizada_en, sala_id) grupo
    from propios
  ), rachas as (
    select coalesce(max(cantidad), 0) mejor from (
      select count(*) cantidad from marcas where puesto = 1 group by grupo
    ) x
  )
  select pg_catalog.jsonb_build_object(
    'puntos', m.puntos,
    'partidas', m.partidas,
    'rango', (select rango from con_rango where user_id = auth.uid()),
    'plus_activo', v_plus,
    'historial_completo', v_plus,
    'historial', coalesce((select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(h)
      order by h.finalizada_en desc) from historial h), '[]'::jsonb),
    'estadisticas', case when not v_plus then null else pg_catalog.jsonb_build_object(
      'partidas', m.partidas, 'victorias', m.victorias, 'podios', m.podios,
      'win_rate', case when m.partidas = 0 then 0
        else round(m.victorias::numeric * 100 / m.partidas, 2) end,
      'posicion_media', m.posicion_media, 'puntos', m.puntos,
      'mejor_posicion', m.mejor_posicion, 'peor_posicion', m.peor_posicion,
      'mejor_racha_victorias', (select mejor from rachas),
      'evolucion', coalesce((select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e)
        order by e.finalizada_en) from evolucion e), '[]'::jsonb),
      'por_mes', coalesce((select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x)
        order by x.mes) from meses x), '[]'::jsonb)
    ) end
  ) into v_resultado from mi_total m;
  return v_resultado;
end;
$$;

-- La comparacion solo expone agregados de rivales con los que el usuario ya
-- compartio resultados finalizados. Nunca devuelve historiales ajenos.
create or replace function public.mi_head_to_head()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare v_resultado jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_plus(auth.uid());
  with mias as (
    select * from public.puntuacion_partidas
    where user_id = auth.uid() and finalizada_en is not null
  ), cruces as (
    select o.user_id,
      coalesce(max(o.nombre_jugador), 'Jugador') nombre,
      count(*) partidas_juntos,
      count(*) filter (where m.puesto < o.puesto) yo_arriba,
      count(*) filter (where o.puesto < m.puesto) rival_arriba,
      count(*) filter (where m.puesto = o.puesto) empates,
      count(*) filter (where m.puesto = 1) mis_victorias,
      count(*) filter (where o.puesto = 1) sus_victorias,
      count(*) filter (where m.puesto <= 3) mis_podios,
      count(*) filter (where o.puesto <= 3) sus_podios
    from mias m
    join public.puntuacion_partidas o
      on o.sala_id = m.sala_id and o.user_id <> auth.uid()
      and o.finalizada_en is not null
    group by o.user_id
  )
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c)
    order by c.partidas_juntos desc, c.nombre), '[]'::jsonb)
  into v_resultado from cruces c;
  return v_resultado;
end;
$$;

create or replace function public.recap_partida(p_sala uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare v_resultado jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  if not exists (
    select 1 from public.puntuacion_partidas
    where sala_id = p_sala and user_id = auth.uid() and finalizada_en is not null
  ) then raise exception 'RECAP_NO_DISPONIBLE'; end if;

  select pg_catalog.jsonb_build_object(
    'sala_id', p_sala,
    'finalizada_en', max(r.finalizada_en),
    'duracion_ms', max(r.duracion_ms),
    'jugadores', max(r.jugadores),
    'resultados', pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'puesto', r.puesto, 'nombre', coalesce(r.nombre_jugador, 'Jugador'),
      'puntos', r.puntos, 'soy_yo', r.user_id = auth.uid()
    ) order by r.puesto, r.nombre_jugador),
    'liga', case when count(l.id) = 0 then null else pg_catalog.jsonb_build_object(
      'nombre', max(l.nombre), 'temporada', max(t.nombre)
    ) end
  ) into v_resultado
  from public.puntuacion_partidas r
  left join public.liga_temporadas t on t.id = r.temporada_id
  left join public.ligas l on l.id = t.liga_id
  where r.sala_id = p_sala and r.finalizada_en is not null
  group by r.sala_id;
  if v_resultado is null then raise exception 'RECAP_NO_DISPONIBLE'; end if;
  return v_resultado;
end;
$$;

-- Conserva nombres y duracion tambien en partidas Free, para que el recap y
-- las estadisticas futuras no dependan de que la sala siga existiendo.
do $$
begin
  if pg_catalog.to_regprocedure(
    'public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)'
  ) is null then
    alter function public.accion_mesa(uuid,text,jsonb,text)
      rename to accion_mesa_sin_estadisticas;
  end if;
end;
$$;

revoke all on function public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)
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
declare v_sala public.salas;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  v_sala := public.accion_mesa_sin_estadisticas(
    p_sala, p_accion, p_datos, p_solicitud
  );
  if p_accion = 'iniciar' then
    update public.puntuacion_partidas r
    set nombre_jugador = j.nombre
    from public.jugadores j
    where r.sala_id = v_sala.id and j.id = r.jugador_id
      and r.nombre_jugador is null;
  end if;
  if p_accion = 'cerrar_mano' and v_sala.estado = 'finalizada' then
    update public.puntuacion_partidas
    set duracion_ms = coalesce(duracion_ms, v_sala.acumulado_ms)
    where sala_id = v_sala.id and finalizada_en is not null;
  end if;
  return v_sala;
end;
$$;

revoke all on function public.mis_mesas_habituales(),
  public.guardar_mesa_habitual(uuid,text,text[],jsonb,text,uuid),
  public.eliminar_mesa_habitual(uuid),
  public.crear_sala_desde_mesa(uuid),
  public.mi_puntuacion(), public.mi_head_to_head(),
  public.recap_partida(uuid),
  public.accion_mesa(uuid,text,jsonb,text)
  from public, anon, authenticated;

grant execute on function public.mis_mesas_habituales(),
  public.guardar_mesa_habitual(uuid,text,text[],jsonb,text,uuid),
  public.eliminar_mesa_habitual(uuid),
  public.crear_sala_desde_mesa(uuid),
  public.mi_puntuacion(), public.mi_head_to_head(),
  public.recap_partida(uuid),
  public.accion_mesa(uuid,text,jsonb,text)
  to authenticated;

commit;
notify pgrst, 'reload schema';
