import { inicioDeNivel, type Nivel } from "./niveles";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
import { ahoraServidor } from "./tiempoServidor";

export type Sala = {
  id: string;
  codigo: string;
  host_id: string;
  niveles: Nivel[];
  estado: string; // 'esperando' | 'jugando' | 'pausado'
  nivel_indice: number;
  acumulado_ms: number;
  inicio_en: string | null;
  creada_en: string;
};

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generarCodigo(largo = 5) {
  let codigo = "";
  for (let i = 0; i < largo; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

export async function crearSala(niveles: Nivel[]): Promise<Sala> {
  const usuario = await asegurarSesion();

  for (let intento = 0; intento < 5; intento++) {
    const { data, error } = await supabase
      .from("salas")
      .insert({ codigo: generarCodigo(), host_id: usuario.id, niveles })
      .select()
      .single();

    if (!error) return data as Sala;
    if (error.code !== "23505") throw error;
  }
  throw new Error("No se pudo generar un código libre. Probá de nuevo.");
}

export async function obtenerSalaPorCodigo(codigoTexto: string): Promise<Sala> {
  const { data, error } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigoTexto.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No existe una sala con ese código.");
  return data as Sala;
}

// Guarda los niveles elegidos antes de arrancar la partida
export async function actualizarNivelesSala(salaId: string, niveles: Nivel[]) {
  const { error } = await supabase.from("salas").update({ niveles }).eq("id", salaId);
  if (error) throw error;
}

export async function comenzarSala(sala: Sala) {
  const { error } = await supabase
    .from("salas")
    .update({ estado: "jugando", inicio_en: new Date(ahoraServidor()).toISOString() })
    .eq("id", sala.id);
  if (error) throw error;
}

export async function pausarSala(sala: Sala) {
  if (!sala.inicio_en) return;
  const transcurridoTramo = Math.max(0, Math.round(ahoraServidor() - new Date(sala.inicio_en).getTime()));
  const { error } = await supabase
    .from("salas")
    .update({
      estado: "pausado",
      acumulado_ms: sala.acumulado_ms + transcurridoTramo,
      inicio_en: null,
    })
    .eq("id", sala.id);
  if (error) throw error;
}

export async function saltarNivelSala(sala: Sala, indiceDestino: number) {
  const corriendo = sala.estado === "jugando";
  const { error } = await supabase
    .from("salas")
    .update({
      nivel_indice: indiceDestino,
      acumulado_ms: inicioDeNivel(sala.niveles, indiceDestino),
      inicio_en: corriendo ? new Date(ahoraServidor()).toISOString() : null,
    })
    .eq("id", sala.id);
  if (error) throw error;
}

export function suscribirseASala(salaId: string, alCambiar: (sala: Sala) => void) {
  return supabase
    .channel(`sala-${salaId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "salas", filter: `id=eq.${salaId}` },
      (payload) => alCambiar(payload.new as Sala)
    )
    .subscribe();
}