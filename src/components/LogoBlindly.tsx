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
        overflow: "hidden",
      }}
    >
      <Image
        source={LOGO_BLINDLY}
        accessibilityLabel="Blindly"
        resizeMode="contain"
        onLoadEnd={onLoadEnd}
        style={{
          position: "absolute",
          width: 340 * escala,
          height: 340 * escala,
          left: -40 * escala,
          top: -60 * escala,
        }}
      />
    </View>
  );
}
