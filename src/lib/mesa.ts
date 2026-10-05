import type { Nivel } from "./niveles";
import type { Jugador } from "./jugadores";

export type Denominacion = { valor: number; cantidad: number };
export type Fichas =
  | { tipo: "fisicas"; denominaciones: Denominacion[] }
  | { tipo: "virtuales"; stack: number };
export type Modo = {
  id: "turbo" | "regular" | "deep" | "personalizado";
  niveles: Nivel[];
};
export type Configuracion = {
  fichas?: Fichas;
  modo?: Modo;
  musica?: boolean;
  mesa_habitual_id?: string;
  mesa_habitual_nombre?: string;
  jugadores_habituales?: string[];
  tema_id?: string;
};

export function entero(
  texto: string,
  minimo = 0,
  maximo = 1_000_000_000,
): number {
  if (!/^\d+$/.test(texto.trim())) throw new Error("MONTO_INVALIDO");
  const numero = Number(texto);
  if (!Number.isSafeInteger(numero) || numero < minimo || numero > maximo)
    throw new Error("MONTO_INVALIDO");
  return numero;
}

// Reparte igual cantidad de cada denominación; el sobrante queda en reserva.
export function repartirFisicas(
  denominaciones: Denominacion[],
  jugadores: number,
) {
  if (!Number.isInteger(jugadores) || jugadores < 2 || jugadores > 10)
    throw new Error("JUGADORES_INVALIDOS");
  if (
    denominaciones.length < 1 ||
    denominaciones.length > 5 ||
    new Set(denominaciones.map((d) => d.valor)).size !== denominaciones.length
  )
    throw new Error("FICHAS_INVALIDAS");
  const reparto = denominaciones.map((d) => {
    if (
      !Number.isInteger(d.valor) ||
      d.valor < 1 ||
      d.valor > 1_000_000 ||
      !Number.isInteger(d.cantidad) ||
      d.cantidad < 0 ||
      d.cantidad > 1_000_000
    )
      throw new Error("FICHAS_INVALIDAS");
    return {
      ...d,
      porJugador: Math.floor(d.cantidad / jugadores),
      reserva: d.cantidad % jugadores,
    };
  });
  const stack = reparto.reduce((total, d) => total + d.valor * d.porJugador, 0);
  const unidades = reparto.reduce((total, d) => total + d.porJugador, 0);
  if (stack < 1 || stack > 1_000_000_000) throw new Error("FICHAS_INVALIDAS");
  return { reparto, stack, unidades };
}

// Es una recomendación editable basada en piezas disponibles, no una regla de poker.
export function recomendarModo(unidades: number): Modo["id"] {
  return unidades < 30 ? "turbo" : unidades < 60 ? "regular" : "deep";
}

export function adaptarNiveles(
  niveles: Nivel[],
  modo: string,
  fichas: Fichas | undefined,
  jugadores: number,
): Nivel[] {
  if (!fichas || modo === "personalizado") return niveles;
  let unidad: number;
  if (fichas.tipo === "virtuales") {
    const ciegasIniciales = modo === "turbo" ? 40 : modo === "deep" ? 200 : 100;
    unidad = Math.max(1, Math.round(fichas.stack / (2 * ciegasIniciales)));
  } else {
    const { reparto } = repartirFisicas(fichas.denominaciones, jugadores);
    unidad = Math.min(
      ...reparto.filter((d) => d.porJugador > 0).map((d) => d.valor),
    );
  }
  return niveles.map((n) =>
    n.esBreak
      ? { ...n }
      : {
          ...n,
          smallBlind: Math.max(1, Math.round(n.smallBlind / 25)) * unidad,
          bigBlind: Math.max(2, Math.round(n.bigBlind / 25)) * unidad,
        },
  );
}

export function ordenarJugadores(jugadores: Jugador[], orden: string[]) {
  return [...jugadores].sort((a, b) => {
    const i = orden.indexOf(a.id),
      j = orden.indexOf(b.id);
    return (i < 0 ? 100 : i) - (j < 0 ? 100 : j);
  });
}

export function rolesMesa(
  jugadores: Jugador[],
  orden: string[],
  dealer: string | null,
  boton: string | null = dealer,
  posiciones?: { sb_id: string | null; bb_id: string | null },
) {
  const activos = ordenarJugadores(
    jugadores.filter((j) => !j.eliminado_en),
    orden,
  );
  const roles: Record<string, string> = {};
  const indice = activos.findIndex((j) => j.id === boton);
  if (dealer) roles[dealer] = "DR";
  if (posiciones?.sb_id && posiciones?.bb_id) {
    for (const [id, etiqueta] of [
      [boton, "BTN"],
      [posiciones.sb_id, "SB"],
      [posiciones.bb_id, "BB"],
    ]) {
      if (id) roles[id] = [roles[id], etiqueta].filter(Boolean).join(" / ");
    }
    return roles;
  }
  if (indice < 0 || activos.length < 2) return roles;
  roles[activos[indice].id] = [
    roles[activos[indice].id],
    activos.length === 2 ? "BTN / SB" : "BTN",
  ]
    .filter(Boolean)
    .join(" / ");
  const siguiente = activos[(indice + 1) % activos.length].id;
  roles[siguiente] = [roles[siguiente], activos.length === 2 ? "BB" : "SB"]
    .filter(Boolean)
    .join(" / ");
  if (activos.length > 2)
    roles[activos[(indice + 2) % activos.length].id] = [
      roles[activos[(indice + 2) % activos.length].id],
      "BB",
    ]
      .filter(Boolean)
      .join(" / ");
  return roles;
}

export function validarNiveles(niveles: Nivel[]) {
  return (
    niveles.length > 0 &&
    niveles.length <= 100 &&
    niveles.some((n) => !n.esBreak) &&
    niveles.every(
      (n) =>
        Number.isFinite(n.minutos) &&
        n.minutos >= 0.25 &&
        n.minutos <= 180 &&
        (n.esBreak ||
          (Number.isSafeInteger(n.smallBlind) &&
            n.smallBlind > 0 &&
            Number.isSafeInteger(n.bigBlind) &&
            n.bigBlind >= n.smallBlind &&
            n.bigBlind <= 1_000_000_000)),
    )
  );
}

export function calcularPozos(jugadores: Jugador[]) {
  const topes = [
    ...new Set(jugadores.map((j) => j.apuesta_mano).filter((n) => n > 0)),
  ].sort((a, b) => a - b);
  return topes.map((tope, i) => ({
    tope,
    monto:
      (tope - (topes[i - 1] ?? 0)) *
      jugadores.filter((j) => j.apuesta_mano >= tope).length,
    elegibles: jugadores
      .filter((j) => j.apuesta_mano >= tope && !j.retirado && !j.eliminado_en)
      .map((j) => j.id),
  }));
}
