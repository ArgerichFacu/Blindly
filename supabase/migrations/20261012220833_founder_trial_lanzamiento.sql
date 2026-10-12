begin;
-- Prueba de lanzamiento independiente de compras, reviewers y la build demo.
create table private.plus_lanzamiento (
 singleton boolean primary key default true check(singleton),
 founder_trial_enabled boolean not null default true,
 real_payments_enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into private.plus_lanzamiento(singleton) values(true);
create table private.plus_founder_trials (
 user_id uuid primary key references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(),
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 check(expires_at=started_at+interval '72 hours')
);
create table private.plus_founder_funnel (
 user_id uuid primary key references auth.users(id) on delete cascade,
 first_plus_view_at timestamptz,
 last_plus_view_at timestamptz,
 plus_view_count bigint not null default 0 check(plus_view_count>=0),
 ever_eligible_view boolean not null default false,
 first_plus_feature_used_at timestamptz,
 first_interest_at timestamptz,
 interest_plan text check(interest_plan in ('monthly','annual','lifetime')),
 waitlist boolean not null default false,
 waitlisted_at timestamptz,
 updated_at timestamptz not null default now()
);
alter table private.plus_lanzamiento enable row level security;
alter table private.plus_founder_trials enable row level security;
alter table private.plus_founder_funnel enable row level security;
revoke all on private.plus_lanzamiento,private.plus_founder_trials,private.plus_founder_funnel from public,anon,authenticated;
grant select,insert,update,delete on private.plus_lanzamiento,private.plus_founder_trials,private.plus_founder_funnel to service_role;

create function private.usuario_founder() returns uuid
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and (banned_until is null or banned_until<=now())) then raise exception 'SESION_REQUERIDA'; end if;
 return auth.uid();
end $$;
create function private.tiene_plus_comercial(p_usuario uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.accesos_plus a where a.user_id=p_usuario and a.activo
 and a.verificado_en>=now()-interval '15 minutes' and (a.vence_en is null or a.vence_en>now()));
$$;
create function private.tiene_founder_trial(p_usuario uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.plus_founder_trials t
 join auth.users u on u.id=t.user_id cross join private.plus_lanzamiento c
 where t.user_id=p_usuario and c.singleton and c.founder_trial_enabled
 and t.started_at<=now() and t.expires_at>now()
 and (u.banned_until is null or u.banned_until<=now()));
