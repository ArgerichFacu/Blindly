-- Mantiene los helpers de RLS fuera del esquema expuesto por PostgREST.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.soy_jugador_de(sala_id_param uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.jugadores
    where jugadores.sala_id = sala_id_param
      and jugadores.user_id = auth.uid()
  );
$$;

revoke all on function private.soy_jugador_de(uuid) from public, anon;
grant execute on function private.soy_jugador_de(uuid) to authenticated;

drop policy if exists "ver jugadores autorizados" on public.jugadores;

create policy "ver jugadores autorizados" on public.jugadores
  for select to authenticated
  using (
    private.soy_jugador_de(jugadores.sala_id)
    or exists (
      select 1
      from public.salas s
      where s.id = jugadores.sala_id
        and s.host_id = (select auth.uid())
    )
  );

drop function if exists public.soy_jugador_de(uuid);

commit;

notify pgrst, 'reload schema';
