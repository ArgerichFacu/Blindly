begin;
alter table private.preferencias_avisos_club add column activo_desde timestamptz;
create function private.consentimiento_push() returns trigger language plpgsql set search_path='' as $$ begin
 if not new.activos then new.activo_desde:=null;
 elsif tg_op='INSERT' then new.activo_desde:=now();
 elsif not old.activos then new.activo_desde:=now(); end if;
 return new;
end; $$;
revoke all on function private.consentimiento_push() from public,anon,authenticated;
create trigger preferencias_consentimiento before insert or update on private.preferencias_avisos_club for each row execute function private.consentimiento_push();
do $$ declare original text; nueva text; begin
 original:=pg_get_functiondef('private.mis_preferencias_avisos(uuid)'::regprocedure);
 nueva:=replace(original,'to_jsonb(p)-''liga_id''-''user_id''','to_jsonb(p)-''liga_id''-''user_id''-''activo_desde''');
 execute nueva;
 original:=pg_get_functiondef('private.rivalidades_temporada(uuid)'::regprocedure);
 nueva:=replace(original,'where p.user_id=auth.uid() and p.temporada_id=p_temporada and p.finalizada_en is not null',
 'where p.user_id=auth.uid() and p.temporada_id=p_temporada and p.finalizada_en is not null and exists(select 1 from public.liga_partidas completa where completa.sala_id=p.sala_id and completa.temporada_id=p_temporada and completa.finalizada_en is not null)');
 if nueva=original then raise exception 'BASE_RIVALIDADES_EVENTOS_INCOMPATIBLE'; end if;
 execute nueva;
