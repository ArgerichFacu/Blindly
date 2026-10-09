import { Image, View } from "react-native";
export const LOGO_BLINDLY = require("../../assets/images/blindly-logo-transparent.png");
export function LogoBlindly({
  onLoadEnd,
  ancho = 260,
}: {
  onLoadEnd?: () => void;
  ancho?: number;
}) {
  const escala = ancho / 260;
  return (
    <View
      style={{
        width: ancho,
        height: 220 * escala,
        alignSelf: "center",
        // Preserve the wordmark dot; never crop the transparent source.
      }}
    >
      <Image
        source={LOGO_BLINDLY}
        accessibilityLabel="Blindly"
        resizeMode="contain"
        onLoadEnd={onLoadEnd}
        style={{
          position: "absolute",
          width: ancho,
          height: 220 * escala,
          left: 0,
          top: 0,
        }}
      />
    </View>
  );
}