$$;
create or replace function private.tiene_plus(p_usuario uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select private.tiene_acceso_revision(p_usuario) or private.tiene_plus_comercial(p_usuario) or private.tiene_founder_trial(p_usuario);
$$;
create function private.contactable_plus(p_usuario uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users u where u.id=p_usuario and not u.is_anonymous
 and u.email_confirmed_at is not null and u.email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
 and lower(split_part(u.email,'@',2)) !~ '(^|\.)invalid$');
$$;
revoke all on function private.usuario_founder(),private.tiene_plus_comercial(uuid),private.tiene_founder_trial(uuid),private.contactable_plus(uuid) from public,anon,authenticated;

create function public.estado_lanzamiento_plus() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform private.usuario_founder();
 return (select jsonb_build_object('founder_trial_enabled',founder_trial_enabled,'real_payments_enabled',real_payments_enabled) from private.plus_lanzamiento where singleton);
end $$;
create function public.estado_founder_trial() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare u uuid:=private.usuario_founder(); t private.plus_founder_trials; f private.plus_founder_funnel; c private.plus_lanzamiento; fuente text; comercial boolean;
begin
 select * into c from private.plus_lanzamiento where singleton;
 select * into t from private.plus_founder_trials where user_id=u;
 select * into f from private.plus_founder_funnel where user_id=u;
 comercial:=private.tiene_plus_comercial(u);
 fuente:=case when private.tiene_acceso_revision(u) then 'PLAY_REVIEW' when comercial then 'REVENUECAT_PAID' when private.tiene_founder_trial(u) then 'FOUNDER_TRIAL' else 'FREE' end;
 return jsonb_build_object('server_now',now(),'eligible',c.founder_trial_enabled and t.user_id is null,
 'started_at',t.started_at,'expires_at',t.expires_at,'used',t.user_id is not null,
 'active',private.tiene_founder_trial(u),'expired',coalesce(t.expires_at<=now(),false),
 'founder_trial_enabled',c.founder_trial_enabled,'real_payments_enabled',c.real_payments_enabled,
 'access_source',fuente,'paid_expires_at',case when comercial then (select vence_en from public.accesos_plus where user_id=u) else null end,
 'contactable',private.contactable_plus(u),'interest_plan',f.interest_plan,'waitlist',coalesce(f.waitlist,false));
end $$;
create function public.iniciar_prueba_founder() returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.usuario_founder(); habilitada boolean;
begin
 select founder_trial_enabled into habilitada from private.plus_lanzamiento where singleton for share;
 if habilitada then
  insert into private.plus_founder_trials(user_id,started_at,expires_at) values(u,now(),now()+interval '72 hours') on conflict(user_id) do nothing;
 end if;
 return public.estado_founder_trial();
end $$;
create function public.registrar_vista_plus() returns void
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.usuario_founder(); elegible boolean;
begin
 elegible:=(public.estado_founder_trial()->>'eligible')::boolean;
 insert into private.plus_founder_funnel(user_id,first_plus_view_at,last_plus_view_at,plus_view_count,ever_eligible_view)
 values(u,now(),now(),1,elegible) on conflict(user_id) do update set
 first_plus_view_at=coalesce(private.plus_founder_funnel.first_plus_view_at,excluded.first_plus_view_at),
 last_plus_view_at=excluded.last_plus_view_at,
 plus_view_count=private.plus_founder_funnel.plus_view_count+case when private.plus_founder_funnel.last_plus_view_at is null or private.plus_founder_funnel.last_plus_view_at<=now()-interval '1 minute' then 1 else 0 end,
 ever_eligible_view=private.plus_founder_funnel.ever_eligible_view or excluded.ever_eligible_view,updated_at=now();
end $$;
create function public.registrar_interes_plus(p_plan text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.usuario_founder();
begin
 if p_plan is null or p_plan not in ('monthly','annual','lifetime') then raise exception 'PLUS_PLAN_INVALIDO'; end if;
 insert into private.plus_founder_funnel(user_id,interest_plan,first_interest_at) values(u,p_plan,now()) on conflict(user_id) do update set
 interest_plan=excluded.interest_plan,first_interest_at=coalesce(private.plus_founder_funnel.first_interest_at,excluded.first_interest_at),updated_at=now();
 return public.estado_founder_trial();
end $$;
create function public.registrar_waitlist_plus() returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=private.usuario_founder();
begin
 insert into private.plus_founder_funnel(user_id,waitlist,waitlisted_at) values(u,true,now()) on conflict(user_id) do update set
 waitlist=true,waitlisted_at=coalesce(private.plus_founder_funnel.waitlisted_at,excluded.waitlisted_at),updated_at=now();
 return public.estado_founder_trial();
end $$;
-- Primer uso real detectado en el guard existente; no se instrumentan pantallas.
create or replace function private.exigir_plus(p_usuario uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.tiene_plus(p_usuario) then raise exception 'PLUS_REQUERIDO'; end if;
 if p_usuario=auth.uid() and private.tiene_founder_trial(p_usuario)
 and not private.tiene_acceso_revision(p_usuario) and not private.tiene_plus_comercial(p_usuario) then
  insert into private.plus_founder_funnel(user_id,first_plus_feature_used_at) values(p_usuario,now()) on conflict(user_id) do update set
  first_plus_feature_used_at=excluded.first_plus_feature_used_at,updated_at=now() where private.plus_founder_funnel.first_plus_feature_used_at is null;
 end if;
end $$;
revoke all on function private.tiene_plus(uuid),private.exigir_plus(uuid) from public,anon,authenticated;
revoke all on function public.estado_lanzamiento_plus(),public.estado_founder_trial(),public.iniciar_prueba_founder(),public.registrar_vista_plus(),public.registrar_interes_plus(text),public.registrar_waitlist_plus() from public,anon;
grant execute on function public.estado_lanzamiento_plus(),public.estado_founder_trial(),public.iniciar_prueba_founder(),public.registrar_vista_plus(),public.registrar_interes_plus(text),public.registrar_waitlist_plus() to authenticated;
commit;
