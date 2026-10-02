-- El stack físico representa lo que hay sobre la mesa. Solo el dealer puede
-- corregirlo; ser host no concede permiso para modificar fichas ajenas.
begin;

do $$
begin
  if pg_catalog.to_regprocedure(
    'public.accion_mesa_con_puntuacion(uuid,text,jsonb,text)'
  ) is null then
    alter function public.accion_mesa(uuid,text,jsonb,text)
      rename to accion_mesa_con_puntuacion;
  end if;
end;
$$;

revoke all on function public.accion_mesa_con_puntuacion(uuid,text,jsonb,text)
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
  s public.salas;
  j public.jugadores;
  destino uuid;
  monto bigint;
  anterior public.operaciones_mesa;
begin
  if p_accion is distinct from 'fichas' then
    return public.accion_mesa_con_puntuacion(
      p_sala,
      p_accion,
      p_datos,
      p_solicitud
    );
  end if;

  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  if p_solicitud is null
    or length(p_solicitud) not between 8 and 160
    or p_datos is null
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  select * into s
  from public.salas
  where id = p_sala
  for update;
  if not found then raise exception 'SALA_NO_EXISTE'; end if;

  select * into j
  from public.jugadores
  where sala_id = s.id and user_id = auth.uid();
  if not found then raise exception 'NO_PERTENECES'; end if;

  select * into anterior
  from public.operaciones_mesa
  where solicitud = p_solicitud;
  if found then
    if anterior.sala_id <> s.id
      or anterior.user_id <> auth.uid()
      or anterior.accion <> p_accion
      or anterior.datos <> p_datos
    then
      raise exception 'SOLICITUD_INVALIDA';
    end if;
    return s;
  end if;

  if j.id is distinct from s.dealer_id then raise exception 'SOLO_DEALER'; end if;
  if s.configuracion#>>'{fichas,tipo}' <> 'fisicas'
    or s.estado not in ('jugando', 'pausado')
  then
    raise exception 'ESTADO_INVALIDO';
  end if;
  if coalesce(p_datos->>'jugador', '') !~
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    or coalesce(p_datos->>'monto', '') !~ '^[0-9]+$'
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  destino := (p_datos->>'jugador')::uuid;
  monto := (p_datos->>'monto')::bigint;
  if monto > 1000000000 then raise exception 'MONTO_INVALIDO'; end if;
  if monto > 0 and exists (
    select 1
    from public.puntuacion_partidas
    where sala_id = s.id
      and jugador_id = destino
      and mano_eliminacion is not null
  ) then
    raise exception 'ELIMINACION_CONFIRMADA';
  end if;

  update public.jugadores
  set fichas = monto,
      eliminado_en = case when monto = 0 then pg_catalog.now() else null end
  where id = destino and sala_id = s.id;
  if not found then raise exception 'NO_PERTENECES'; end if;

  if s.turno_id = destino and monto = 0 then
    perform public.avanzar_apuestas(s.id, destino);
  end if;

  update public.salas
  set revision = revision + 1
  where id = s.id
  returning * into s;

  insert into public.operaciones_mesa(solicitud, sala_id, user_id, accion, datos)
  values(p_solicitud, s.id, auth.uid(), p_accion, p_datos);
  return s;
end;
$$;

revoke all on function public.accion_mesa(uuid,text,jsonb,text)
  from public, anon, authenticated;
grant execute on function public.accion_mesa(uuid,text,jsonb,text)
  to authenticated;

commit;

notify pgrst, 'reload schema';
