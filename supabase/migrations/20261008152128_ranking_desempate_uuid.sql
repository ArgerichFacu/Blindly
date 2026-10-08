begin;
-- Un puesto único: mismos criterios previos, UUID como último desempate estable
-- para nombres y métricas idénticas. MVP usa exactamente este puesto 1.
do $$ declare original text; nueva text; previa text; begin
 original:=pg_catalog.pg_get_functiondef('public.ranking_liga(uuid)'::regprocedure);
 nueva:=replace(original,'select rank() over (','select row_number() over (');
 nueva:=replace(nueva,'t.posicion_media asc, t.nombre asc','t.posicion_media asc, t.nombre asc, t.user_id asc');
 if nueva=original or nueva not like '%t.user_id asc%' then raise exception 'BASE_RANKING_INCOMPATIBLE'; end if;
 execute nueva;
 -- Misma clasificación, omitiendo una partida completa para comparar posiciones.
 previa:=replace(nueva,'public.ranking_liga(p_temporada uuid)','private.ranking_liga_sin_partida(p_temporada uuid, p_ignorar_sala uuid)');
 previa:=replace(previa,'where r.temporada_id = p_temporada and r.finalizada_en is not null','where r.temporada_id = p_temporada and r.finalizada_en is not null and r.sala_id<>p_ignorar_sala');
 if previa=nueva or previa not like '%private.ranking_liga_sin_partida%' then raise exception 'BASE_MOVIMIENTO_INCOMPATIBLE'; end if;
 execute previa;
end; $$;
revoke all on function private.ranking_liga_sin_partida(uuid,uuid) from public,anon,authenticated;

do $$ declare original text; nueva text; begin
 original:=pg_catalog.pg_get_functiondef('public.detalle_liga(uuid,uuid)'::regprocedure);
 nueva:=replace(original,'declare resultado jsonb;','declare resultado jsonb; ultima uuid; movimientos jsonb;');
 nueva:=replace(nueva,'return resultado;',E'select p.sala_id into ultima from public.liga_partidas p where p.temporada_id=(resultado#>>''{temporada,id}'')::uuid and p.finalizada_en is not null order by p.finalizada_en desc,p.sala_id asc limit 1;\n if ultima is not null then\n  select coalesce(jsonb_object_agg(actual->>''user_id'',previa.posicion-(actual->>''posicion'')::bigint),''{}''::jsonb) into movimientos from jsonb_array_elements(resultado->''ranking'') actual join private.ranking_liga_sin_partida((resultado#>>''{temporada,id}'')::uuid,ultima) previa on previa.user_id=(actual->>''user_id'')::uuid;\n end if;\n resultado:=resultado || jsonb_build_object(''movimientos'',coalesce(movimientos,''{}''::jsonb));\n return resultado;');
 if nueva=original then raise exception 'BASE_DETALLE_RANKING_INCOMPATIBLE'; end if;
 execute nueva;
end; $$;
-- Eventos de finalización; lectura y entrega siguen limitadas por RLS del club.
alter publication supabase_realtime add table public.liga_partidas;
alter publication supabase_realtime add table public.liga_temporadas;
commit;
