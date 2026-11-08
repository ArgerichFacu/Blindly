import { useSyncExternalStore } from "react";
// Si Google UMP exige ofrecer "opciones de privacidad" (UE, Reino Unido, etc.),
// Opciones muestra una fila para revisarlas. Sólo en memoria, por runtime.
let requerida = false;
const oyentes = new Set<() => void>();
export function setPrivacidadAnunciosRequerida(valor: boolean) {
  if (requerida === valor) return;
  requerida = valor;
  for (const oyente of oyentes) oyente();
}
export function usePrivacidadAnunciosRequerida() {
  return useSyncExternalStore(
    oyente => { oyentes.add(oyente); return () => { oyentes.delete(oyente); }; },
    () => requerida,
    () => false,
  );
}
