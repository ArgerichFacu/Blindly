begin;
-- Los UUID dentro de snapshots JSON no tienen FK: retirar también el nombre
-- del evento histórico al borrar su identidad. Entregas asociadas hacen cascade.
create function private.borrar_eventos_identidad() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 delete from private.eventos_club where tipo='mvp' and datos->>'user_id'=old.id::text;
 return old;
end; $$;
revoke all on function private.borrar_eventos_identidad() from public,anon,authenticated;
create trigger borrar_eventos_blindly before delete on auth.users
 for each row execute function private.borrar_eventos_identidad();
create index eventos_club_mvp_usuario_idx on private.eventos_club ((datos->>'user_id')) where tipo='mvp';
commit;
