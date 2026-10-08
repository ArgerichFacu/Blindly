export const SONIDOS = [
  { id: "aplausos", nombre: "Aplausos", simbolo: "👏", plus: false },
  { id: "fichas", nombre: "Fichas", simbolo: "🪙", plus: false },
  { id: "grillos", nombre: "Grillos", simbolo: "🦗", plus: false },
  { id: "campana", nombre: "Campana", simbolo: "🔔", plus: false },
  { id: "bocina", nombre: "Bocina", simbolo: "📣", plus: true },
  { id: "trombon", nombre: "Trombón", simbolo: "🎺", plus: true },
  { id: "caja", nombre: "Caja registradora", simbolo: "💰", plus: true },
  { id: "respeto", nombre: "Respeto", simbolo: "✨", plus: true },
] as const;
export type SonidoId = (typeof SONIDOS)[number]["id"];
export type ConfigBotonera = {
  botoneraOrden: SonidoId[];
  botoneraFavoritos: SonidoId[];
  botoneraVisibles: SonidoId[];
};
const ids = SONIDOS.map((s) => s.id);
export const BOTONERA_INICIAL: ConfigBotonera = {
  botoneraOrden: ids,
  botoneraFavoritos: [],
  botoneraVisibles: ids,
};
function lista(valor: unknown, fallback: SonidoId[]) {
  return Array.isArray(valor)
    ? [...new Set(valor.filter((id): id is SonidoId => ids.includes(id)))]
    : [...fallback];
}
export function normalizarBotonera(
  datos: Partial<ConfigBotonera>,
): ConfigBotonera {
  const orden = lista(datos.botoneraOrden, ids);
  return {
    botoneraOrden: [...orden, ...ids.filter((id) => !orden.includes(id))],
    botoneraFavoritos: lista(datos.botoneraFavoritos, []),
    botoneraVisibles: lista(datos.botoneraVisibles, ids),
  };
}
export function sonidosDisponibles(config: ConfigBotonera, plus: boolean) {
  // Al vencer Plus se conservan los ajustes, pero Free vuelve a sus cuatro sonidos.
  if (!plus) return SONIDOS.filter((s) => !s.plus);
  return config.botoneraOrden
    .filter((id) => config.botoneraVisibles.includes(id))
    .sort(
      (a, b) =>
        Number(config.botoneraFavoritos.includes(b)) -
        Number(config.botoneraFavoritos.includes(a)),
    )
    .map((id) => SONIDOS.find((s) => s.id === id)!);
}
