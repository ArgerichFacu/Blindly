begin;
alter table public.liga_miembros add column titulo_personalizado text
  check (titulo_personalizado is null or char_length(titulo_personalizado) between 2 and 24);

-- La verificación comercial existente es la única fuente; no hay bandera cliente.
create function private.liga_tiene_plus(p_liga uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select coalesce((select exists(select 1 from auth.users u where u.id=l.owner_id and u.is_anonymous is false) and private.tiene_plus(l.owner_id)
   from public.ligas l where l.id=p_liga),false);
$$;
create function private.puede_editar_titulos(p_liga uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select private.puede_administrar_liga(p_liga) and private.liga_tiene_plus(p_liga)
   and exists(select 1 from public.ligas where id=p_liga and estado='activa');
$$;
revoke all on function private.liga_tiene_plus(uuid),private.puede_editar_titulos(uuid) from public,anon,authenticated;

create function public.asignar_titulo_liga(p_liga uuid,p_usuario uuid,p_titulo text) returns void
language plpgsql security definer set search_path = '' as $$
declare titulo text; begin
 perform private.exigir_cuenta();
 perform 1 from public.ligas where id=p_liga for update;
 if not private.puede_administrar_liga(p_liga) then raise exception 'SOLO_ADMIN'; end if;
 if not private.puede_editar_titulos(p_liga) then raise exception 'PLUS_CLUB_REQUERIDO'; end if;
 titulo:=nullif(btrim(regexp_replace(coalesce(p_titulo,''),'[[:space:][:cntrl:]]+',' ','g')),'');
 titulo:=nullif(btrim(regexp_replace(titulo,U&'[\200B-\200F\202A-\202E\2060-\206F\FEFF]','','g')),'');
 if titulo is not null and (char_length(titulo) not between 2 and 24
   or titulo ~ '[<>/]' or position(chr(92) in titulo)>0
   or titulo ~* '(^|[[:space:]])(www\.|https?:)') then raise exception 'TITULO_INVALIDO'; end if;
 update public.liga_miembros set titulo_personalizado=titulo where liga_id=p_liga and user_id=p_usuario and activo;
 if not found then raise exception 'MIEMBRO_NO_EXISTE'; end if;
end; $$;
revoke all on function public.asignar_titulo_liga(uuid,uuid,text) from public,anon;
grant execute on function public.asignar_titulo_liga(uuid,uuid,text) to authenticated;

-- Envuelve sin duplicar ranking/movimientos ni ampliar la lectura privada.
alter function public.detalle_liga(uuid,uuid) set schema private;
alter function private.detalle_liga(uuid,uuid) rename to detalle_liga_sin_titulos;
revoke all on function private.detalle_liga_sin_titulos(uuid,uuid) from public,anon,authenticated;
create function public.detalle_liga(p_liga uuid,p_temporada uuid default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare resultado jsonb; begin
 resultado:=private.detalle_liga_sin_titulos(p_liga,p_temporada);
 resultado:=jsonb_set(resultado,'{liga}',(resultado->'liga') || jsonb_build_object('permisos',
   jsonb_build_object('plus',private.liga_tiene_plus(p_liga),'editar_titulos',private.puede_editar_titulos(p_liga))));
 resultado:=jsonb_set(resultado,'{miembros}',coalesce((select jsonb_agg(v || jsonb_build_object(
   'titulo_personalizado',(select m.titulo_personalizado from public.liga_miembros m where m.liga_id=p_liga and m.user_id=(v->>'user_id')::uuid)))
   from jsonb_array_elements(resultado->'miembros') v),'[]'::jsonb));
 resultado:=jsonb_set(resultado,'{ranking}',coalesce((select jsonb_agg(v || jsonb_build_object(
   'titulo_personalizado',(select m.titulo_personalizado from public.liga_miembros m where m.liga_id=p_liga and m.user_id=(v->>'user_id')::uuid)) order by (v->>'posicion')::bigint)
   from jsonb_array_elements(resultado->'ranking') v),'[]'::jsonb));
 return resultado;
end; $$;
revoke all on function public.detalle_liga(uuid,uuid) from public,anon;
grant execute on function public.detalle_liga(uuid,uuid) to authenticated;
-- Invalida detalles abiertos cuando un admin cambia título/rol/membresía.
alter publication supabase_realtime add table public.liga_miembros;
commit;
