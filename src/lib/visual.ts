import type { ViewStyle } from "react-native";
export const SALON = {
  carbon: "#0D1011", marfil: "#F3E8D3", champagne: "#DCC298",
  oroLuz: "#F2E4C7", oroSombra: "#A58757", bordo: "#5A1E22",
  bordoTexto: "#F4CBC7", surface: "#151B1A",
};
export const RELIEVE = {
  bajo: { boxShadow: "0 3px 10px rgba(0,0,0,0.16)" },
  panel: { boxShadow: "0 8px 22px rgba(0,0,0,0.24)" },
  protagonista: { boxShadow: "0 14px 32px rgba(0,0,0,0.32)" },
  modal: { boxShadow: "0 -12px 40px rgba(0,0,0,0.42)" },
} satisfies Record<string, ViewStyle>;
export function velo(color: string, alpha: string) {
  return /^#[\da-f]{6}$/i.test(color ?? "") ? `${color}${alpha}` : color;
}
