begin;
-- Preferencias privadas por identidad/club; nunca preferencias de otro miembro.
create table private.preferencias_avisos_club (
 liga_id uuid not null, user_id uuid not null,
 activos boolean not null default false, pique boolean not null default false,
 mvp boolean not null default true, rivalidades boolean not null default true,
 fechas boolean not null default true, temporadas boolean not null default true,
 recordatorios boolean not null default true,
 limite_social integer not null default 2 check(limite_social between 0 and 2),
 revision integer not null default 1 check(revision>0),
 primary key(liga_id,user_id),
 foreign key(liga_id,user_id) references public.liga_miembros(liga_id,user_id) on delete cascade
);
create index preferencias_avisos_usuario_idx on private.preferencias_avisos_club(user_id);
alter table private.preferencias_avisos_club enable row level security;
revoke all on private.preferencias_avisos_club from public,anon,authenticated;

create function private.mis_preferencias_avisos(p_liga uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb; begin
 perform private.exigir_cuenta();
 if not private.puede_ver_liga(p_liga) then raise exception 'LIGA_NO_DISPONIBLE'; end if;
 select to_jsonb(p)-'liga_id'-'user_id' into resultado from private.preferencias_avisos_club p
 where liga_id=p_liga and user_id=auth.uid();
 return coalesce(resultado,jsonb_build_object('activos',false,'pique',false,'mvp',true,'rivalidades',true,
 'fechas',true,'temporadas',true,'recordatorios',true,'limite_social',2,'revision',0));
end; $$;
revoke all on function private.mis_preferencias_avisos(uuid) from public,anon,authenticated;

create function public.guardar_preferencias_avisos(p_liga uuid,p_preferencias jsonb,p_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare clave text; begin
 perform private.exigir_cuenta();
 perform 1 from public.ligas where id=p_liga for update;
 if not private.puede_ver_liga(p_liga) then raise exception 'LIGA_NO_DISPONIBLE'; end if;
 if p_revision is null or p_revision<0 or jsonb_typeof(p_preferencias) is distinct from 'object'
 then raise exception 'DATOS_INVALIDOS'; end if;
 if (select count(*) from jsonb_object_keys(p_preferencias))<>8
 or exists(select 1 from jsonb_object_keys(p_preferencias) k where k not in
 ('activos','pique','mvp','rivalidades','fechas','temporadas','recordatorios','limite_social'))
 then raise exception 'DATOS_INVALIDOS'; end if;
 foreach clave in array array['activos','pique','mvp','rivalidades','fechas','temporadas','recordatorios'] loop
  if jsonb_typeof(p_preferencias->clave) is distinct from 'boolean' then raise exception 'DATOS_INVALIDOS'; end if;
 end loop;
 if jsonb_typeof(p_preferencias->'limite_social') is distinct from 'number'
 or (p_preferencias->>'limite_social') not in ('0','1','2') then raise exception 'DATOS_INVALIDOS'; end if;
 if p_revision<>coalesce((select revision from private.preferencias_avisos_club where liga_id=p_liga and user_id=auth.uid()),0)
 then raise exception 'AVISOS_CAMBIARON'; end if;
 insert into private.preferencias_avisos_club(liga_id,user_id,activos,pique,mvp,rivalidades,fechas,temporadas,recordatorios,limite_social)
 values(p_liga,auth.uid(),(p_preferencias->>'activos')::boolean,(p_preferencias->>'pique')::boolean,
 (p_preferencias->>'mvp')::boolean,(p_preferencias->>'rivalidades')::boolean,(p_preferencias->>'fechas')::boolean,
 (p_preferencias->>'temporadas')::boolean,(p_preferencias->>'recordatorios')::boolean,(p_preferencias->>'limite_social')::integer)
 on conflict(liga_id,user_id) do update set activos=excluded.activos,pique=excluded.pique,mvp=excluded.mvp,
 rivalidades=excluded.rivalidades,fechas=excluded.fechas,temporadas=excluded.temporadas,
 recordatorios=excluded.recordatorios,limite_social=excluded.limite_social,revision=preferencias_avisos_club.revision+1;
 return private.mis_preferencias_avisos(p_liga);
end; $$;
revoke all on function public.guardar_preferencias_avisos(uuid,jsonb,integer) from public,anon;
grant execute on function public.guardar_preferencias_avisos(uuid,jsonb,integer) to authenticated;

alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_preferencias;
revoke all on function private.detalle_liga_sin_preferencias(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 return private.detalle_liga_sin_preferencias(p_liga,p_temporada)||
 jsonb_build_object('preferencias_avisos',private.mis_preferencias_avisos(p_liga));
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;
commit;
