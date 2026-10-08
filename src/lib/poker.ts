export const PALOS = ["♠", "♥", "♦", "♣"] as const;
export type Carta = { valor: number; palo: (typeof PALOS)[number] };
export const NOMBRES_MANO = [
  "Carta alta",
  "Pareja",
  "Doble pareja",
  "Trío",
  "Escalera",
  "Color",
  "Full house",
  "Poker",
  "Escalera de color",
  "Escalera real",
] as const;
export type ResultadoMano = {
  nombre: (typeof NOMBRES_MANO)[number];
  fuerza: number;
  desempate: number[];
  cartas: Carta[];
  completa: boolean;
};
export function idCarta(carta: Carta) {
  return `${carta.valor}${carta.palo}`;
}
export function valorCarta(valor: number): string {
  return (
    ({ 11: "J", 12: "Q", 13: "K", 14: "A" } as Record<number, string>)[valor] ??
    String(valor)
  );
}
function validar(cartas: readonly Carta[]) {
  if (
    cartas.some(
      (c) =>
        !c ||
        !Number.isInteger(c.valor) ||
        c.valor < 2 ||
        c.valor > 14 ||
        !PALOS.includes(c.palo),
    ) ||
    new Set(cartas.map(idCarta)).size !== cartas.length
  )
    throw new Error("CARTAS_INVALIDAS");
}
// El palo no decide un desempate. Solo fija cuál de dos selecciones equivalentes se muestra.
function ordenar(a: Carta, b: Carta) {
  return b.valor - a.valor || PALOS.indexOf(a.palo) - PALOS.indexOf(b.palo);
}
function puntuar(cartas: Carta[]): ResultadoMano {
  const valores = cartas.map((c) => c.valor);
  const grupos = [...new Set(valores)]
    .map((valor) => ({
      valor,
      cantidad: valores.filter((v) => v === valor).length,
    }))
    .sort((a, b) => b.cantidad - a.cantidad || b.valor - a.valor);
  const color =
    cartas.length === 5 && cartas.every((c) => c.palo === cartas[0].palo);
  const unicos = [...new Set(valores)].sort((a, b) => b - a);
  const escalera =
    unicos.length === 5 && unicos[0] - unicos[4] === 4
      ? unicos[0]
      : unicos.join(",") === "14,5,4,3,2"
        ? 5
        : 0;
  let fuerza = 0,
    desempate = valores;
  if (color && escalera) {
    fuerza = escalera === 14 ? 9 : 8;
    desempate = [escalera];
  } else if (grupos[0].cantidad === 4) {
    fuerza = 7;
    desempate = grupos.map((g) => g.valor);
  } else if (grupos[0].cantidad === 3 && grupos[1]?.cantidad === 2) {
    fuerza = 6;
    desempate = grupos.map((g) => g.valor);
  } else if (color) fuerza = 5;
  else if (escalera) {
    fuerza = 4;
    desempate = [escalera];
  } else if (grupos[0].cantidad === 3) {
    fuerza = 3;
    desempate = grupos.map((g) => g.valor);
  } else if (grupos[0].cantidad === 2 && grupos[1]?.cantidad === 2) {
    fuerza = 2;
    desempate = grupos.map((g) => g.valor);
  } else if (grupos[0].cantidad === 2) {
    fuerza = 1;
    desempate = grupos.map((g) => g.valor);
  }
  return {
    nombre: NOMBRES_MANO[fuerza],
    fuerza,
    desempate,
    cartas,
    completa: cartas.length === 5,
  };
}
export function compararManos(a: ResultadoMano, b: ResultadoMano): number {
  if (!a.completa || !b.completa) throw new Error("MANO_INCOMPLETA");
  return compararPuntajes(a, b);
}
function compararPuntajes(a: ResultadoMano, b: ResultadoMano): number {
  if (a.fuerza !== b.fuerza) return Math.sign(a.fuerza - b.fuerza);
  for (let i = 0; i < Math.max(a.desempate.length, b.desempate.length); i++) {
    const diferencia = (a.desempate[i] ?? 0) - (b.desempate[i] ?? 0);
    if (diferencia) return Math.sign(diferencia);
  }
  return 0;
}
export function evaluarCartas(entrada: readonly Carta[]): ResultadoMano {
  if (entrada.length < 2 || entrada.length > 7)
    throw new Error("CANTIDAD_CARTAS_INVALIDA");
  validar(entrada);
  const cartas = entrada.map((c) => ({ ...c })).sort(ordenar);
  if (cartas.length < 5) return puntuar(cartas);
  let mejor: ResultadoMano | null = null;
  // Hasta 21 grupos: permite usar cero, una o dos cartas propias, como Hold'em.
  for (let a = 0; a < cartas.length - 4; a++)
    for (let b = a + 1; b < cartas.length - 3; b++)
      for (let c = b + 1; c < cartas.length - 2; c++)
        for (let d = c + 1; d < cartas.length - 1; d++)
          for (let e = d + 1; e < cartas.length; e++) {
            const mano = puntuar([
              cartas[a],
              cartas[b],
              cartas[c],
              cartas[d],
              cartas[e],
            ]);
            if (!mejor || compararPuntajes(mano, mejor) > 0) mejor = mano;
          }
  return mejor!;
}
export function evaluarHoldem(
  propias: readonly Carta[],
  mesa: readonly Carta[],
): ResultadoMano {
  if (propias.length !== 2 || mesa.length > 5)
    throw new Error("CANTIDAD_CARTAS_INVALIDA");
  return evaluarCartas([...propias, ...mesa]);
}
