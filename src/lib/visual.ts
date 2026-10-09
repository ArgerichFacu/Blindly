import type { ViewStyle } from "react-native";
export const RELIEVE = {
  bajo: { boxShadow: "0 3px 10px rgba(0,0,0,0.16)" },
  panel: { boxShadow: "0 8px 22px rgba(0,0,0,0.24)" },
  protagonista: { boxShadow: "0 14px 32px rgba(0,0,0,0.32)" },
} satisfies Record<string, ViewStyle>;
export function velo(color: string, alpha: string) {
  return /^#[\da-f]{6}$/i.test(color ?? "") ? `${color}${alpha}` : color;
}
