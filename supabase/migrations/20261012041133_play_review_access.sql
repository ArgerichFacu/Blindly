begin;
-- Permiso de revisión separado del espejo de compras. Sin credenciales/UUIDs.
create table private.accesos_revision_play (
 user_id uuid primary key references auth.users(id) on delete cascade,
 activo boolean not null default true,
 vence_en timestamptz,
 creado_en timestamptz not null default now()
);
alter table private.accesos_revision_play enable row level security;
revoke all on table private.accesos_revision_play from public, anon, authenticated;
grant select, insert, update, delete on table private.accesos_revision_play to service_role;
create function private.tiene_acceso_revision(p_usuario uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from private.accesos_revision_play r join auth.users u on u.id=r.user_id
 where r.user_id=p_usuario and r.activo and (r.vence_en is null or r.vence_en>now())
 and u.is_anonymous is false and (u.banned_until is null or u.banned_until<=now()));
$$;
revoke all on function private.tiene_acceso_revision(uuid) from public,anon,authenticated;
create or replace function private.tiene_plus(p_usuario uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select private.tiene_acceso_revision(p_usuario) or exists (
 select 1 from public.accesos_plus a where a.user_id=p_usuario and a.activo
 and a.verificado_en>=now()-interval '15 minutes' and (a.vence_en is null or a.vence_en>now()));
$$;
revoke all on function private.tiene_plus(uuid) from public,anon,authenticated;
create function public.mi_acceso_revision_play() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and private.tiene_acceso_revision(auth.uid());
$$;
revoke all on function public.mi_acceso_revision_play() from public,anon,authenticated;
grant execute on function public.mi_acceso_revision_play() to authenticated,service_role;
commit;
