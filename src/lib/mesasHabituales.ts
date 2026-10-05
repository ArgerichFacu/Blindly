import type { Configuracion } from "./mesa";
import type { Sala } from "./salas";
import { asegurarSesion } from "./sesion";
import { sincronizarPlusServidor } from "./plusServidor";
import { supabase } from "./supabase";

export type MesaHabitual = {
  id: string;
  nombre: string;
  jugadores: string[];
  configuracion: Configuracion;
  tema_id: "verde" | "rojo" | "negro";
  temporada_id: string | null;
  liga: {
    id: string;
    nombre: string;
    temporada: string;
    temporada_estado: "activa" | "finalizada";
  } | null;
  plus_activo: boolean;
  creada_en: string;
  actualizada_en: string;
};

async function rpc<T>(nombre: string, parametros?: Record<string, unknown>) {
  await asegurarSesion();
  const { data, error } = await supabase.rpc(nombre, parametros);
  if (error) throw error;
  return data as T;
}

async function prepararAdministracion() {
  const estado = await sincronizarPlusServidor();
  if (!estado.activo) throw new Error("PLUS_REQUERIDO");
}

export function misMesasHabituales() {
  return rpc<MesaHabitual[]>("mis_mesas_habituales");
}

export async function guardarMesaHabitual(datos: {
  id?: string | null;
  nombre: string;
  jugadores: string[];
  configuracion: Configuracion;
  tema: MesaHabitual["tema_id"];
  temporadaId?: string | null;
}) {
  await prepararAdministracion();
  return rpc<string>("guardar_mesa_habitual", {
    p_id: datos.id ?? null,
    p_nombre: datos.nombre,
    p_jugadores: datos.jugadores,
    p_configuracion: datos.configuracion,
    p_tema: datos.tema,
    p_temporada: datos.temporadaId ?? null,
  });
}

export async function eliminarMesaHabitual(id: string) {
  await prepararAdministracion();
  await rpc<null>("eliminar_mesa_habitual", { p_id: id });
}

export async function crearSalaDesdeMesa(id: string) {
  await prepararAdministracion();
  return rpc<Sala>("crear_sala_desde_mesa", { p_mesa: id });
}
