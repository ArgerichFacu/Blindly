begin;
-- La unidad real autorizada vive en el servidor. Sólo una build compilada con ese
-- mismo bloque de AdMob puede pedir anuncios reales, y sólo con ads_enabled
-- encendido (lo decide el titular).
--
-- Las builds 1.36–1.38 leían el campo público 'ads_enabled' y llevan la unidad
-- de una cuenta de AdMob descartada: ese campo deja de publicarse, así que esas
-- builds nunca muestran anuncios aunque el switch se encienda. La 1.35 y las
-- anteriores sólo conocen la ruta QA.
alter table private.publicidad_config add column if not exists ads_unit_android text
  check (ads_unit_android is null or ads_unit_android ~ '^ca-app-pub-[0-9]{16}/[0-9]{10}$');
update private.publicidad_config set ads_unit_android='ca-app-pub-1093561603360160/5619640600'
  where singleton and ads_unit_android is null;

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
  return jsonb_build_object(
    'ads_unit_android',(select case when c.ads_enabled then c.ads_unit_android end from private.publicidad_config c where c.singleton),
    'ads_qa_enabled',escenario is not null,'ads_qa_scenario',escenario,'elegible_free',not plus);
end $$;
revoke all on function public.estado_publicidad() from public, anon;
grant execute on function public.estado_publicidad() to authenticated;
commit;
