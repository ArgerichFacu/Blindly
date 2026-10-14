begin;
-- Mismo trim Unicode que String.trim(): un alias sólo de NBSP también es vacío.
create or replace function private.validar_nombre_visible(p_nombre text) returns text
language plpgsql immutable set search_path = '' as $$
declare v_nombre text;
begin
  if p_nombre is null or p_nombre ~ '[[:cntrl:]]' or p_nombre ~ U&'[\0080-\009F\2028\2029\202A-\202E\2066-\2069]' then
    raise exception 'NOMBRE_VISIBLE_INVALIDO';
  end if;
  v_nombre := pg_catalog.btrim(p_nombre, U&'\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\202F\205F\3000\FEFF');
  if pg_catalog.char_length(v_nombre) not between 1 and 30 then raise exception 'NOMBRE_VISIBLE_INVALIDO'; end if;
  return v_nombre;
end $$;
revoke all on function private.validar_nombre_visible(text) from public, anon, authenticated;
commit;
