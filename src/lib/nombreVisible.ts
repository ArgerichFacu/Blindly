import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { asegurarSesion } from "./sesion";

export function validarNombreVisible(valor: string): string {
  if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]|\p{Cs}/u.test(valor)) throw new Error("NOMBRE_VISIBLE_INVALIDO");
  const nombre = valor.trim();
  if (!nombre || Array.from(nombre).length > 30) throw new Error("NOMBRE_VISIBLE_INVALIDO");
  return nombre;
}
export function nombreVisible(usuario: Pick<User, "user_metadata"> | null | undefined): string {
  for (const campo of ["display_name", "full_name", "name", "nombre"]) {
    const valor = usuario?.user_metadata?.[campo];
    if (typeof valor === "string") {
      try { return validarNombreVisible(valor); } catch { /* Un campo legacy inválido no impide usar los demás. */ }
    }
  }
  return "";
}
export const inicialNombre = (nombre: string) => Array.from(nombre)[0]?.toLocaleUpperCase() ?? "";
let guardando = false;
export async function guardarNombreVisible(valor: string, identidadEsperada?: string): Promise<User> {
  const nombre = validarNombreVisible(valor);
  if (guardando) throw new Error("AUTH_OCUPADO");
  guardando = true;
  try {
    const usuario = await asegurarSesion();
    if (identidadEsperada && usuario.id !== identidadEsperada) throw new Error("SESION_CAMBIO");
    const { data: sesion, error: errorSesion } = await supabase.auth.getSession();
    if (errorSesion || sesion.session?.user.id !== usuario.id) throw new Error("SESION_CAMBIO");
    // updateUser mezcla metadata; el trigger sincroniza las ligas en esa misma transacción.
    const { data, error } = await supabase.auth.updateUser({ data: { display_name: nombre } });
    if (error) throw error;
    if (data.user?.id !== usuario.id) throw new Error("SESION_CAMBIO");
    return data.user;
  } finally { guardando = false; }
}
