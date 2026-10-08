begin;
create table public.liga_fechas (
 id uuid primary key default gen_random_uuid(),
 liga_id uuid not null references public.ligas(id) on delete cascade,
 cuando timestamptz not null,
 lugar text not null default '' check(char_length(lugar)<=100),
 nota text not null default '' check(char_length(nota)<=280),
 estado text not null default 'programada' check(estado in ('programada','cancelada','finalizada')),
 creada_en timestamptz not null default now(),
 unique(id,liga_id)
);
create unique index liga_fecha_programada_unica on public.liga_fechas(liga_id) where estado='programada';
create index liga_fechas_historia_idx on public.liga_fechas(liga_id,cuando desc);
create table public.liga_asistencias (
 fecha_id uuid not null,
 liga_id uuid not null,
 user_id uuid not null,
 respuesta text not null check(respuesta in ('voy','no_puedo','pendiente')),
 actualizada_en timestamptz not null default now(),
 primary key(fecha_id,user_id),
 foreign key(fecha_id,liga_id) references public.liga_fechas(id,liga_id) on delete cascade,
 foreign key(liga_id,user_id) references public.liga_miembros(liga_id,user_id) on delete cascade
);
create index liga_asistencias_miembro_idx on public.liga_asistencias(liga_id,user_id);
create index liga_asistencias_fecha_idx on public.liga_asistencias(fecha_id,liga_id);
alter table public.liga_fechas enable row level security;
alter table public.liga_asistencias enable row level security;
revoke all on public.liga_fechas,public.liga_asistencias from public,anon,authenticated;
grant select on public.liga_fechas,public.liga_asistencias to authenticated;
create policy "miembros ven fechas" on public.liga_fechas for select to authenticated using(private.puede_ver_liga(liga_id));
create policy "miembros ven asistencias" on public.liga_asistencias for select to authenticated using(private.puede_ver_liga(liga_id));

create function public.programar_fecha_liga(p_liga uuid,p_cuando timestamptz,p_lugar text,p_nota text,p_reemplazar uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare anterior uuid; nueva uuid; begin
 perform private.exigir_cuenta();
 perform 1 from public.ligas where id=p_liga and estado='activa' for update;
 if not found or not private.puede_administrar_liga(p_liga) then raise exception 'SOLO_ADMIN'; end if;
 if p_cuando is null or p_cuando<=now() or p_cuando>now()+interval '1 year'
   or char_length(coalesce(p_lugar,''))>100 or char_length(coalesce(p_nota,''))>280 then raise exception 'FECHA_INVALIDA'; end if;
 update public.liga_fechas set estado='finalizada' where liga_id=p_liga and estado='programada' and cuando<=now();
 select id into anterior from public.liga_fechas where liga_id=p_liga and estado='programada';
 if anterior is distinct from p_reemplazar then raise exception 'FECHA_CAMBIO'; end if;
 update public.liga_fechas set estado='cancelada' where id=anterior;
 insert into public.liga_fechas(liga_id,cuando,lugar,nota) values(p_liga,p_cuando,btrim(coalesce(p_lugar,'')),btrim(coalesce(p_nota,''))) returning id into nueva;
 return nueva;
end; $$;
create function public.cancelar_fecha_liga(p_fecha uuid) returns void language plpgsql security definer set search_path='' as $$
declare club uuid; begin
 perform private.exigir_cuenta();
 select liga_id into club from public.liga_fechas where id=p_fecha;
 perform 1 from public.ligas where id=club and estado='activa' for update;
 if not found or not private.puede_administrar_liga(club) then raise exception 'SOLO_ADMIN'; end if;
 update public.liga_fechas set estado='cancelada' where id=p_fecha and estado='programada';
 if not found then raise exception 'FECHA_CAMBIO'; end if;
end; $$;
create function public.responder_fecha_liga(p_fecha uuid,p_respuesta text) returns void language plpgsql security definer set search_path='' as $$
declare club uuid; begin
 perform private.exigir_cuenta();
 select liga_id into club from public.liga_fechas where id=p_fecha;
 perform 1 from public.ligas where id=club and estado='activa' for update;
 if not found or not private.puede_ver_liga(club) then raise exception 'LIGA_NO_DISPONIBLE'; end if;
 if p_respuesta is null or p_respuesta not in ('voy','no_puedo','pendiente') then raise exception 'DATOS_INVALIDOS'; end if;
 if not exists(select 1 from public.liga_fechas where id=p_fecha and estado='programada' and cuando>now()) then raise exception 'FECHA_CAMBIO'; end if;
 insert into public.liga_asistencias(fecha_id,liga_id,user_id,respuesta) values(p_fecha,club,auth.uid(),p_respuesta)
 on conflict(fecha_id,user_id) do update set respuesta=excluded.respuesta,actualizada_en=now();
end; $$;
revoke all on function public.programar_fecha_liga(uuid,timestamptz,text,text,uuid),public.cancelar_fecha_liga(uuid),public.responder_fecha_liga(uuid,text) from public,anon;
grant execute on function public.programar_fecha_liga(uuid,timestamptz,text,text,uuid),public.cancelar_fecha_liga(uuid),public.responder_fecha_liga(uuid,text) to authenticated;

alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_fecha;
revoke all on function private.detalle_liga_sin_fecha(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb; fecha public.liga_fechas; resumen jsonb; begin
 resultado:=private.detalle_liga_sin_fecha(p_liga,p_temporada);
 select * into fecha from public.liga_fechas where liga_id=p_liga and estado='programada' and cuando>now();
 if fecha.id is not null then
  select jsonb_build_object('confirmados',count(*) filter(where a.respuesta='voy'),'no_pueden',count(*) filter(where a.respuesta='no_puedo'),
    'pendientes',count(*) filter(where a.respuesta is null or a.respuesta='pendiente')) into resumen
   from public.liga_miembros m left join public.liga_asistencias a on a.user_id=m.user_id and a.fecha_id=fecha.id where m.liga_id=p_liga and m.activo;
  resumen:=to_jsonb(fecha)||resumen||jsonb_build_object('mi_respuesta',coalesce((select respuesta from public.liga_asistencias where fecha_id=fecha.id and user_id=auth.uid()),'pendiente'));
 end if;
 return resultado || jsonb_build_object('proxima_fecha',resumen);
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;
alter publication supabase_realtime add table public.liga_fechas;
alter publication supabase_realtime add table public.liga_asistencias;
commit;
