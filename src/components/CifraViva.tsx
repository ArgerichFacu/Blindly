import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { Texto } from "./Controles";

// Número que destella apenas cuando cambia (stacks, pozo). Sin movimiento si el sistema lo pide.
export function CifraViva({ valor, texto, style }: { valor: number; texto: string; style?: StyleProp<TextStyle> }) {
  const [opacidad] = useState(() => new Animated.Value(1));
  const anterior = useRef(valor);
  useEffect(() => {
    if (anterior.current === valor) return;
    anterior.current = valor;
    let vivo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reducir) => {
      if (!vivo || reducir) return;
      opacidad.setValue(0.35);
      Animated.timing(opacidad, { toValue: 1, duration: 320, useNativeDriver: Platform.OS !== "web" }).start();
    }).catch(() => {});
    return () => { vivo = false; };
  }, [valor, opacidad]);
  return <Animated.View style={{ opacity: opacidad }}><Texto style={style}>{texto}</Texto></Animated.View>;
}
