import type { Sala } from "./salas";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
export type Jugador = {
  id: string;
  sala_id: string;
  user_id: string | null;
  nombre: string;
  fichas: number;
  eliminado_en: string | null;
  unido_en: string;
  apuesta_mano: number;
  aporte_calle: number;
  retirado: boolean;
  apuesta_al_actuar: number | null;
};
export async function unirseASala(
  codigo: string,
  nombre: string,
): Promise<{ sala: Sala; jugadorId: string }> {
  await asegurarSesion();
  const { data, error } = await supabase.rpc("unirse_mesa", {
    p_codigo: codigo.trim().toUpperCase(),
    p_nombre: nombre.trim(),
  });
  if (error) throw error;
  return data;
}
export async function listarJugadores(salaId: string): Promise<Jugador[]> {
  const { data, error } = await supabase
    .from("jugadores")
    .select("*")
    .eq("sala_id", salaId)
    .order("unido_en");
  if (error) throw error;
  return data ?? [];
}
