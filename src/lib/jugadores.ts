import type { Sala } from "./salas";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";

export type Jugador = {
  id: string;
  sala_id: string;
  user_id: string;
  nombre: string;
  fichas: number;
  eliminado_en: string | null;
  unido_en: string;
};

// Une a este celular a la sala con ese código; si ya estaba, actualiza su nombre
export async function unirseASala(
  codigoTexto: string,
  nombre: string
): Promise<{ sala: Sala; jugadorId: string }> {
  const usuario = await asegurarSesion();
  const codigo = codigoTexto.trim().toUpperCase();

  const { data: sala, error: errorSala } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (errorSala) throw errorSala;
  if (!sala) throw new Error("No existe una sala con ese código.");

  const { data: jugador, error } = await supabase
    .from("jugadores")
    .upsert(
      { sala_id: sala.id, user_id: usuario.id, nombre: nombre.trim() },
      { onConflict: "sala_id,user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return { sala: sala as Sala, jugadorId: jugador.id as string };
}

export async function listarJugadores(salaId: string): Promise<Jugador[]> {
  const { data, error } = await supabase
    .from("jugadores")
    .select("*")
    .eq("sala_id", salaId)
    .order("unido_en", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Jugador[];
}

export async function darFichas(jugadorId: string, fichas: number) {
  const { error } = await supabase
    .from("jugadores")
    .update({ fichas, eliminado_en: fichas > 0 ? null : new Date().toISOString() })
    .eq("id", jugadorId);
  if (error) throw error;
}

// El propio jugador ajusta su stack; si llega a 0 queda eliminado, y si sube de 0 se destraba solo
export async function ajustarMisFichas(jugadorId: string, nuevoMonto: number) {
  const monto = Math.max(0, Math.round(nuevoMonto));
  const { error } = await supabase
    .from("jugadores")
    .update({ fichas: monto, eliminado_en: monto > 0 ? null : new Date().toISOString() })
    .eq("id", jugadorId);
  if (error) throw error;
}