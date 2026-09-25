create policy "ver jugadores de mi sala" on jugadores
  for select to authenticated
  using (
    exists (
      select 1 from jugadores yo
      where yo.sala_id = jugadores.sala_id and yo.user_id = (select auth.uid())
    )
  );