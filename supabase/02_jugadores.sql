create table jugadores (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid not null references salas(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 1 and 30),
  unido_en timestamptz not null default now(),
  unique (sala_id, user_id)
);

alter table jugadores enable row level security;

grant select, insert, update, delete on public.jugadores to authenticated;

create policy "ver jugadores propios o de mi sala" on jugadores
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from salas s
      where s.id = jugadores.sala_id and s.host_id = (select auth.uid())
    )
  );

create policy "unirme yo mismo" on jugadores
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "cambiar mi nombre" on jugadores
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "salir de la sala" on jugadores
  for delete to authenticated
  using (user_id = (select auth.uid()));

alter publication supabase_realtime add table jugadores;