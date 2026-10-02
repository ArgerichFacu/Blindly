-- Endurecimiento final de auxiliares e índices de acceso.
-- Las operaciones de juego continúan pasando por los RPC SECURITY DEFINER.
begin;

create or replace function public.hora_servidor()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select pg_catalog.now(); $$;

revoke all on function public.hora_servidor() from public, anon;
grant execute on function public.hora_servidor() to authenticated;

create or replace function public.soy_jugador_de(sala_id_param uuid)
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

revoke all on function public.soy_jugador_de(uuid) from public, anon;
grant execute on function public.soy_jugador_de(uuid) to authenticated;

-- Esta función pertenece al event trigger administrado por Supabase. Los clientes
-- nunca necesitan ejecutarla directamente.
do $$
begin
  if pg_catalog.to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

drop policy if exists "ver jugadores propios o de mi sala" on public.jugadores;
drop policy if exists "ver jugadores de mi sala" on public.jugadores;

create policy "ver jugadores autorizados" on public.jugadores
  for select to authenticated
  using (
    public.soy_jugador_de(jugadores.sala_id)
    or exists (
      select 1
      from public.salas s
      where s.id = jugadores.sala_id
        and s.host_id = (select auth.uid())
    )
  );

-- Desde 07_diagrama no existe UPDATE directo para clientes: estas políticas
-- históricas eran redundantes y producían rutas permisivas duplicadas.
drop policy if exists "cambiar mi nombre" on public.jugadores;
drop policy if exists "host da fichas" on public.jugadores;

create index if not exists jugadores_user_id_idx
  on public.jugadores(user_id);
create index if not exists operaciones_mesa_sala_id_idx
  on public.operaciones_mesa(sala_id);
create index if not exists salas_host_id_idx
  on public.salas(host_id);

commit;

notify pgrst, 'reload schema';
