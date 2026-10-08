begin;
-- Workers recién habilitados: los clientes no pueden usar HTTP ni administrar cron.
do $$ begin
 if to_regnamespace('net') is not null then
  execute 'revoke all on all functions in schema net from public,anon,authenticated';
  execute 'revoke all on all tables in schema net from public,anon,authenticated';
  execute 'revoke all on all sequences in schema net from public,anon,authenticated';
  execute 'revoke all on schema net from public,anon,authenticated';
 end if;
 if to_regnamespace('cron') is not null then
  execute 'revoke all on all functions in schema cron from public,anon,authenticated';
  execute 'revoke all on all tables in schema cron from public,anon,authenticated';
  execute 'revoke all on all sequences in schema cron from public,anon,authenticated';
  execute 'revoke all on schema cron from public,anon,authenticated';
 end if;
end; $$;
commit;
