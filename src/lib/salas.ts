import type { Nivel } from "./niveles";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";

export type Sala = {
  id: string;
  codigo: string;
  host_id: string;
  niveles: Nivel[];
  estado: string;
  creada_en: string;
};

// Sin 0/O ni 1/I para que no se confundan al dictar el código
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
    if (error.code !== "23505") throw error; // 23505 = código repetido: se reintenta con otro
  }
  throw new Error("No se pudo generar un código libre. Probá de nuevo.");
}