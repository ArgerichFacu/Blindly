import type { Sala } from "./salas";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";

export type Jugador = {
  id: string;
  sala_id: string;
  user_id: string;
  nombre: string;
  unido_en: string;
};

// Une a este celular a la sala con ese código; si ya estaba, actualiza su nombre
export async function unirseASala(codigoTexto: string, nombre: string): Promise<Sala> {
  const usuario = await asegurarSesion();
  const codigo = codigoTexto.trim().toUpperCase();

  const { data: sala, error: errorSala } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (errorSala) throw errorSala;
  if (!sala) throw new Error("No existe una sala con ese código.");

  const { error } = await supabase
    .from("jugadores")
    .upsert(
      { sala_id: sala.id, user_id: usuario.id, nombre: nombre.trim() },
      { onConflict: "sala_id,user_id" }
    );

  if (error) throw error;
  return sala as Sala;
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