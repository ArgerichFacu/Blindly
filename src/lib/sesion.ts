import type { User } from "@supabase/supabase-js";
import { tienePlusActivo } from "./plus";
import { supabase } from "./supabase";
let iniciando: Promise<User> | null = null;
export async function asegurarSesion(): Promise<User> {
  if (iniciando) return iniciando;
  iniciando = (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) return data.session.user;
    const nueva = await supabase.auth.signInAnonymously();
    if (nueva.error || !nueva.data.user)
      throw nueva.error ?? new Error("SESION_REQUERIDA");
    return nueva.data.user;
  })();
  try {
    return await iniciando;
  } finally {
    iniciando = null;
  }
}
export type SolicitudCuenta = {
  email: string;
  tipo: "email_change" | "email";
  usuario: string;
};
async function validarCambioCuenta(usuario: User) {
  const [puntos, plusActivo] = await Promise.all([
    supabase.rpc("mi_puntuacion"),
    tienePlusActivo(),
  ]);
  if (puntos.error) throw puntos.error;
  const partidas = await supabase
    .from("jugadores")
    .select("sala:salas!inner(estado)")
    .eq("user_id", usuario.id)
    .in("sala.estado", ["jugando", "pausado"])
    .limit(1);
  if (partidas.error) throw partidas.error;
  if (
    (usuario.is_anonymous && puntos.data?.partidas > 0) ||
    partidas.data?.length ||
    plusActivo
  )
    throw new Error("PROTEGER_INVITADO");
}
export async function solicitarCodigo(
  email: string,
  recuperar: boolean,
): Promise<SolicitudCuenta> {
  const usuario = await asegurarSesion();
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("EMAIL_INVALIDO");
  if (!recuperar && !usuario.is_anonymous)
    throw new Error("CUENTA_YA_VINCULADA");
  if (recuperar) await validarCambioCuenta(usuario);
  const { error } = recuperar
    ? await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      })
    : await supabase.auth.updateUser({ email });
  if (error) throw error;
  return {
    email,
    tipo: recuperar ? "email" : "email_change",
    usuario: usuario.id,
  };
}
export async function confirmarCodigo(
  solicitud: SolicitudCuenta,
  token: string,
) {
  const actual = await asegurarSesion();
  if (actual.id !== solicitud.usuario) throw new Error("SESION_CAMBIO");
  if (solicitud.tipo === "email") await validarCambioCuenta(actual);
  const { data, error } = await supabase.auth.verifyOtp({
    email: solicitud.email,
    token: token.trim(),
    type: solicitud.tipo,
  });
  if (error) throw error;
  if (!data.user || !data.session) throw new Error("CODIGO_NO_CONFIRMADO");
  if (solicitud.tipo === "email_change" && data.user.id !== solicitud.usuario)
    throw new Error("SESION_CAMBIO");
  return data.user;
}

export async function eliminarCuenta() {
  await asegurarSesion();
  const { error } = await supabase.functions.invoke("eliminar-cuenta", {
    method: "POST",
  });
  if (error) {
    const contexto = (
      error as { context?: { json?: () => Promise<{ code?: string }> } }
    ).context;
    const respuesta = contexto?.json
      ? await contexto.json().catch(() => null)
      : null;
    throw new Error(respuesta?.code ?? "CUENTA_NO_ELIMINADA");
  }
  const salida = await supabase.auth.signOut({ scope: "local" });
  if (salida.error) throw salida.error;
}
