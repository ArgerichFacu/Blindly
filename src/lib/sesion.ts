import { supabase } from "./supabase";

// Devuelve el usuario de este celular; si no tiene uno, crea un usuario anónimo
export async function asegurarSesion() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;

  const { data: nueva, error } = await supabase.auth.signInAnonymously();
  if (error || !nueva.user) throw error ?? new Error("No se pudo iniciar sesión.");
  return nueva.user;
}