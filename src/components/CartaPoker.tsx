import { View, StyleSheet, Text } from "react-native";
import { usePreferencias } from "../lib/Preferencias";
import { NAIPE, RADIOS } from "../lib/temas";
import { FUENTES } from "../lib/tipografia";
import { Palo as DibujoPalo } from "./Icono";
export type Palo = "♠" | "♥" | "♦" | "♣";

// Naipe plano: papel y tinta fijos (una carta es igual en cualquier tema); el palo es un SVG propio.
// resaltada=false se usa para las cartas que no cuentan: además de atenuarse, se marcan con texto.
export function CartaPoker({
  valor,
  palo,
  resaltada = true,
  compacta = false,
}: {
  valor: string;
  palo: Palo;
  resaltada?: boolean;
  compacta?: boolean;
}) {
  const rojo = palo === "♥" || palo === "♦",
    color = rojo ? NAIPE.rojo : NAIPE.tinta;
  const { t } = usePreferencias();
  const nombre = t("{valor} de {palo}", {
    valor: t(valor === "A" ? "As" : valor === "K" ? "Rey" : valor === "Q" ? "Reina" : valor === "J" ? "Jota" : valor),
    palo: t(palo === "♠" ? "picas" : palo === "♥" ? "corazones" : palo === "♦" ? "diamantes" : "tréboles"),
  });
  return (
    <View
      accessible
      accessibilityLabel={resaltada ? nombre : `${nombre}, ${t("no cuenta")}`}
      style={[
        styles.carta,
        {
          backgroundColor: NAIPE.papel,
          borderColor: resaltada ? NAIPE.tinta : NAIPE.borde,
          borderWidth: resaltada ? 2 : 1,
          opacity: resaltada ? 1 : 0.45,
        },
      ]}
    >
      <View style={styles.esquina}>
        <Text style={[styles.valor, { color }, compacta && { fontSize: 13, lineHeight: 15 }]}>{valor}</Text>
        {!compacta && <DibujoPalo palo={palo} color={color} size={10} />}
      </View>
      <DibujoPalo palo={palo} color={color} size={compacta ? 18 : 24} />
      {!compacta && (
        <View style={[styles.esquina, styles.invertida]}>
          <Text style={[styles.valor, { color }]}>{valor}</Text>
          <DibujoPalo palo={palo} color={color} size={10} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  carta: {
    flex: 1,
    maxWidth: 68,
    aspectRatio: 0.69,
    borderRadius: RADIOS.control,
    alignItems: "center",
    justifyContent: "center",
  },
  esquina: { position: "absolute", top: 4, left: 5, alignItems: "center", gap: 1 },
  valor: { fontSize: 16, lineHeight: 17, fontFamily: FUENTES.condensada },
  invertida: {
    top: undefined,
    left: undefined,
    bottom: 4,
    right: 5,
    transform: [{ rotate: "180deg" }],
  },
});
