export const SONIDOS = [
 { id: "aplausos", nombre: "Aplausos", simbolo: "", plus: false, pack: "Poker Room", icono: "aplauso" },
 { id: "fichas", nombre: "Fichas", simbolo: "", plus: false, pack: "Poker Room", icono: "fichas" },
 { id: "grillos", nombre: "Grillos", simbolo: "", plus: false, pack: "Party", icono: "grillo" },
 { id: "campana", nombre: "Campana", simbolo: "", plus: false, pack: "Poker Room", icono: "campana" },
 { id: "bocina", nombre: "Bocina", simbolo: "", plus: true, pack: "Party", icono: "bocina" },
 { id: "trombon", nombre: "Trombón", simbolo: "", plus: true, pack: "Party", icono: "trombon" },
 { id: "caja", nombre: "Caja registradora", simbolo: "", plus: true, pack: "Party", icono: "party" },
 { id: "respeto", nombre: "Respeto", simbolo: "", plus: true, pack: "Poker Room", icono: "mesa" },
 { id: "carta", nombre: "Carta al paño", simbolo: "", plus: true, pack: "Poker Room", icono: "cartas" },
 { id: "barajar", nombre: "Barajar", simbolo: "", plus: false, pack: "Poker Room", icono: "barajar" },
 { id: "allin", nombre: "All-in", simbolo: "", plus: true, pack: "Poker Room", icono: "impacto" },
 { id: "bust", nombre: "Última ficha", simbolo: "", plus: true, pack: "Poker Room", icono: "fichas" },
 { id: "pato", nombre: "Cuac", simbolo: "", plus: true, pack: "Party", icono: "pato" },
 { id: "bateria", nombre: "Ba dum tss", simbolo: "", plus: true, pack: "Party", icono: "bateria" },
 { id: "dealer", nombre: "Toque del dealer", simbolo: "", plus: true, pack: "Poker Room", icono: "mesa" },
 { id: "sorpresa", nombre: "Sorpresa", simbolo: "", plus: true, pack: "Poker Room", icono: "sorpresa" },
 { id: "risa", nombre: "Risa", simbolo: "", plus: true, pack: "Party", icono: "risa" },
 { id: "buzzer", nombre: "Buzzer", simbolo: "", plus: true, pack: "Party", icono: "bocina" },
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
  // Al vencer Plus se conservan los ajustes, pero sólo se muestran los sonidos Free.
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
