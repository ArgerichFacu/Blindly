begin;
alter table private.ads_qa_testers add column scenario text not null default 'normal'
  check(scenario in ('normal','no_load','show_error','show_timeout'));
-- Sólo el administrador puede preparar fallos sintéticos del QA privado. No es
-- un override de Plus, identidad, consentimiento ni del switch público.
create or replace function public.estado_publicidad() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare u uuid:=auth.uid(); plus boolean; escenario text;
begin
  if u is null or not exists(select 1 from auth.users where id=u and (banned_until is null or banned_until<=now())) then
    raise exception 'SESION_REQUERIDA';
  end if;
  plus:=private.tiene_plus(u);
  if not plus then
    select t.scenario into escenario from private.ads_qa_testers t join auth.users a on a.id=t.user_id
      cross join private.publicidad_config c where c.singleton and c.ads_qa_enabled
      and t.user_id=u and t.enabled and t.expires_at>now() and a.is_anonymous is false;
  end if;
  return jsonb_build_object('ads_enabled',coalesce((select ads_enabled from private.publicidad_config where singleton),false),
    'ads_qa_enabled',escenario is not null,'ads_qa_scenario',escenario,'elegible_free',not plus);
end $$;
revoke all on function public.estado_publicidad() from public, anon;
grant execute on function public.estado_publicidad() to authenticated;
commit;
