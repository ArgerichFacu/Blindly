import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, View, useWindowDimensions } from "react-native";
import { Texto } from "./Controles";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { formatoNumero } from "../lib/numeros";
import { RADIOS } from "../lib/temas";
import type { Nivel } from "../lib/niveles";

// Reloj de la sala en la identidad "Marcador": tiempo enorme para leerlo desde cualquier silla,
// barra con la estructura del torneo y las cifras de la mano. Al cambiar de nivel el panel hace
// un destello corto (se omite si el sistema pide reducir movimiento).
export function MarcadorNivel({ niveles, indice, tiempo, terminado, mano, pozo }: {
  niveles: Nivel[];
  indice: number;
  tiempo: string;
  terminado: boolean;
  mano: number;
  pozo?: number;
}) {
  const { tema } = useTema(), { t, preferencias } = usePreferencias();
  const { width, fontScale } = useWindowDimensions();
  const n = (x: number) => formatoNumero(x, preferencias.idioma);
  const nivel = niveles[indice];
  const jugables = niveles.map((x, i) => ({ x, i })).filter(({ x }) => !x.esBreak);
  const numero = niveles.slice(0, indice + 1).filter((x) => !x.esBreak).length;
  const siguiente = niveles.slice(indice + 1).find((x) => !x.esBreak);
  const tamano = Math.max(56, Math.min(112, Math.floor((width - 64) / 3.1 / Math.max(1, fontScale * 0.8))));
  const titulo = terminado ? t("Fin de niveles") : nivel?.esBreak ? t("Descanso") : t("Nivel {n}", { n: numero });

  const [destello] = useState(() => new Animated.Value(1));
  const anterior = useRef(indice);
  useEffect(() => {
    if (anterior.current === indice) return;
    anterior.current = indice;
    let vivo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reducir) => {
      if (!vivo || reducir) return;
      destello.setValue(0.55);
      Animated.timing(destello, { toValue: 1, duration: 420, useNativeDriver: Platform.OS !== "web" }).start();
    }).catch(() => {});
    return () => { vivo = false; };
  }, [indice, destello]);

  return <Animated.View accessibilityLiveRegion="polite" style={{ opacity: destello, backgroundColor: tema.mesa, borderRadius: RADIOS.panel, padding: 16, gap: 8 }}>
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
      <Texto style={{ fontSize: 22, fontWeight: "600" }}>{titulo}{!terminado && !nivel?.esBreak ? <Texto style={{ fontSize: 15, fontWeight: "400", color: tema.texto }}>{` ${t("de {n}", { n: jugables.length })}`}</Texto> : null}</Texto>
      <Texto style={{ fontSize: 15 }}>{t("Mano {n}", { n: mano })}</Texto>
    </View>
    <Texto accessibilityLiveRegion="none" style={{ fontSize: tamano, lineHeight: Math.round(tamano * 1.02), fontWeight: "700" }} condensada>{tiempo}</Texto>
    {jugables.length > 1 && <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", gap: 3 }}>
      {jugables.slice(0, 24).map(({ i }) => <View key={i} style={{ flex: 1, height: 6, borderRadius: 1, backgroundColor: i < indice ? tema.texto : i === indice ? tema.acentoMesa : tema.fondo + "66" }} />)}
    </View>}
    <View style={{ flexDirection: "row", marginTop: 6, borderTopWidth: 1, borderColor: tema.fondo + "55" }}>
      <Celda etiqueta={t("Ciegas")} valor={nivel && !nivel.esBreak ? `${n(nivel.smallBlind)} / ${n(nivel.bigBlind)}` : "—"} />
      <Celda etiqueta={t("Sigue")} valor={siguiente ? `${n(siguiente.smallBlind)} / ${n(siguiente.bigBlind)}` : "—"} separada />
      {pozo !== undefined && <Celda etiqueta={t("Pozo")} valor={n(pozo)} separada />}
    </View>
  </Animated.View>;
}

function Celda({ etiqueta, valor, separada = false }: { etiqueta: string; valor: string; separada?: boolean }) {
  const { tema } = useTema();
  return <View style={{ flex: 1, paddingTop: 8, paddingLeft: separada ? 12 : 0, borderLeftWidth: separada ? 1 : 0, borderColor: tema.fondo + "55", gap: 2 }}>
    <Texto style={{ fontSize: 13 }}>{etiqueta}</Texto>
    <Texto style={{ fontSize: 22, fontWeight: "600" }}>{valor}</Texto>
  </View>;
}
