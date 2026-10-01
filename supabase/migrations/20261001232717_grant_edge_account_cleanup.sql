-- Las Edge Functions autenticadas solo necesitan comprobar si la cuenta
-- participa en una partida activa antes de eliminarla.
grant select on table public.salas, public.jugadores to service_role;
