begin;
-- Permite iniciar QA comercial; nunca otorga un entitlement ni acceso Plus.
create table private.plus_payment_testers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default true,
 created_at timestamptz not null default now()
);
alter table private.plus_payment_testers enable row level security;
revoke all on private.plus_payment_testers from public, anon, authenticated;
grant select, insert, update, delete on private.plus_payment_testers to service_role;

create function private.permiso_pago_tester() returns boolean
language plpgsql stable security definer set search_path='' as $$
declare u uuid := private.usuario_founder();
begin
 return not private.tiene_acceso_revision(u) and exists (
  select 1 from private.plus_payment_testers t join auth.users a on a.id=t.user_id
  where t.user_id=u and t.enabled and not a.is_anonymous
  and ((a.email_confirmed_at is not null and a.email not like '%@recovery.blindly.invalid')
   or exists(select 1 from auth.identities i where i.user_id=u and i.provider='google'))
 );
end $$;
revoke all on function private.permiso_pago_tester() from public, anon;
grant execute on function private.permiso_pago_tester() to authenticated;
create function public.mi_permiso_pago_tester() returns boolean
language sql stable security invoker set search_path='' as $$
 select private.permiso_pago_tester();
$$;
revoke all on function public.mi_permiso_pago_tester() from public, anon;
grant execute on function public.mi_permiso_pago_tester() to authenticated;
comment on table private.plus_payment_testers is 'QA privado por UUID. No concede Plus; no reemplaza license tester ni medio de pago sandbox.';
commit;
