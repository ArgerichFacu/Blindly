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
const DOMINIO_RECUPERACION = "@recovery.blindly.invalid";

export function cuentaConClave(usuario: User) {
  return (
    usuario.is_anonymous === false &&
    usuario.email === `${usuario.id}${DOMINIO_RECUPERACION}`
  );
}

async function codigoFuncion(error: unknown, fallback: string) {
  const contexto = (
    error as { context?: { json?: () => Promise<{ code?: string }> } }
  ).context;
  const respuesta = contexto?.json
    ? await contexto.json().catch(() => null)
    : null;
  return respuesta?.code ?? fallback;
}
async function validarCambioCuenta(usuario: User) {
  // Los invitados legacy pueden tener ligas o mesas guardadas aun sin puntos o Plus vigente.
  const social = usuario.is_anonymous
    ? await Promise.all([
        supabase.rpc("mis_ligas"),
        supabase.rpc("mis_mesas_habituales"),
      ])
    : [];
  for (const respuesta of social) {
    if (respuesta.error) throw respuesta.error;
    if (!Array.isArray(respuesta.data)) throw new Error("SESION_REQUERIDA");
  }
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
    social.some(
      (respuesta) => Array.isArray(respuesta.data) && respuesta.data.length > 0,
    ) ||
    partidas.data?.length ||
    plusActivo
  )
    throw new Error("PROTEGER_INVITADO");
  const vigente = await supabase.auth.getSession();
  if (vigente.error) throw vigente.error;
  if (vigente.data.session?.user.id !== usuario.id)
    throw new Error("SESION_CAMBIO");
}
export async function solicitarCodigo(
  email: string,
  recuperar: boolean,
): Promise<SolicitudCuenta> {
  const usuario = await asegurarSesion();
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("EMAIL_INVALIDO");
  if (!recuperar && !usuario.is_anonymous && !cuentaConClave(usuario))
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

export async function crearClaveRecuperacion() {
  const original = await asegurarSesion();
  const { data, error } = await supabase.functions.invoke(
    "crear-recuperacion",
    {
      method: "POST",
    },
  );
  if (error) throw new Error(await codigoFuncion(error, "CLAVE_NO_CREADA"));
  if (typeof data?.clave !== "string") throw new Error("CLAVE_NO_CREADA");
  const actualizada = await supabase.auth.refreshSession();
  if (actualizada.error || !actualizada.data.user)
    throw actualizada.error ?? new Error("SESION_REQUERIDA");
  if (
    actualizada.data.user.id !== original.id ||
    !data.clave.startsWith(`BLINDLY1:${original.id}:`)
  )
    throw new Error("SESION_CAMBIO");
  return { clave: data.clave as string, usuario: actualizada.data.user };
}

export async function recuperarConClave(clave: string) {
  const actual = await asegurarSesion();
  await validarCambioCuenta(actual);
  const partes = clave.trim().split(":");
  if (
    partes.length !== 3 ||
    partes[0].toUpperCase() !== "BLINDLY1" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      partes[1],
    ) ||
    !/^[A-Za-z0-9_-]{24,}$/.test(partes[2])
  )
    throw new Error("CLAVE_INVALIDA");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${partes[1]}${DOMINIO_RECUPERACION}`,
    password: partes[2],
  });
  if (error || !data.user || data.user.id !== partes[1])
    throw new Error("CLAVE_INVALIDA");
  return data.user;
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
    throw new Error(await codigoFuncion(error, "CUENTA_NO_ELIMINADA"));
  }
  const salida = await supabase.auth.signOut({ scope: "local" });
  if (salida.error) throw salida.error;
}
