import type { Nivel } from "./niveles";
import type { Configuracion } from "./mesa";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
import { identidadUsuario } from "./identidad";
export type Sala = {
  id: string;
  codigo: string;
  host_id: string;
  niveles: Nivel[];
  estado: string;
  nivel_indice: number;
  acumulado_ms: number;
  inicio_en: string | null;
  creada_en: string;
  configuracion: Configuracion;
  orden: string[];
  dealer_id: string | null;
  sb_id: string | null;
  bb_id: string | null;
  boton_id: string | null;
  turno_id: string | null;
  calle: "preflop" | "flop" | "turn" | "river" | "reparto";
  apuesta_actual: number;
  subida_minima: number;
  ciega_mano: number;
  pendientes: string[];
  mano: number;
  pozo: number;
  revision: number;
  temporada_id: string | null;
};
export async function crearSala(
  niveles: Nivel[],
  temporadaId: string | null = null,
): Promise<Sala> {
  const usuario = await asegurarSesion();
  if (temporadaId) {
    if (!identidadUsuario(usuario).recuperable)
      throw new Error("CUENTA_REQUERIDA");
  }
  const { data, error } = await supabase.rpc("crear_sala", {
    p_niveles: niveles,
    p_temporada: temporadaId,
  });
  if (error) throw error;
  return data as Sala;
}
export async function obtenerSalaPorCodigo(codigo: string): Promise<Sala> {
  const { data, error } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigo.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("SALA_NO_EXISTE");
  if (data.configuracion === undefined)
    throw new Error("accion_mesa: migración pendiente");
  return data as Sala;
}
export type AccionMesa =
  | "ordenar"
  | "configurar"
  | "iniciar"
  | "comenzar"
  | "pausar"
  | "saltar"
  | "turno_fisico"
  | "apostar"
  | "cerrar_mano"
  | "fichas";
let consecutivo = 0;
export function nuevaSolicitud() {
  return (
    Date.now() +
    "-" +
    ++consecutivo +
    "-" +
    Math.random().toString(36).slice(2) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}
export async function ejecutarAccion(
  salaId: string,
  accion: AccionMesa,
  datos: Record<string, unknown>,
  solicitud: string,
): Promise<Sala> {
  const { data, error } = await supabase.rpc("accion_mesa", {
    p_sala: salaId,
    p_accion: accion,
    p_datos: datos,
    p_solicitud: solicitud,
  });
  if (error) throw error;
  return data as Sala;
}
export function nombreCanalUnico(prefijo: string) {
  return prefijo + "-" + nuevaSolicitud();
}
