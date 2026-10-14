import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Ellipse, Path, G, Circle } from "react-native-svg";
import { useTema } from "../lib/TemaContext";
import { SALON } from "../lib/visual";

// Ilustración original de Blindly. Estática y decorativa; no descarga assets.
export function AmbienteHome() {
  const { tema } = useTema();
  const id = useId().replace(/:/g, "");
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: 28 }]}>
    <Svg width="100%" height="100%" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Defs>
        <LinearGradient id={`${id}felt`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={tema.pano}/><Stop offset="1" stopColor={SALON.carbon}/></LinearGradient>
        <RadialGradient id={`${id}lamp`} cx="0.86" cy="0.06" r="0.8"><Stop offset="0" stopColor={SALON.champagne} stopOpacity="0.46"/><Stop offset="1" stopColor={SALON.champagne} stopOpacity="0"/></RadialGradient>
      </Defs>
      <Rect width="600" height="600" fill={`url(#${id}felt)`}/>
      <Ellipse cx="380" cy="340" rx="340" ry="270" fill={tema.pano} stroke={SALON.carbon} strokeWidth="42"/>
      <Ellipse cx="380" cy="340" rx="308" ry="243" fill="none" stroke={SALON.champagne} strokeWidth="2" opacity="0.45"/>
      <Ellipse cx="380" cy="340" rx="296" ry="231" fill="none" stroke={SALON.champagne} strokeWidth="1" opacity="0.25"/>
      <G transform="translate(437 66) rotate(18)"><Rect width="64" height="92" rx="6" fill={SALON.marfil}/><Path d="M32 25c-20 20-21 30-6 31l-5 10h22l-5-10c15-1 14-11-6-31z" fill={SALON.carbon}/></G>
      <G transform="translate(478 82) rotate(34)"><Rect width="64" height="92" rx="6" fill={SALON.marfil}/><Path d="M32 24l15 20-15 20-15-20z" fill={SALON.bordo}/></G>
      {[0, 1, 2, 3, 4].map(i => <G key={i} transform={`translate(490 ${230 - i * 9})`}><Ellipse cx="0" cy="8" rx="42" ry="15" fill={SALON.carbon}/><Ellipse rx="42" ry="15" fill={i % 2 ? SALON.bordo : SALON.champagne} stroke={SALON.marfil} strokeWidth="2"/><Ellipse rx="27" ry="9" fill="none" stroke={SALON.marfil} strokeWidth="1" opacity="0.65"/></G>)}
      <Circle cx="543" cy="30" r="9" fill={SALON.champagne}/>
      <Rect width="600" height="600" fill={`url(#${id}lamp)`}/>
      <Rect width="600" height="600" fill={SALON.carbon} opacity="0.8"/>
    </Svg>
  </View>;
}
