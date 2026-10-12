import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const demo = process.env.BLINDLY_BUILD_VARIANT === "plus-demo";
  if (demo && (process.env.EXPO_PUBLIC_PLUS_READY === "true" || process.env.EAS_BUILD_PROFILE === "production" || process.env.EAS_BUILD_PROFILE === "play-testing")) {
    throw new Error("Plus Demo no se compila con compras ni con perfiles de tienda.");
  }
  return {
    ...config,
    name: demo ? "Blindly Plus Demo" : config.name ?? "Blindly",
    slug: config.slug ?? "blindly",
    scheme: demo ? "blindly-plus-demo" : config.scheme,
    android: { ...config.android, package: demo ? "com.blindly.app.plusdemo" : config.android?.package },
    extra: { ...config.extra, plusDemo: demo },
  };
};
