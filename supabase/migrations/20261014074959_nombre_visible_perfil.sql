begin;
-- Etiqueta visible, jamás una identidad ni un permiso. No toca snapshots históricos.
create function private.validar_nombre_visible(p_nombre text) returns text
language plpgsql immutable set search_path = '' as $$
declare v_nombre text;
begin
  if p_nombre is null or p_nombre ~ '[[:cntrl:]]' or p_nombre ~ U&'[\0085\2028\2029]' then
    raise exception 'NOMBRE_VISIBLE_INVALIDO';
  end if;
  v_nombre := pg_catalog.btrim(p_nombre);
  if pg_catalog.char_length(v_nombre) not between 1 and 30 then raise exception 'NOMBRE_VISIBLE_INVALIDO'; end if;
  return v_nombre;
end $$;

create function private.sincronizar_nombre_visible() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_nombre text;
begin
  if new.raw_user_meta_data->>'display_name' is distinct from old.raw_user_meta_data->>'display_name' then
    v_nombre := private.validar_nombre_visible(new.raw_user_meta_data->>'display_name');
    update public.liga_miembros m set nombre = v_nombre
      from public.ligas l where m.liga_id = l.id and m.user_id = new.id
      and m.activo and l.estado = 'activa' and m.nombre is distinct from v_nombre;
  end if;
  return new;
end $$;

create trigger blindly_nombre_visible after update of raw_user_meta_data on auth.users
for each row execute function private.sincronizar_nombre_visible();

-- Una partida que termina después de editar el perfil no vuelve a imponer el alias viejo.
create function private.preferir_nombre_visible_miembro() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_nombre text;
begin
  if new.activo and exists(select 1 from public.ligas l where l.id = new.liga_id and l.estado = 'activa') then
    select u.raw_user_meta_data->>'display_name' into v_nombre from auth.users u where u.id = new.user_id;
    if v_nombre is not null then new.nombre := private.validar_nombre_visible(v_nombre); end if;
  end if;
  return new;
end $$;
create trigger blindly_nombre_miembro before insert or update of nombre on public.liga_miembros
for each row execute function private.preferir_nombre_visible_miembro();

-- Reparación idempotente para clientes, siempre restringida a la identidad autenticada.
create function public.actualizar_mi_nombre_visible(p_nombre text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_nombre text := private.validar_nombre_visible(p_nombre);
begin
  if v_uid is null or not exists (select 1 from auth.users u where u.id = v_uid
    and (u.banned_until is null or u.banned_until <= pg_catalog.now())) then raise exception 'SESION_REQUERIDA'; end if;
  if not exists (select 1 from auth.users u where u.id = v_uid
    and u.raw_user_meta_data->>'display_name' = v_nombre) then raise exception 'NOMBRE_VISIBLE_NO_COINCIDE'; end if;
  update public.liga_miembros m set nombre = v_nombre
    from public.ligas l where m.liga_id = l.id and m.user_id = v_uid
    and m.activo and l.estado = 'activa' and m.nombre is distinct from v_nombre;
end $$;
revoke all on function private.validar_nombre_visible(text), private.sincronizar_nombre_visible(), private.preferir_nombre_visible_miembro() from public, anon, authenticated;
revoke all on function public.actualizar_mi_nombre_visible(text) from public, anon;
grant execute on function public.actualizar_mi_nombre_visible(text) to authenticated;
commit;
