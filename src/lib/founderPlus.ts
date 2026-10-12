import { supabase } from "./supabase";

export type FuentePlus = "FREE" | "FOUNDER_TRIAL" | "PLAY_REVIEW" | "REVENUECAT_PAID" | "PLUS_DEMO";
export type PlanPlus = "monthly" | "annual" | "lifetime";
export type EstadoFounder = {
  server_now: string;
  eligible: boolean;
  started_at: string | null;
  expires_at: string | null;
  used: boolean;
  active: boolean;
  expired: boolean;
  founder_trial_enabled: boolean;
  real_payments_enabled: boolean;
  access_source: Exclude<FuentePlus, "PLUS_DEMO">;
  paid_expires_at: string | null;
  contactable: boolean;
  interest_plan: PlanPlus | null;
  waitlist: boolean;
  solicitudDesde?: number;
};
export const CACHE_FOUNDER_MS = 120_000;
export const ahoraMonotono = () => performance.now();
export type CacheFounder = { estado: EstadoFounder; usuario: string; recibido: number; limiteTrial: number; limitePago: number | null };
const fechas = (v: unknown) => v === null || (typeof v === "string" && Number.isFinite(Date.parse(v)));
export function validarEstadoFounder(v: unknown): EstadoFounder {
  if (!v || typeof v !== "object") throw new Error("PLUS_LANZAMIENTO_NO_DISPONIBLE");
  const d = v as Record<string, unknown>;
  for (const k of ["eligible", "used", "active", "expired", "founder_trial_enabled", "real_payments_enabled", "contactable", "waitlist"]) {
    if (typeof d[k] !== "boolean") throw new Error("PLUS_LANZAMIENTO_NO_DISPONIBLE");
  }
  if (typeof d.server_now !== "string" || !Number.isFinite(Date.parse(d.server_now))
    || !fechas(d.started_at) || !fechas(d.expires_at) || !fechas(d.paid_expires_at)
    || !["FREE", "FOUNDER_TRIAL", "PLAY_REVIEW", "REVENUECAT_PAID"].includes(String(d.access_source))
    || (d.interest_plan !== null && !["monthly", "annual", "lifetime"].includes(String(d.interest_plan)))
    || (d.used && (d.started_at === null || d.expires_at === null || Date.parse(String(d.expires_at)) - Date.parse(String(d.started_at)) !== 72 * 3_600_000))) {
    throw new Error("PLUS_LANZAMIENTO_NO_DISPONIBLE");
  }
  return d as EstadoFounder;
}
export function cacheFounder(estado: EstadoFounder, usuario: string, recibido = ahoraMonotono()): CacheFounder {
  // Diferencia entre DOS fechas del servidor; nunca entre expires_at y Date.now del teléfono.
  const restante = estado.expires_at ? Math.max(0, Date.parse(estado.expires_at) - Date.parse(estado.server_now)) : 0;
  const inicio = Math.min(recibido, estado.solicitudDesde ?? recibido);
  return { estado, usuario, recibido, limiteTrial: inicio + restante,
    limitePago: estado.paid_expires_at ? inicio + Math.max(0, Date.parse(estado.paid_expires_at) - Date.parse(estado.server_now)) : null };
}
export function estadoFounderVigente(cache: CacheFounder | null, usuario: string | null, ahora = ahoraMonotono()) {
  if (!cache || cache.usuario !== usuario || ahora < cache.recibido || ahora - cache.recibido >= CACHE_FOUNDER_MS) return null;
  const restante = Math.max(0, cache.limiteTrial - ahora);
  const activo = cache.estado.active && restante > 0;
  const pagoVencido = cache.estado.access_source === "REVENUECAT_PAID" && cache.limitePago !== null && ahora >= cache.limitePago;
  return { ...cache.estado, access_source: pagoVencido ? (activo ? "FOUNDER_TRIAL" as const : "FREE" as const) : cache.estado.access_source, active: activo,
    expired: cache.estado.expired || (cache.estado.used && restante === 0), restante };
}
async function rpcEstado(nombre: string, parametros?: { p_plan: PlanPlus }) {
  const inicio = ahoraMonotono();
  const r = await supabase.rpc(nombre, parametros);
  if (r.error) throw new Error(nombre === "iniciar_prueba_founder" ? "PLUS_PRUEBA_CONEXION" : "PLUS_LANZAMIENTO_NO_DISPONIBLE");
  return { ...validarEstadoFounder(r.data), solicitudDesde: inicio };
}
export const consultarFounder = () => rpcEstado("estado_founder_trial");
export const activarFounder = () => rpcEstado("iniciar_prueba_founder");
export const guardarInteresFounder = (plan: PlanPlus) => rpcEstado("registrar_interes_plus", { p_plan: plan });
export const guardarWaitlistFounder = () => rpcEstado("registrar_waitlist_plus");
export async function registrarVistaFounder() {
  const r = await supabase.rpc("registrar_vista_plus");
  if (r.error) throw new Error("PLUS_LANZAMIENTO_NO_DISPONIBLE");
}
export async function exigirPagosReales() {
  const r = await supabase.rpc("estado_lanzamiento_plus");
  if (r.error || r.data?.real_payments_enabled !== true) throw new Error("PLUS_PAGOS_NO_DISPONIBLES");
}
