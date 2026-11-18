// Tipografía de Blindly: Barlow (texto) y Barlow Condensed (números y títulos), SIL OFL 1.1.
// Los archivos están en assets/fonts y se incrustan con el plugin expo-font (app.json).
// En Android cada peso es una familia distinta: se elige la familia y el peso queda "normal"
// para que el sistema no sintetice una negrita encima.
import type { TextStyle } from "react-native";

export const FUENTES = {
  regular: "Barlow-Regular",
  media: "Barlow-Medium",
  semi: "Barlow-SemiBold",
  condensadaSemi: "BarlowCondensed-SemiBold",
  condensada: "BarlowCondensed-Bold",
} as const;

export const ESCALA = { timer: 112, stack: 28, numero: 22, titulo: 24, subtitulo: 18, cuerpo: 16, secundario: 14, minimo: 12 } as const;

function peso(w: TextStyle["fontWeight"]): number {
  if (w === undefined || w === "normal") return 400;
  if (w === "bold") return 700;
  const n = Number(w);
  return Number.isFinite(n) ? n : 400;
}

// Títulos y números grandes (≥ 20 y peso ≥ 600) van en la condensada; el resto en Barlow.
export function familia(fontSize: number, fontWeight: TextStyle["fontWeight"], condensada?: boolean): string {
  const p = peso(fontWeight);
  if (condensada ?? (fontSize >= 20 && p >= 600)) return p >= 700 ? FUENTES.condensada : FUENTES.condensadaSemi;
  if (p >= 600) return FUENTES.semi;
  if (p >= 500) return FUENTES.media;
  return FUENTES.regular;
}

// Estilo listo para un Text: familia + peso neutro + cifras tabulares.
export function estiloFuente(style: TextStyle | undefined, condensada?: boolean): TextStyle {
  const fontSize = style?.fontSize ?? ESCALA.secundario;
  if (style?.fontFamily) return {};
  return { fontFamily: familia(fontSize, style?.fontWeight, condensada), fontWeight: "normal", fontVariant: ["tabular-nums"] };
}
