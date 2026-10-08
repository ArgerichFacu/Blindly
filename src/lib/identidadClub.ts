export const coloresClub = { oro: "#D5B768", esmeralda: "#82CFAD", rubí: "#EB9CBA", zafiro: "#A9BDFC" } as const;
export const emblemasClub = { picas: "♠", corazones: "♥", diamantes: "♦", treboles: "♣" } as const;
export type IdentidadClub = { version: 1; color: keyof typeof coloresClub; emblema: keyof typeof emblemasClub; banner: "liso" | "rayas" | "diamantes" };
export const identidadClubInicial: IdentidadClub = { version: 1, color: "oro", emblema: "picas", banner: "liso" };
export function identidadClubSegura(valor?: IdentidadClub | null): IdentidadClub {
  if (!valor || valor.version !== 1 || !Object.hasOwn(coloresClub, valor.color)
    || !Object.hasOwn(emblemasClub, valor.emblema) || !["liso", "rayas", "diamantes"].includes(valor.banner)) return identidadClubInicial;
  return valor;
}
