import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useTema } from "../lib/TemaContext";
import { RADIOS } from "../lib/temas";

// Identidad "Marcador": las superficies son planas. Sin degradés, luces, tramas ni sombras.
// Acabado queda como no-op para que el código que todavía lo importa siga compilando.
export function Acabado(_props: { material?: "panel" | "pano" | "oro" | "fondo"; radio?: number }) {
  return null;
}

// panel: bloque con borde; hero: bloque destacado sobre la superficie elevada; suave: lista agrupada sin borde.
export function Superficie({ children, style, variante = "panel" }: { children: ReactNode; style?: StyleProp<ViewStyle>; variante?: "panel" | "hero" | "suave" }) {
  const { tema } = useTema();
  return <View style={[{
    backgroundColor: variante === "hero" ? tema.superficieElevada : tema.superficie,
    borderColor: tema.borde,
    borderWidth: variante === "suave" ? 0 : 1,
    borderRadius: RADIOS.panel,
    padding: 16,
    gap: 12,
    overflow: "hidden",
  }, style]}>
    {children}
  </View>;
}
