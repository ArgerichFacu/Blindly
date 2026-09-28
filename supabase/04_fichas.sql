alter table jugadores
  add column if not exists fichas bigint not null default 0,
  add column if not exists eliminado_en timestamptz;

create policy "host da fichas" on jugadores
  for update to authenticated
  using (
    exists (
      select 1 from salas s
      where s.id = jugadores.sala_id and s.host_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from salas s
      where s.id = jugadores.sala_id and s.host_id = (select auth.uid())
    )
  );