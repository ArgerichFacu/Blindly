import { View, StyleSheet, Text } from "react-native";
import { usePreferencias } from "../lib/Preferencias";
export type Palo = "♠" | "♥" | "♦" | "♣";
export function CartaPoker({
  valor,
  palo,
  resaltada = true,
}: {
  valor: string;
  palo: Palo;
  resaltada?: boolean;
}) {
  const rojo = palo === "♥" || palo === "♦",
    color = rojo ? "#B13646" : "#20362C";
  const { t } = usePreferencias();
  return (
    <View
      accessible
      accessibilityLabel={t("{valor} de {palo}", {
        valor: t(
          valor === "A"
            ? "As"
            : valor === "K"
              ? "Rey"
              : valor === "Q"
                ? "Reina"
                : valor === "J"
                  ? "Jota"
                  : valor,
        ),
        palo: t(
          palo === "♠"
            ? "picas"
            : palo === "♥"
              ? "corazones"
              : palo === "♦"
                ? "diamantes"
                : "tréboles",
        ),
      })}
      style={[
        styles.carta,
        {
          backgroundColor: resaltada ? "#F7F2E5" : "#CBD5CE",
          borderColor: resaltada ? "#D8B768" : "#8B9C92",
          transform: [{ translateY: resaltada ? -3 : 0 }],
        },
      ]}
    >
      <View style={styles.esquina}>
        <Text style={[styles.valor, { color }]}>{valor}</Text>
        <Text style={[styles.paloChico, { color }]}>{palo}</Text>
      </View>
      <Text style={[styles.centro, { color }]}>{palo}</Text>
      <View style={[styles.esquina, styles.invertida]}>
        <Text style={[styles.valor, { color }]}>{valor}</Text>
        <Text style={[styles.paloChico, { color }]}>{palo}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  carta: {
    flex: 1,
    maxWidth: 68,
    aspectRatio: 0.69,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.18)",
  },
  esquina: { position: "absolute", top: 4, left: 5, alignItems: "center" },
  valor: { fontSize: 15, lineHeight: 16, fontWeight: "800" },
  paloChico: { fontSize: 10, lineHeight: 11 },
  centro: { fontSize: 25, lineHeight: 31 },
  invertida: {
    top: undefined,
    left: undefined,
    bottom: 4,
    right: 5,
    transform: [{ rotate: "180deg" }],
  },
});
