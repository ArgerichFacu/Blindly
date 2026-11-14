import { COLORES_CLUB } from "./temas";
export const coloresClub = COLORES_CLUB;
export const emblemasClub = { picas: "♠", corazones: "♥", diamantes: "♦", treboles: "♣" } as const;
export type IdentidadClub = { version: 1; color: keyof typeof coloresClub; emblema: keyof typeof emblemasClub; banner: "liso" | "rayas" | "diamantes" };
export const identidadClubInicial: IdentidadClub = { version: 1, color: "oro", emblema: "picas", banner: "liso" };
export function identidadClubSegura(valor?: IdentidadClub | null): IdentidadClub {
  if (!valor || valor.version !== 1 || !Object.hasOwn(coloresClub, valor.color)
    || !Object.hasOwn(emblemasClub, valor.emblema) || !["liso", "rayas", "diamantes"].includes(valor.banner)) return identidadClubInicial;
  return valor;
}
