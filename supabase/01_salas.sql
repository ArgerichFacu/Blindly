create table salas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  host_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  niveles jsonb not null,
  estado text not null default 'esperando',
  creada_en timestamptz not null default now()
);

alter table salas enable row level security;

grant select, insert, update, delete on public.salas to authenticated;

create policy "ver salas" on salas
  for select to authenticated using (true);

create policy "crear sala propia" on salas
  for insert to authenticated with check (host_id = (select auth.uid()));

create policy "editar sala propia" on salas
  for update to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()));

create policy "borrar sala propia" on salas
  for delete to authenticated using (host_id = (select auth.uid()));

alter publication supabase_realtime add table salas;