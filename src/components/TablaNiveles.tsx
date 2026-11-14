import { View } from "react-native";
import { Texto } from "./Controles";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { formatoNumero } from "../lib/numeros";
import type { Nivel } from "../lib/niveles";

// Estructura de ciegas como tabla: nivel, ciegas y duración, con columnas alineadas.
export function TablaNiveles({ niveles }: { niveles: Nivel[] }) {
  const { tema } = useTema(), { t, preferencias } = usePreferencias();
  const n = (x: number) => formatoNumero(x, preferencias.idioma);
  const numeros = niveles.map((_, i) => niveles.slice(0, i + 1).filter((x) => !x.esBreak).length);
  return <View accessibilityRole="list" style={{ borderTopWidth: 1, borderColor: tema.borde }}>
    <View style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: tema.borde }}>
      <Texto suave style={{ width: 64, fontSize: 13 }}>{t("Nivel")}</Texto>
      <Texto suave style={{ flex: 1, fontSize: 13 }}>{t("Ciegas")}</Texto>
      <Texto suave style={{ width: 72, fontSize: 13, textAlign: "right" }}>{t("Duración")}</Texto>
    </View>
    {niveles.map((x, i) => {
      const nivel = numeros[i];
      const ciegas = x.esBreak ? t("Descanso") : `${n(x.smallBlind)} / ${n(x.bigBlind)}${x.ante ? ` · ${t("ante")} ${n(x.ante)}` : ""}`;
      return <View key={i} accessible accessibilityLabel={`${x.esBreak ? t("Descanso") : t("Nivel {n}", { n: nivel })}. ${ciegas}. ${formatoNumero(x.minutos, preferencias.idioma, 2)} min`}
        style={{ flexDirection: "row", alignItems: "center", minHeight: 40, borderBottomWidth: 1, borderColor: tema.borde, backgroundColor: x.esBreak ? tema.superficie : "transparent" }}>
        <Texto style={{ width: 64, fontSize: 16, fontWeight: "600" }} condensada>{x.esBreak ? "—" : String(nivel)}</Texto>
        <Texto suave={x.esBreak} style={{ flex: 1, fontSize: 16, fontWeight: x.esBreak ? "400" : "600" }} condensada={!x.esBreak}>{ciegas}</Texto>
        <Texto style={{ width: 72, fontSize: 16, textAlign: "right" }}>{formatoNumero(x.minutos, preferencias.idioma, 2)} min</Texto>
      </View>;
    })}
  </View>;
}
