import { supabase } from "./supabase";

let desfaseMs = 0;

// Le pregunta al servidor qué hora es y guarda la diferencia con el reloj del celular
export async function sincronizarReloj() {
  const antes = Date.now();
  const { data, error } = await supabase.rpc("hora_servidor");
  const despues = Date.now();
  if (error || !data) return;

  const horaServidor = new Date(data).getTime();
  const viaje = (despues - antes) / 2; // compensa lo que tarda la respuesta en volver
  desfaseMs = Math.round(horaServidor + viaje - despues);
}

// "Ahora", corregido con esa diferencia
export function ahoraServidor() {
  return Date.now() + desfaseMs;
}