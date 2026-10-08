import type { User } from "@supabase/supabase-js";
type UsuarioIdentidad = Pick<
  User,
  "id" | "is_anonymous" | "email" | "email_confirmed_at" | "identities"
>;
export function identidadUsuario(usuario: UsuarioIdentidad) {
  const invitado = usuario.is_anonymous !== false;
  const clave =
    !invitado && usuario.email === `${usuario.id}@recovery.blindly.invalid`;
  const correo =
    !invitado && !!usuario.email && !!usuario.email_confirmed_at && !clave;
  const social =
    !invitado &&
    (usuario.identities ?? []).some(
      (i) =>
        i.user_id === usuario.id && !["email", "phone"].includes(i.provider),
    );
  return {
    id: usuario.id,
    invitado,
    recuperable: clave || correo || social,
    metodo: clave ? "clave" : correo ? "correo" : social ? "social" : "ninguno",
  } as const;
}
// Un nombre repetido o una fila legacy sin UUID nunca acredita propiedad.
export function esMiJugador(
  jugador: { user_id?: string | null },
  usuarioId: string | null | undefined,
) {
  return !!usuarioId && !!jugador.user_id && jugador.user_id === usuarioId;
}
