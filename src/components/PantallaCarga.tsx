import { useTema } from "../lib/TemaContext";
import { ActivityIndicator, View } from "react-native";
import { LogoBlindly } from "./LogoBlindly";
export function PantallaCarga({ onLoadEnd }: { onLoadEnd?: () => void }) {
  const { tema } = useTema();
  return (
    <View
      accessibilityLabel="Blindly"
      style={{
        flex: 1,
        backgroundColor: tema.fondo,
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
      }}
    >
      <LogoBlindly onLoadEnd={onLoadEnd} />
      <ActivityIndicator color={tema.acento} />
    </View>
  );
}
