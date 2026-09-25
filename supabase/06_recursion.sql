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