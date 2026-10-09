import { useId, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Ellipse, Pattern, Path } from "react-native-svg";
import { useTema } from "../lib/TemaContext";
import { RELIEVE, velo } from "../lib/visual";

// Material estático, sin blur nativo ni imágenes: el contenido sigue siendo el foco.
export function Acabado({ material = "panel", radio = 22 }: { material?: "panel" | "pano" | "oro" | "fondo"; radio?: number }) {
  const { tema } = useTema();
  const id = useId().replace(/:/g, "");
  const oro = material === "oro", ambiente = material === "fondo";
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: ambiente ? 0 : radio }]}>
    <Svg width="100%" height="100%" aria-hidden viewBox="0 0 400 400" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`${id}base`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={oro ? "#F5DFA2" : ambiente ? tema.pano : tema.fondoTarjeta} stopOpacity={oro ? 1 : 0.9}/>
          <Stop offset="1" stopColor={oro ? tema.acento : tema.fondo} stopOpacity={oro ? 1 : ambiente ? 1 : 0.55}/>
        </LinearGradient>
        <RadialGradient id={`${id}luz`} cx="0.1" cy="0" r="0.9">
          <Stop offset="0" stopColor={tema.acento} stopOpacity={ambiente ? 0.045 : 0.1}/>
          <Stop offset="1" stopColor={tema.acento} stopOpacity="0"/>
        </RadialGradient>
        <Pattern id={`${id}fibra`} width="6" height="6" patternUnits="userSpaceOnUse"><Path d="M0 0L6 6M6 0L0 6" stroke={tema.textoSuave} strokeWidth="0.4" opacity="0.055"/></Pattern>
      </Defs>
      <Rect width="400" height="400" fill={`url(#${id}base)`}/>
      {!oro && <Rect width="400" height="400" fill={`url(#${id}luz)`}/>}
      {material === "pano" && <><Rect width="400" height="400" fill={`url(#${id}fibra)`}/><Ellipse cx="380" cy="180" rx="160" ry="210" fill="none" stroke={tema.acento} strokeWidth="1" opacity="0.13"/><Ellipse cx="380" cy="180" rx="143" ry="191" fill="none" stroke={tema.acento} strokeWidth="0.5" opacity="0.1"/></>}
    </Svg>
    {!ambiente && <View style={{ position: "absolute", left: 18, right: 18, top: 0, height: 1, backgroundColor: oro ? "#FFF4D6AA" : velo(tema.acento, "24") }}/>} 
  </View>;
}

export function Superficie({ children, style, variante = "panel" }: { children: ReactNode; style?: StyleProp<ViewStyle>; variante?: "panel" | "hero" | "suave" }) {
  const { tema } = useTema();
  return <View style={[{ backgroundColor: tema.fondoTarjeta, borderColor: variante === "hero" ? velo(tema.acento, "38") : tema.borde, borderWidth: 1, borderRadius: variante === "hero" ? 28 : 22, padding: variante === "hero" ? 24 : 18, gap: 12 }, variante === "hero" ? RELIEVE.protagonista : variante === "suave" ? RELIEVE.bajo : RELIEVE.panel, style]}>
    <Acabado material={variante === "hero" ? "pano" : "panel"} radio={variante === "hero" ? 28 : 22}/>
    {children}
  </View>;
}
