export const SONIDOS = [
 { id: "fichas", nombre: "Fichas", plus: false, icono: "fichas" },
 { id: "barajar", nombre: "Barajar", plus: false, icono: "barajar" },
 { id: "carta", nombre: "Carta al paño", plus: false, icono: "cartas" },
 { id: "aplausos", nombre: "Aplausos", plus: false, icono: "aplauso" },
 { id: "sorpresa", nombre: "Sorpresa", plus: false, icono: "sorpresa" },
 { id: "bocina", nombre: "Bocina", plus: false, icono: "bocina" },
 { id: "grillos", nombre: "Grillos", plus: false, icono: "grillo" },
 { id: "trombon", nombre: "Trombón", plus: false, icono: "trombon" },
 { id: "bateria", nombre: "Redoble", plus: false, icono: "bateria" },
 { id: "risa", nombre: "Risa", plus: false, icono: "risa" },
 { id: "buzzer", nombre: "Buzzer", plus: false, icono: "bocina" },
 { id: "pato", nombre: "Cuac", plus: false, icono: "pato" },
] as const;
export type SonidoId = (typeof SONIDOS)[number]["id"];
export type ConfigBotonera = {
  botoneraOrden: SonidoId[];
  botoneraFavoritos: SonidoId[];
  botoneraVisibles: SonidoId[];
  botoneraRecientes: SonidoId[];
};
const ids = SONIDOS.map((s) => s.id);
export const BOTONERA_INICIAL: ConfigBotonera = {
  botoneraOrden: ids,
  botoneraFavoritos: [],
  botoneraVisibles: ids,
  botoneraRecientes: [],
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
    botoneraRecientes: lista(datos.botoneraRecientes, []).slice(0, 4),
  };
}
export function registrarReciente(recientes: SonidoId[], id: SonidoId) {
  return [id, ...recientes.filter(anterior => anterior !== id)].slice(0, 4);
}
export function sonidosDisponibles(config: ConfigBotonera, plus: boolean) {
  // El catálogo oficial y favoritos son Free; Plus conserva orden y visibilidad.
  return (plus ? config.botoneraOrden.filter(id => config.botoneraVisibles.includes(id)) : ids)
    .map(id => SONIDOS.find(s => s.id === id)!);
}
export function buscarSonidos(busqueda: string, traducir: (nombre: string) => string) {
  const limpiar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
  const consulta = limpiar(busqueda);
  return SONIDOS.filter(s => limpiar(traducir(s.nombre)).includes(consulta)).map(s => s.id);
}
