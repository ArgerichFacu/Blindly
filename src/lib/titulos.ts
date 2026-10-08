import type { FilaRanking } from "./ligas";
export type TituloAutomatico = "mvp" | "tiburon" | "podio";

// Sólo métricas de torneos finalizados de ESTA temporada, recibidas de la RPC.
// No se infiere dinero, cartas, apuestas o asistencia que no se registraron.
export function titulosAutomaticos(fila: FilaRanking, esMvp: boolean): TituloAutomatico[] {
  const titulos: TituloAutomatico[] = esMvp ? ["mvp"] : [];
  const { partidas, victorias, podios } = fila;
  if (![partidas, victorias, podios].every(n => Number.isInteger(n) && n >= 0)
    || victorias > podios || podios > partidas || partidas < 5) return titulos;
  if (victorias * 2 >= partidas) titulos.push("tiburon");
  if (podios * 5 >= partidas * 4) titulos.push("podio");
  return titulos;
}
