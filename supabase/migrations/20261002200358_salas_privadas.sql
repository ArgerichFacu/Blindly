-- Los códigos de sala funcionan como una invitación. No deben poder enumerarse
-- desde otra identidad autenticada.
begin;

drop policy if exists "ver salas" on public.salas;
drop policy if exists "ver salas autorizadas" on public.salas;

create policy "ver salas autorizadas" on public.salas
  for select to authenticated
  using (
    salas.host_id = (select auth.uid())
    or private.soy_jugador_de(salas.id)
  );

commit;

notify pgrst, 'reload schema';
