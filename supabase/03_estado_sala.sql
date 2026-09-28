alter table salas
  add column if not exists nivel_indice int not null default 0,
  add column if not exists acumulado_ms bigint not null default 0,
  add column if not exists inicio_en timestamptz;

create or replace function hora_servidor()
returns timestamptz
language sql
stable
as $$ select now(); $$;

grant execute on function hora_servidor() to authenticated;