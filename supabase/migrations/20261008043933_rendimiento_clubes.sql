begin;
-- Cubren búsquedas de salas pendientes por temporada y referencias de plantillas.
create index salas_temporada_id_idx on public.salas(temporada_id);
create index mesas_habituales_temporada_id_idx on public.mesas_habituales(temporada_id);
-- Evalúa la identidad una vez por consulta; mantiene exactamente el mismo owner.
alter policy "owner ve sus mesas habituales" on public.mesas_habituales
 using (owner_id = (select auth.uid()));
commit;
