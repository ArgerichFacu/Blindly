begin;
-- Una visita a Plus no es progreso; una prueba usada sí, incluso vencida.
-- Sólo presencia de datos del UUID autenticado. No concede acceso Plus.
create or replace function public.mi_identidad_tiene_datos() returns boolean
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 return exists(select 1 from public.puntuacion_partidas where user_id=auth.uid())
 or exists(select 1 from public.ligas where owner_id=auth.uid())
 or exists(select 1 from public.liga_miembros where user_id=auth.uid())
 or exists(select 1 from public.mesas_habituales where owner_id=auth.uid())
 or exists(select 1 from public.jugadores where user_id=auth.uid())
 or exists(select 1 from public.salas where host_id=auth.uid())
 or exists(select 1 from private.plus_founder_trials where user_id=auth.uid())
 or exists(select 1 from public.accesos_plus where user_id=auth.uid());
end $$;
revoke all on function public.mi_identidad_tiene_datos() from public, anon;
grant execute on function public.mi_identidad_tiene_datos() to authenticated;
commit;