end; $$;
create table private.eventos_club (
 id text primary key, liga_id uuid not null references public.ligas(id) on delete cascade,
 temporada_id uuid references public.liga_temporadas(id) on delete cascade,
 tipo text not null check(tipo in ('mvp','rivalidades','fechas','temporadas','recordatorios')),
 datos jsonb not null, creado_en timestamptz not null default now()
);
create index eventos_club_liga_idx on private.eventos_club(liga_id,creado_en desc);
create index eventos_club_temporada_idx on private.eventos_club(temporada_id,creado_en desc);
create table private.dispositivos_push (
 token text primary key check(token ~ '^(ExpoPushToken|ExponentPushToken)\[[A-Za-z0-9_-]{10,200}\]$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 idioma text not null check(idioma in ('es','en','pt')), habilitado boolean not null default true,
 creado_en timestamptz not null default now(), actualizado_en timestamptz not null default now()
);
create index dispositivos_push_usuario_idx on private.dispositivos_push(user_id,actualizado_en desc);
create table private.entregas_push (
 id uuid primary key default gen_random_uuid(), evento_id text not null references private.eventos_club(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 token text not null references private.dispositivos_push(token) on delete cascade,
 estado text not null default 'reservada' check(estado in ('reservada','aceptada','confirmada','fallida','incierta')),
 reservada_en timestamptz not null default now(), ticket text, comprobada_en timestamptz,
 unique(evento_id,user_id)
);
create index entregas_push_usuario_idx on private.entregas_push(user_id,reservada_en desc);
create index entregas_push_token_idx on private.entregas_push(token);
create index entregas_push_recibos_idx on private.entregas_push(reservada_en) where estado='aceptada' and comprobada_en is null;
create table private.config_push (id boolean primary key default true check(id), secreto text not null default gen_random_uuid()::text||gen_random_uuid()::text);
insert into private.config_push(id) values(true);
alter table private.eventos_club enable row level security;
alter table private.dispositivos_push enable row level security;
alter table private.entregas_push enable row level security;
alter table private.config_push enable row level security;
revoke all on private.eventos_club,private.dispositivos_push,private.entregas_push,private.config_push from public,anon,authenticated;

create function public.registrar_dispositivo_push(p_token text,p_idioma text) returns void
language plpgsql security definer set search_path='' as $$ begin
 perform private.exigir_cuenta();
 if p_token is null or p_token !~ '^(ExpoPushToken|ExponentPushToken)\[[A-Za-z0-9_-]{10,200}\]$' or p_idioma is null or p_idioma not in ('es','en','pt')
 then raise exception 'DATOS_INVALIDOS'; end if;
 insert into private.dispositivos_push(token,user_id,idioma) values(p_token,auth.uid(),p_idioma)
 on conflict(token) do update set user_id=excluded.user_id,idioma=excluded.idioma,habilitado=true,actualizado_en=now(),
 creado_en=case when dispositivos_push.user_id<>excluded.user_id then now() else dispositivos_push.creado_en end;
end; $$;
create function public.quitar_dispositivo_push(p_token text) returns void
language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'SESION_REQUERIDA'; end if;
 update private.dispositivos_push set habilitado=false where token=p_token and user_id=auth.uid();
end; $$;
revoke all on function public.registrar_dispositivo_push(text,text),public.quitar_dispositivo_push(text) from public,anon;
grant execute on function public.registrar_dispositivo_push(text,text),public.quitar_dispositivo_push(text) to authenticated;

-- Registra hechos una vez; no inventa eventos al leer el feed ni reconstruye pasado.
create function private.registrar_evento_club() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if tg_table_name='liga_fechas' then
  insert into private.eventos_club(id,liga_id,tipo,datos) values('fecha:'||new.id::text,new.liga_id,'fechas',jsonb_build_object('fecha_id',new.id,'cuando',new.cuando));
 elsif new.estado='finalizada' and old.estado is distinct from new.estado then
  insert into private.eventos_club(id,liga_id,temporada_id,tipo,datos) values('cierre:'||new.id::text,new.liga_id,new.id,'temporadas',jsonb_build_object('nombre',new.nombre)) on conflict do nothing;
 end if;
 return new;
end; $$;
revoke all on function private.registrar_evento_club() from public,anon,authenticated;
create trigger fecha_evento after insert on public.liga_fechas for each row execute function private.registrar_evento_club();
create trigger temporada_evento after update of estado on public.liga_temporadas for each row execute function private.registrar_evento_club();

-- Ranking de liga sólo con torneos completos: una eliminación parcial no cambia MVP.
do $$ declare firma text; original text; nueva text; begin
 foreach firma in array array['public.ranking_liga(uuid)','private.ranking_liga_sin_partida(uuid,uuid)'] loop
  original:=pg_get_functiondef(firma::regprocedure);
  nueva:=replace(original,'where r.temporada_id = p_temporada and r.finalizada_en is not null',
   'where r.temporada_id = p_temporada and r.finalizada_en is not null and exists(select 1 from public.liga_partidas completa where completa.sala_id=r.sala_id and completa.temporada_id=p_temporada and completa.finalizada_en is not null)');
  if nueva=original then raise exception 'BASE_RANKING_EVENTOS_INCOMPATIBLE'; end if;
  execute nueva;
 end loop;
 original:=pg_get_functiondef('public.accion_mesa(uuid,text,jsonb,text)'::regprocedure);
 nueva:=replace(original,'declare v_sala public.salas;', 'declare v_sala public.salas; evento_club uuid; evento_temporada uuid; lider_previo uuid; lider_nuevo uuid; nombre_lider text; partida_completa boolean;');
 nueva:=replace(nueva,'v_sala := public.accion_mesa_sin_estadisticas(',E'if p_accion=''cerrar_mano'' then\n perform 1 from public.salas where id=p_sala for update;\n select t.liga_id,t.id into evento_club,evento_temporada from public.salas s join public.liga_temporadas t on t.id=s.temporada_id where s.id=p_sala and t.estado=''activa'';\n if evento_club is not null then\n perform 1 from public.ligas where id=evento_club for update;\n select finalizada_en is not null into partida_completa from public.liga_partidas where sala_id=p_sala;\n end if;\n end if;\n v_sala := public.accion_mesa_sin_estadisticas(');
 nueva:=replace(nueva,'return v_sala;',E'if evento_club is not null and v_sala.estado=''finalizada'' and not coalesce(partida_completa,false) then\n select user_id into lider_previo from private.ranking_liga_sin_partida(evento_temporada,p_sala) where posicion=1;\n select user_id,nombre into lider_nuevo,nombre_lider from public.ranking_liga(evento_temporada) where posicion=1;\n if lider_nuevo is not null and lider_nuevo is distinct from lider_previo then\n insert into private.eventos_club(id,liga_id,temporada_id,tipo,datos) values(''mvp:''||p_sala::text,evento_club,evento_temporada,''mvp'',jsonb_build_object(''sala_id'',p_sala,''user_id'',lider_nuevo,''nombre'',nombre_lider)) on conflict do nothing;\n end if;\n insert into private.eventos_club(id,liga_id,temporada_id,tipo,datos) values(''rivalidad:''||p_sala::text,evento_club,evento_temporada,''rivalidades'',jsonb_build_object(''sala_id'',p_sala)) on conflict do nothing;\n end if;\n return v_sala;');
 if nueva=original or nueva not like '%lider_previo%' then raise exception 'BASE_ACCION_EVENTOS_INCOMPATIBLE'; end if;
 execute nueva;
end; $$;

create function private.exigir_dispatch(p_secreto text) returns void language plpgsql security definer set search_path='' as $$ begin
 if p_secreto is null or not exists(select 1 from private.config_push where id and secreto=p_secreto) then raise exception 'DISPATCH_NO_AUTORIZADO'; end if;
end; $$;
revoke all on function private.exigir_dispatch(text) from public,anon,authenticated;

-- Revalida vigencia de fecha, pertenencia, cuenta, token y consentimiento al reservar.
create function public.reservar_avisos_push(p_secreto text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c record; datos jsonb; previo_sub text; n integer; entrega uuid; resultado jsonb:='[]'; nemesis jsonb; begin
 perform private.exigir_dispatch(p_secreto);
 -- Un dispatcher por transacción: cupo combinado y unique event/user son atómicos.
 perform pg_advisory_xact_lock(19891008);
 insert into private.eventos_club(id,liga_id,tipo,datos)
 select 'recordatorio:'||l.id::text||':'||date_trunc('week',now() at time zone 'UTC')::date::text,l.id,'recordatorios',jsonb_build_object('dias',floor(extract(epoch from now()-a.ultima)/86400))
 from public.ligas l cross join lateral(select max(p.finalizada_en) ultima from public.liga_partidas p join public.liga_temporadas t on t.id=p.temporada_id where t.liga_id=l.id) a
 where l.estado='activa' and a.ultima<now()-interval '12 days'
 and exists(select 1 from private.preferencias_avisos_club pref where pref.liga_id=l.id and pref.activos and pref.recordatorios)
 on conflict do nothing;
 previo_sub:=current_setting('request.jwt.claim.sub',true);
 for c in
 select e.*,p.user_id,p.pique,p.limite_social,d.token,d.idioma from private.eventos_club e
 join private.preferencias_avisos_club p on p.liga_id=e.liga_id and p.activos
 join public.liga_miembros m on m.liga_id=e.liga_id and m.user_id=p.user_id and m.activo
 join auth.users u on u.id=p.user_id and u.is_anonymous is false
 join public.ligas l on l.id=e.liga_id and l.estado='activa'
 cross join lateral(select * from private.dispositivos_push t where t.user_id=p.user_id and t.habilitado and t.actualizado_en>now()-interval '90 days' order by t.actualizado_en desc,t.token limit 1) d
 where e.creado_en>now()-interval '72 hours' and e.creado_en>=d.creado_en and e.creado_en>=p.activo_desde
 and case e.tipo when 'mvp' then p.mvp when 'rivalidades' then p.rivalidades when 'fechas' then p.fechas when 'temporadas' then p.temporadas else p.recordatorios end
 and not exists(select 1 from private.entregas_push x where x.evento_id=e.id and x.user_id=p.user_id)
 and (e.tipo<>'fechas' or exists(select 1 from public.liga_fechas f where f.id=(e.datos->>'fecha_id')::uuid and f.estado='programada' and f.cuando>now()))
 order by e.creado_en,e.id,p.user_id limit 100
 loop
  datos:=c.datos;
  if c.tipo in ('rivalidades','recordatorios') then
   select count(*) into n from private.entregas_push x join private.eventos_club e on e.id=x.evento_id
   where x.user_id=c.user_id and e.liga_id=c.liga_id and e.tipo in ('rivalidades','recordatorios') and x.reservada_en>now()-interval '7 days';
   if n>=c.limite_social then continue; end if;
  end if;
  if c.tipo='rivalidades' then
   perform set_config('request.jwt.claim.sub',c.user_id::text,true);
   nemesis:=private.rivalidades_temporada(c.temporada_id)->'nemesis';
   if nemesis is null or nemesis='null'::jsonb or c.datos->>'sala_id' is distinct from (select sala_id::text from public.liga_partidas where temporada_id=c.temporada_id and finalizada_en is not null order by finalizada_en desc,sala_id limit 1) or not exists(select 1 from public.puntuacion_partidas propia join public.puntuacion_partidas rival on rival.sala_id=propia.sala_id and rival.user_id=(nemesis->>'user_id')::uuid where propia.sala_id=(c.datos->>'sala_id')::uuid and propia.user_id=c.user_id and propia.puesto>rival.puesto) then continue; end if;
   datos:=jsonb_build_object('nombre',nemesis->>'nombre','derrotas',nemesis->'derrotas','compartidas',nemesis->'compartidas');
  end if;
  insert into private.entregas_push(evento_id,user_id,token) values(c.id,c.user_id,c.token) on conflict do nothing returning id into entrega;
  if entrega is not null then resultado:=resultado||jsonb_build_array(jsonb_build_object('id',entrega,'token',c.token,'idioma',c.idioma,'pique',c.pique,'tipo',c.tipo,'datos',datos,'liga',c.liga_id,'temporada',c.temporada_id)); end if;
  if jsonb_array_length(resultado)>=30 then exit; end if;
 end loop;
 perform set_config('request.jwt.claim.sub',coalesce(previo_sub,''),true);
 return resultado;
end; $$;

create function public.confirmar_aviso_push(p_secreto text,p_id uuid,p_estado text,p_ticket text default null,p_error text default null) returns void
language plpgsql security definer set search_path='' as $$ begin
 perform private.exigir_dispatch(p_secreto);
 if p_estado not in ('aceptada','confirmada','fallida','incierta') or (p_estado='aceptada' and (p_ticket is null or char_length(p_ticket)>200)) then raise exception 'DATOS_INVALIDOS'; end if;
 if p_error='DeviceNotRegistered' then
  update private.dispositivos_push set habilitado=false where token=(select token from private.entregas_push where id=p_id);
  update private.entregas_push set estado='fallida',comprobada_en=now() where id=p_id;
 else
  update private.entregas_push set estado=p_estado,ticket=coalesce(p_ticket,ticket),comprobada_en=case when p_estado in ('confirmada','fallida') then now() else null end where id=p_id and (estado='reservada' or (estado='aceptada' and p_estado in ('confirmada','fallida')));
 end if;
end; $$;
create function public.validar_entrega_push(p_secreto text,p_id uuid) returns boolean language plpgsql stable security definer set search_path='' as $$ begin
 perform private.exigir_dispatch(p_secreto);
 return exists(select 1 from private.entregas_push x join private.eventos_club e on e.id=x.evento_id
 join private.dispositivos_push d on d.token=x.token and d.user_id=x.user_id and d.habilitado
 join private.preferencias_avisos_club p on p.liga_id=e.liga_id and p.user_id=x.user_id and p.activos
 join public.liga_miembros m on m.liga_id=e.liga_id and m.user_id=x.user_id and m.activo
 join auth.users u on u.id=x.user_id and u.is_anonymous is false
 join public.ligas l on l.id=e.liga_id and l.estado='activa'
 where x.id=p_id and x.estado='reservada' and e.creado_en>=p.activo_desde
 and case e.tipo when 'mvp' then p.mvp when 'rivalidades' then p.rivalidades when 'fechas' then p.fechas when 'temporadas' then p.temporadas else p.recordatorios end
 and (e.tipo<>'fechas' or exists(select 1 from public.liga_fechas f where f.id=(e.datos->>'fecha_id')::uuid and f.estado='programada' and f.cuando>now())));
end; $$;
create function public.recibos_avisos_push(p_secreto text) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb; begin
 perform private.exigir_dispatch(p_secreto);
 update private.entregas_push set estado='incierta' where (estado='reservada' and reservada_en<now()-interval '10 minutes') or (estado='aceptada' and reservada_en<now()-interval '24 hours');
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'ticket',ticket)),'[]') into r from (select id,ticket from private.entregas_push where estado='aceptada' and comprobada_en is null and reservada_en between now()-interval '24 hours' and now()-interval '15 minutes' order by reservada_en limit 100) x;
 return r;
end; $$;
revoke all on function public.reservar_avisos_push(text),public.confirmar_aviso_push(text,uuid,text,text,text),public.recibos_avisos_push(text),public.validar_entrega_push(text,uuid) from public,anon,authenticated;
grant execute on function public.reservar_avisos_push(text),public.confirmar_aviso_push(text,uuid,text,text,text),public.recibos_avisos_push(text),public.validar_entrega_push(text,uuid) to service_role;
do $$ declare original text; nueva text; begin
 original:=pg_get_functiondef('private.feed_club(uuid,uuid)'::regprocedure);
 nueva:=replace(original,'), limitados as (',E'union all\n select e.id,e.creado_en,jsonb_build_object(''id'',e.id,''tipo'',''mvp'',''fecha'',e.creado_en,''precision'',''instante'',''nombre'',e.datos->>''nombre'') from (select * from private.eventos_club where liga_id=p_liga and temporada_id=p_temporada and tipo=''mvp'' order by creado_en desc,id limit 20) e\n ), limitados as (');
 if nueva=original then raise exception 'BASE_FEED_EVENTOS_INCOMPATIBLE'; end if;
 execute nueva;
end; $$;
commit;
