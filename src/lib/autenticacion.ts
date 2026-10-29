import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { asegurarSesion, cuentaConClave, validarCambioCuenta } from "./sesion";

WebBrowser.maybeCompleteAuthSession();
const PENDIENTE = "blindly.auth.pendiente.v1";
export type ContextoAuth = { inicio?: string; volver?: string; liga?: string; codigo?: string; nombre?: string; seccion?: string; temporada?: string };
type Pendiente = { tipo: "google-link" | "google-login" | "email-link" | "reset"; usuario: string; email?: string; fecha: number; contexto?: ContextoAuth };
let ocupado = false;
const retornos = new Map<string, Promise<{ usuario: User; reset: boolean; contexto: ContextoAuth }>>();
export const retornoAuth = () => Platform.OS === "web"
  ? `${globalThis.location.origin}/auth-callback`
  : Linking.createURL("auth-callback", { scheme: "blindly" });
export function emailValido(valor: string) {
  const email = valor.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith("@recovery.blindly.invalid")) throw new Error("EMAIL_INVALIDO");
  return email;
}
export function validarPassword(password: string, confirmacion: string) {
  if (password.length < 8) throw new Error("AUTH_PASSWORD_CORTA");
  if (password !== confirmacion) throw new Error("AUTH_PASSWORD_DISTINTA");
}
export function errorAuth(error: unknown): Error {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const conocidos: Record<string, string> = {
    invalid_credentials: "AUTH_CREDENCIALES", email_not_confirmed: "AUTH_EMAIL_NO_CONFIRMADO",
    email_exists: "AUTH_EMAIL_OCUPADO", user_already_exists: "AUTH_EMAIL_OCUPADO",
    identity_already_exists: "AUTH_GOOGLE_OCUPADO", identity_already_linked: "AUTH_GOOGLE_OCUPADO",
    provider_disabled: "AUTH_GOOGLE_NO_CONFIGURADO", manual_linking_disabled: "AUTH_LINKING_NO_CONFIGURADO",
    over_request_rate_limit: "AUTH_RATE_LIMIT", over_email_send_rate_limit: "AUTH_RATE_LIMIT",
    email_address_not_authorized: "AUTH_CORREO_NO_CONFIGURADO", weak_password: "AUTH_PASSWORD_CORTA",
    otp_expired: "AUTH_LINK_VENCIDO", reauthentication_needed: "AUTH_REAUTENTICAR",
    flow_state_expired: "AUTH_LINK_VENCIDO", flow_state_not_found: "AUTH_LINK_VENCIDO",
  };
  if (conocidos[code]) return new Error(conocidos[code]);
  if (error instanceof Error && /^(AUTH_|SESION_|PROTEGER_|EMAIL_|CUENTA_|PARTIDA_)/.test(error.message)) return error;
  return new Error("AUTH_NO_COMPLETADO");
}
async function operacion<T>(fn: () => Promise<T>) {
  if (ocupado) throw new Error("AUTH_OCUPADO");
  ocupado = true;
  try { return await fn(); } catch (e) { throw errorAuth(e); } finally { ocupado = false; }
}
async function mismaSesion(id: string) {
  const { data, error } = await supabase.auth.getSession();
  if (error || data.session?.user.id !== id) throw new Error("SESION_CAMBIO");
  return data.session;
}
async function guardarPendiente(p: Pendiente) { await AsyncStorage.setItem(PENDIENTE, JSON.stringify(p)); }
// Sólo navegación conocida; nunca credenciales, contraseñas ni URLs arbitrarias.
function contextoSeguro(contexto: ContextoAuth = {}): ContextoAuth {
  const seguro: ContextoAuth = {};
  for (const campo of ["inicio", "volver", "liga", "codigo", "nombre", "seccion", "temporada"] as const) {
    if (typeof contexto[campo] === "string" && contexto[campo]!.length <= 100) seguro[campo] = contexto[campo];
  }
  return seguro;
}
async function solicitudPendiente<T>(p: Pendiente, fn: () => Promise<T>) {
  const anterior = await AsyncStorage.getItem(PENDIENTE);
  await guardarPendiente(p);
  try { return await fn(); }
  catch (e) {
    // Un envío fallido no deja una verificación ficticia al volver a la pantalla.
    if (anterior) await AsyncStorage.setItem(PENDIENTE, anterior);
    else await AsyncStorage.removeItem(PENDIENTE);
    throw e;
  }
}
export async function leerPendiente(): Promise<Pendiente | null> {
  try {
    const p = JSON.parse(await AsyncStorage.getItem(PENDIENTE) ?? "null");
    return p && ["google-link", "google-login", "email-link", "reset"].includes(p.tipo)
      && typeof p.usuario === "string" && Number.isFinite(p.fecha) && p.fecha <= Date.now() && Date.now() - p.fecha < 86400000
      && (!(p.tipo === "email-link" || p.tipo === "reset") || typeof p.email === "string") ? p : null;
  } catch { return null; }
}
export async function registrarEmail(email: string, nombre: string, contexto: ContextoAuth = {}) {
  return operacion(async () => {
    email = emailValido(email);
    nombre = nombre.trim();
    if (!nombre || nombre.length > 30) throw new Error("AUTH_NOMBRE_INVALIDO");
    const u = await asegurarSesion();
    if (!u.is_anonymous && !cuentaConClave(u)) throw new Error("CUENTA_YA_VINCULADA");
    await mismaSesion(u.id);
    // No password hasta verificar email; no signUp ni UUID nuevo.
    await solicitudPendiente({ tipo: "email-link", usuario: u.id, email, fecha: Date.now(), contexto: contextoSeguro(contexto) }, async () => {
      const { data, error } = await supabase.auth.updateUser({ email, data: { display_name: nombre } }, { emailRedirectTo: retornoAuth() });
      if (error) throw error;
      if (data.user?.id !== u.id) throw new Error("SESION_CAMBIO");
    });
    if (cuentaConClave(u)) {
      const factor = await supabase.functions.invoke("confirmar-correo-interno", { method: "POST", body: { email } });
      if (factor.error || factor.data?.code !== "OK") throw new Error("AUTH_NO_COMPLETADO");
      await mismaSesion(u.id);
    }
    return { usuario: u.id, email, legacy: cuentaConClave(u) };
  });
}
export async function confirmarEmailPassword(email: string, codigo: string, password: string, confirmacion: string) {
  return operacion(async () => {
    validarPassword(password, confirmacion);
    const p = await leerPendiente();
    if (!p || p.tipo !== "email-link" || p.email !== emailValido(email)) throw new Error("AUTH_LINK_VENCIDO");
    const actual = await mismaSesion(p.usuario);
    if (cuentaConClave(actual.user)) {
      const factor = await supabase.functions.invoke("confirmar-correo-interno", { method: "POST", body: { email: p.email } });
      if (factor.error || factor.data?.code !== "OK") throw new Error("AUTH_NO_COMPLETADO");
    }
    const verificada = await supabase.auth.verifyOtp({ email: p.email!, token: codigo.trim(), type: "email_change" });
    if (verificada.error) throw verificada.error;
    if (verificada.data.user?.id !== p.usuario) {
      await supabase.auth.setSession({ access_token: actual.access_token, refresh_token: actual.refresh_token });
      throw new Error("SESION_CAMBIO");
    }
    if (!verificada.data.user.email_confirmed_at || verificada.data.user.email?.toLowerCase() !== p.email) throw new Error("AUTH_EMAIL_NO_CONFIRMADO");
    await mismaSesion(p.usuario);
    const r = await supabase.auth.updateUser({ password });
    if (r.error) throw r.error;
    if (r.data.user?.id !== p.usuario) throw new Error("SESION_CAMBIO");
    await AsyncStorage.removeItem(PENDIENTE);
    return r.data.user;
  });
}
export async function entrarEmail(email: string, password: string) {
  return operacion(async () => {
    email = emailValido(email);
    if (!password) throw new Error("AUTH_CREDENCIALES");
    const u = await asegurarSesion();
    await validarCambioCuenta(u);
    await mismaSesion(u.id);
    const r = await supabase.auth.signInWithPassword({ email, password });
    if (r.error) throw r.error;
    if (!r.data.user || r.data.user.is_anonymous) throw new Error("AUTH_CREDENCIALES");
    await AsyncStorage.removeItem(PENDIENTE);
    return r.data.user;
  });
}
export async function cerrarSesion() {
  return operacion(async () => {
    const u = await asegurarSesion();
    const datos = await supabase.rpc("mi_identidad_tiene_datos");
    if (datos.error) throw datos.error;
    if (u.is_anonymous && datos.data !== false) throw new Error("PROTEGER_INVITADO");
    const [jugador, host] = await Promise.all([
      supabase.from("jugadores").select("sala:salas!inner(estado)").eq("user_id", u.id).in("sala.estado", ["jugando", "pausado"]).limit(1),
      supabase.from("salas").select("id").eq("host_id", u.id).in("estado", ["jugando", "pausado"]).limit(1),
    ]);
    if (jugador.error || host.error) throw jugador.error ?? host.error;
    if (jugador.data?.length || host.data?.length) throw new Error("PARTIDA_ACTIVA_CUENTA");
    await mismaSesion(u.id);
    const r = await supabase.auth.signOut({ scope: "local" });
    if (r.error) throw r.error;
    await AsyncStorage.removeItem(PENDIENTE);
    // Nuevo invitado; PlusProvider borra lo anterior y usa este UUID, no otro RC id.
    // El logout ya terminó. Si falla la red al crear el invitado, Acceso queda
    // válido sin sesión y permite reintentar; nunca restaura la cuenta anterior.
    return asegurarSesion().catch(() => null);
  });
}
export async function solicitarReset(email: string, contexto: ContextoAuth = {}) {
  return operacion(async () => {
    email = emailValido(email);
    const u = await asegurarSesion();
    if (u.is_anonymous || u.email?.toLowerCase() !== email) await validarCambioCuenta(u);
    await mismaSesion(u.id);
    await solicitudPendiente({ tipo: "reset", usuario: u.id, email, fecha: Date.now(), contexto: contextoSeguro(contexto) }, async () => {
      const r = await supabase.auth.resetPasswordForEmail(email, { redirectTo: retornoAuth() });
      if (r.error) throw r.error;
    });
  });
}
export async function guardarPassword(password: string, confirmacion: string) {
  return operacion(async () => {
    validarPassword(password, confirmacion);
    const u = await asegurarSesion();
    if (u.is_anonymous || cuentaConClave(u) || !u.email_confirmed_at) throw new Error("AUTH_EMAIL_NO_CONFIRMADO");
    const r = await supabase.auth.updateUser({ password });
    if (r.error) throw r.error;
    if (r.data.user?.id !== u.id) throw new Error("SESION_CAMBIO");
    await AsyncStorage.removeItem(PENDIENTE);
    return r.data.user;
  });
}
export async function continuarGoogle(vincular = true, contexto: ContextoAuth = {}) {
  return operacion(async () => {
    const u = await asegurarSesion();
    if (!vincular) await validarCambioCuenta(u);
    await mismaSesion(u.id);
    const opciones = { provider: "google" as const, options: { redirectTo: retornoAuth(), skipBrowserRedirect: true, queryParams: { prompt: "select_account" } } };
    return solicitudPendiente({ tipo: vincular ? "google-link" : "google-login", usuario: u.id, fecha: Date.now(), contexto: contextoSeguro(contexto) }, async () => {
      const r = vincular ? await supabase.auth.linkIdentity(opciones) : await supabase.auth.signInWithOAuth(opciones);
      // Auth devuelve validation_failed para Google deshabilitado. En este
      // handler provider/opciones son constantes: es un fallo de configuración.
      if (r.error?.code === "validation_failed") throw new Error("AUTH_GOOGLE_NO_CONFIGURADO");
      if (r.error) throw r.error;
      if (!r.data.url) throw new Error("AUTH_GOOGLE_NO_CONFIGURADO");
      if (Platform.OS === "web") { globalThis.location.assign(r.data.url); return null; }
      const resultado = await WebBrowser.openAuthSessionAsync(r.data.url, retornoAuth());
      if (resultado.type !== "success") { await AsyncStorage.removeItem(PENDIENTE); return null; }
      return (await procesarRetornoAuth(resultado.url)).usuario;
    });
  });
}
export function procesarRetornoAuth(url: string) {
  const retorno = new URL(url);
  const esperado = new URL(retornoAuth());
  if (retorno.protocol !== esperado.protocol || retorno.host !== esperado.host || retorno.pathname !== esperado.pathname) return Promise.reject(new Error("AUTH_LINK_VENCIDO"));
  const code = retorno.searchParams.get("code");
  if (!code) return Promise.reject(errorAuth({ code: retorno.searchParams.get("error_code") ?? "" }));
  const existente = retornos.get(code);
  if (existente) return existente;
  const tarea = (async () => {
    const p = await leerPendiente();
    if (!p) throw new Error("AUTH_LINK_VENCIDO");
    const actual = await mismaSesion(p.usuario);
    const flowId = retorno.searchParams.get("sb_flow_id");
    const r = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (r.error) throw errorAuth(r.error);
    if (!r.data.user) throw new Error("AUTH_NO_COMPLETADO");
    const uuidInvalido = (p.tipo === "google-link" || p.tipo === "email-link") && r.data.user.id !== p.usuario;
    const emailInvalido = (p.tipo === "email-link" || p.tipo === "reset") && (!r.data.user.email_confirmed_at || r.data.user.email?.toLowerCase() !== p.email);
    if (uuidInvalido || emailInvalido) {
      await supabase.auth.setSession({ access_token: actual.access_token, refresh_token: actual.refresh_token });
      throw new Error(uuidInvalido ? "SESION_CAMBIO" : "AUTH_EMAIL_NO_CONFIRMADO");
    }
    const reset = p.tipo === "reset";
    await AsyncStorage.removeItem(PENDIENTE);
    return { usuario: r.data.user, reset: reset || p.tipo === "email-link", contexto: contextoSeguro(p.contexto) };
  })();
  retornos.set(code, tarea);
  setTimeout(() => retornos.delete(code), 30000);
  return tarea;
}
