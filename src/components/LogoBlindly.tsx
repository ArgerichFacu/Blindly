import { Image, View } from "react-native";
export const LOGO_BLINDLY = require("../../assets/images/blindly-logo-transparent.png");
export function LogoBlindly({ onLoadEnd }: { onLoadEnd?: () => void }) {
  return (
    <View
      style={{
        width: 260,
        height: 220,
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
          width: 340,
          height: 340,
          left: -40,
          top: -60,
        }}
      />
    </View>
  );
}
