import type { ViewStyle } from "react-native";

// Identidad "Marcador": sin relieves ni sombras decorativas. Se conserva la forma de RELIEVE
// para el código existente; todos los niveles son planos.
export const RELIEVE = {
  bajo: {},
  panel: {},
  protagonista: {},
  modal: {},
} satisfies Record<string, ViewStyle>;

// Agrega transparencia a un color #RRGGBB (alpha en hex, p. ej. "33").
export function velo(color: string, alpha: string) {
  return /^#[\da-f]{6}$/i.test(color ?? "") ? `${color}${alpha}` : color;
}
