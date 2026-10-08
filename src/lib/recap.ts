import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";

export type Recap = {
  sala_id: string;
  finalizada_en: string;
  duracion_ms: number | null;
  jugadores: number;
  resultados: {
    user_id?: string;
    puesto: number;
    nombre: string;
    puntos: number;
    soy_yo: boolean;
  }[];
  liga: { nombre: string; temporada: string } | null;
  nuevo_mvp?: { nombre: string; user_id: string } | null;
};

export function ganadoresRecap(recap: Recap) {
  return recap.resultados.filter(r => r.puesto === 1);
}

export async function obtenerRecap(salaId: string) {
  await asegurarSesion();
  const { data, error } = await supabase.rpc("recap_partida", { p_sala: salaId });
  if (error) throw error;
  return data as Recap;
}

export function duracionLegible(ms: number | null) {
  if (!ms || ms < 0) return null;
  const minutos = Math.floor(ms / 60_000);
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas > 0 ? `${horas}h ${resto}m` : `${resto} min`;
}
