-- La igualada se confirma con el total exacto de la ronda. Esto permite que
-- cada jugador ingrese y revise el importe sin confiar en cálculos del cliente.
begin;

do $$
begin
  if pg_catalog.to_regprocedure(
    'public.accion_mesa_con_stack_dealer(uuid,text,jsonb,text)'
  ) is null then
    alter function public.accion_mesa(uuid,text,jsonb,text)
      rename to accion_mesa_con_stack_dealer;
  end if;
end;
$$;

revoke all on function public.accion_mesa_con_stack_dealer(uuid,text,jsonb,text)
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
  anterior public.operaciones_mesa;
  monto bigint;
  esperado bigint;
begin
  if p_accion is distinct from 'apostar'
    or coalesce(p_datos->>'tipo', '') <> 'igualar'
  then
    return public.accion_mesa_con_stack_dealer(
      p_sala, p_accion, p_datos, p_solicitud
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

  if s.configuracion#>>'{fichas,tipo}' <> 'virtuales' then
    raise exception 'ESTADO_INVALIDO';
  end if;
  if (p_datos->>'mano')::integer is distinct from s.mano
    or s.estado <> 'jugando'
    or s.calle = 'reparto'
    or (p_datos->>'calle') is distinct from s.calle
    or (p_datos->>'revision')::bigint is distinct from s.revision
  then
    raise exception 'MANO_CAMBIO';
  end if;
  -- Conserva el orden de errores del motor y no revela datos de otro turno.
  if j.id is distinct from s.turno_id then raise exception 'TURNO_AJENO'; end if;
  if coalesce(p_datos->>'monto', '') !~ '^[0-9]+$'
    or length(p_datos->>'monto') > 10
  then
    raise exception 'MONTO_INVALIDO';
  end if;

  monto := (p_datos->>'monto')::bigint;
  esperado := least(j.aporte_calle + j.fichas, s.apuesta_actual);
  if monto <> esperado then raise exception 'MONTO_IGUALAR_INVALIDO'; end if;

  return public.accion_mesa_con_stack_dealer(
    p_sala, p_accion, p_datos, p_solicitud
  );
end;
$$;

revoke all on function public.accion_mesa(uuid,text,jsonb,text)
  from public, anon, authenticated;
grant execute on function public.accion_mesa(uuid,text,jsonb,text)
  to authenticated;

commit;

notify pgrst, 'reload schema';
