export type PreferenciasAvisos = {
  activos: boolean; pique: boolean; mvp: boolean; rivalidades: boolean;
  fechas: boolean; temporadas: boolean; recordatorios: boolean;
  limite_social: 0 | 1 | 2; revision: number;
};
export const AVISOS_INICIALES: PreferenciasAvisos = {
  activos: false, pique: false, mvp: true, rivalidades: true,
  fechas: true, temporadas: true, recordatorios: true, limite_social: 2, revision: 0,
};
export type TipoAviso = "mvp" | "rivalidades" | "fechas" | "temporadas" | "recordatorios";
// Los eventos importantes no consumen el cupo social; también respetan su interruptor.
// Esta regla prepara el envío: por sí sola no registra ni entrega una notificación.
export function permiteAviso(p: PreferenciasAvisos, tipo: TipoAviso, socialesUltimosSieteDias: number) {
  if (!p.activos || !p[tipo]) return false;
  if (tipo !== "rivalidades" && tipo !== "recordatorios") return true;
  return Number.isInteger(socialesUltimosSieteDias) && socialesUltimosSieteDias >= 0
    && socialesUltimosSieteDias < p.limite_social;
}
