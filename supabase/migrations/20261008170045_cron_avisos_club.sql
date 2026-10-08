begin;
-- PGlite no tiene workers de extensiones; la cadena funcional se prueba allí.
-- En Supabase se habilita el cron sólo cuando ambas extensiones están disponibles.
do $cron$ begin
 if (select count(*) from pg_available_extensions where name in ('pg_net','pg_cron'))=2 then
  execute 'create extension if not exists pg_net';
  execute 'create extension if not exists pg_cron';
  execute $func$
  create or replace function private.ejecutar_cron_push() returns bigint
  language plpgsql security definer set search_path='' as $$ declare solicitud bigint; begin
   if not exists(select 1 from private.dispositivos_push where habilitado) then return null; end if;
   select net.http_post(url:='https://ddvbbkwhisuezloorhfg.supabase.co/functions/v1/enviar-avisos',
   body:='{}'::jsonb,headers:=jsonb_build_object('Content-Type','application/json','x-blindly-dispatch',secreto),timeout_milliseconds:=60000)
   into solicitud from private.config_push where id;
   return solicitud;
  end; $$;
  $func$;
  execute 'revoke all on function private.ejecutar_cron_push() from public,anon,authenticated';
  perform cron.schedule('blindly-avisos','*/5 * * * *','select private.ejecutar_cron_push()');
 end if;
end; $cron$;
commit;
