begin;
alter table private.publicidad_config add column ads_qa_enabled boolean not null default false;
create table private.ads_qa_testers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  expires_at timestamptz not null default (now()+interval '24 hours')
);
alter table private.ads_qa_testers enable row level security;
revoke all on private.ads_qa_testers from public, anon, authenticated;
grant select, insert, update, delete on private.ads_qa_testers to service_role;

create or replace function public.estado_publicidad() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid(); plus boolean; qa boolean;
begin
  if u is null or not exists(select 1 from auth.users where id=u and (banned_until is null or banned_until<=now())) then
    raise exception 'SESION_REQUERIDA';
  end if;
  plus:=private.tiene_plus(u);
  qa:=not plus and exists(select 1 from private.ads_qa_testers t join auth.users a on a.id=t.user_id
    cross join private.publicidad_config c where c.singleton and c.ads_qa_enabled
    and t.user_id=u and t.enabled and t.expires_at>now() and a.is_anonymous is false);
  return jsonb_build_object('ads_enabled',coalesce((select ads_enabled from private.publicidad_config where singleton),false),
    'ads_qa_enabled',qa,'elegible_free',not plus);
end $$;
revoke all on function public.estado_publicidad() from public, anon;
grant execute on function public.estado_publicidad() to authenticated;
commit;
