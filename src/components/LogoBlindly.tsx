import { Image, View } from "react-native";

// Wordmark "blindly:" (identidad Marcador), generado por scripts/brand/generar-marca.cjs.
export const LOGO_BLINDLY = require("../../assets/brand/blindly-wordmark.png");
const PROPORCION = 1200 / 499;

export function LogoBlindly({
  onLoadEnd,
  ancho = 220,
}: {
  onLoadEnd?: () => void;
  ancho?: number;
}) {
  const alto = ancho / PROPORCION;
  return (
    <View style={{ width: ancho, height: alto, alignSelf: "center" }}>
      <Image
        source={LOGO_BLINDLY}
        accessibilityLabel="Blindly"
        resizeMode="contain"
        onLoadEnd={onLoadEnd}
        style={{ width: ancho, height: alto }}
      />
    </View>
  );
}
