begin;

-- Switch independiente de pagos/Trial. Sólo administración puede modificarlo.
create table private.publicidad_config (
  singleton boolean primary key default true check (singleton),
  ads_enabled boolean not null default false
);
insert into private.publicidad_config(singleton, ads_enabled) values (true, false);
alter table private.publicidad_config enable row level security;
revoke all on private.publicidad_config from public, anon, authenticated;
grant select, update on private.publicidad_config to service_role;

create function public.estado_publicidad() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid()
    and (banned_until is null or banned_until<=now())) then raise exception 'SESION_REQUERIDA'; end if;
  return jsonb_build_object(
    'ads_enabled', coalesce((select ads_enabled from private.publicidad_config where singleton), false),
    'elegible_free', not private.tiene_plus(auth.uid()));
end; $$;
revoke all on function public.estado_publicidad() from public, anon;
grant execute on function public.estado_publicidad() to authenticated;

-- Serializa todas las creaciones del mismo owner, incluso en dos dispositivos.
-- Cuentan TODOS sus clubes, también archivados; roles en clubes ajenos no cuentan.
-- No modifica, archiva ni borra ningún club legacy.
create or replace function public.crear_liga(p_nombre text, p_temporada text, p_nombre_owner text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_liga public.ligas; v_temporada public.liga_temporadas;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  perform private.exigir_cuenta();
  if char_length(trim(coalesce(p_nombre, ''))) not between 2 and 50
    or char_length(trim(coalesce(p_temporada, ''))) not between 2 and 50
    or char_length(trim(coalesce(p_nombre_owner, ''))) not between 1 and 30 then
    raise exception 'DATOS_INVALIDOS';
  end if;
  perform 1 from auth.users where id=auth.uid() for update;
  if not private.tiene_plus(auth.uid()) and exists(select 1 from public.ligas where owner_id=auth.uid()) then
    raise exception 'LIMITE_CLUBES_FREE';
  end if;
  insert into public.ligas(nombre, owner_id) values(trim(p_nombre), auth.uid()) returning * into v_liga;
  insert into public.liga_miembros(liga_id, user_id, nombre) values(v_liga.id, auth.uid(), trim(p_nombre_owner));
  insert into public.liga_temporadas(liga_id, nombre) values(v_liga.id, trim(p_temporada)) returning * into v_temporada;
  return jsonb_build_object('liga_id',v_liga.id,'temporada_id',v_temporada.id);
end; $$;
revoke all on function public.crear_liga(text,text,text) from public, anon;
grant execute on function public.crear_liga(text,text,text) to authenticated;

-- La marca de ingreso nuevo se produce dentro del mismo bloqueo de sala que
-- usa unirse_mesa. Reintentos/reconexiones nunca son una oportunidad de anuncio.
-- Se conserva el orden existente: club -> sala, para no introducir deadlocks.
alter function public.unirse_mesa(text,text) set schema private;
alter function private.unirse_mesa(text,text) rename to unirse_mesa_sin_publicidad;
revoke all on function private.unirse_mesa_sin_publicidad(text,text) from public, anon, authenticated;
create function public.unirse_mesa(p_codigo text,p_nombre text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare club uuid; estado_sala text; v_sala_id uuid; nuevo boolean; resultado jsonb;
begin
  if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
  select t.liga_id,s.estado into club,estado_sala from public.salas s
    left join public.liga_temporadas t on t.id=s.temporada_id where s.codigo=upper(trim(p_codigo));
  if club is not null and estado_sala='esperando' then
    perform private.exigir_cuenta();
    perform 1 from public.ligas where id=club for update;
    if not private.puede_ver_liga(club) then raise exception 'MEMBRESIA_REQUERIDA'; end if;
  end if;
  select id into v_sala_id from public.salas where codigo=upper(trim(p_codigo)) for update;
  nuevo := not exists(select 1 from public.jugadores where sala_id=v_sala_id and user_id=auth.uid());
  resultado := private.unirse_mesa_sin_publicidad(p_codigo,p_nombre);
  return resultado || jsonb_build_object('ingresoNuevo',nuevo and resultado#>>'{sala,estado}'='esperando');
end; $$;
revoke all on function public.unirse_mesa(text,text) from public, anon;
grant execute on function public.unirse_mesa(text,text) to authenticated;

commit;
