begin;
-- DEPRECATED: v32 no ofrece waitlist ni interés previo al lanzamiento.
-- Se conserva toda la información histórica y la forma de estado_founder_trial
-- para clientes Alpha anteriores. Ninguna operación toca trials ni compras.
comment on function public.registrar_waitlist_plus() is 'DEPRECATED v32: historial conservado; no accesible a clientes.';
comment on function public.registrar_interes_plus(text) is 'DEPRECATED v32: historial conservado; no accesible a clientes.';
comment on column private.plus_founder_funnel.waitlist is 'DEPRECATED v32: dato histórico; no se ofrecen nuevas altas.';
comment on column private.plus_founder_funnel.interest_plan is 'DEPRECATED v32: intención histórica anterior a compras.';
revoke execute on function public.registrar_waitlist_plus(), public.registrar_interes_plus(text) from public, anon, authenticated;
commit;
