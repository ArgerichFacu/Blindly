begin;
-- PostgREST ejecuta RPC STABLE en transacciones READ ONLY.
-- La métrica opcional jamás debe impedir una lectura premium autorizada.
create or replace function private.exigir_plus(p_usuario uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.tiene_plus(p_usuario) then raise exception 'PLUS_REQUERIDO'; end if;
 if not pg_catalog.current_setting('transaction_read_only')::boolean
 and p_usuario=auth.uid() and private.tiene_founder_trial(p_usuario)
 and not private.tiene_acceso_revision(p_usuario) and not private.tiene_plus_comercial(p_usuario) then
  insert into private.plus_founder_funnel(user_id,first_plus_feature_used_at) values(p_usuario,now()) on conflict(user_id) do update set
  first_plus_feature_used_at=excluded.first_plus_feature_used_at,updated_at=now() where private.plus_founder_funnel.first_plus_feature_used_at is null;
 end if;
end $$;
revoke all on function private.exigir_plus(uuid) from public,anon,authenticated;
commit;
