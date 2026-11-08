import type { ConfigContext, ExpoConfig } from "expo/config";

// IDs de ejemplo oficiales de Google: sólo sirven anuncios de prueba.
const ADMOB_PRUEBA = { android: "ca-app-pub-3940256099942544~3347511713", ios: "ca-app-pub-3940256099942544~1458002511" };

// App ID real de AdMob (variable EAS ADMOB_ANDROID_APP_ID). Sin ella se usa el
// de prueba. Una unidad real con App ID de prueba (o al revés) no compila.
function admobAndroidAppId() {
  const appId = process.env.ADMOB_ANDROID_APP_ID?.trim();
  const unidad = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID?.trim();
  if (appId && !/^ca-app-pub-\d{16}~\d{10}$/.test(appId)) throw new Error("ADMOB_ANDROID_APP_ID tiene un formato inválido.");
  if (appId && appId.includes("3940256099942544")) throw new Error("ADMOB_ANDROID_APP_ID no puede ser el ID de prueba de Google.");
  if (unidad && !appId) throw new Error("Falta ADMOB_ANDROID_APP_ID para la unidad real de AdMob.");
  if (appId && unidad && appId.split("~")[0] !== unidad.split("/")[0]) throw new Error("El App ID y la unidad de AdMob son de cuentas distintas.");
  return appId || ADMOB_PRUEBA.android;
}

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
    android: {
      ...config.android,
      package: demo ? "com.blindly.app.plusdemo" : config.android?.package,
      // Sin Advertising ID: los anuncios son no personalizados. Mantener la
      // declaración "Advertising ID: No" de Play mientras esto siga bloqueado.
      blockedPermissions: [
        ...(config.android?.blockedPermissions ?? []),
        "com.google.android.gms.permission.AD_ID",
        "android.permission.ACCESS_ADSERVICES_AD_ID",
        "android.permission.ACCESS_ADSERVICES_ATTRIBUTION",
        "android.permission.ACCESS_ADSERVICES_TOPICS",
      ],
    },
    plugins: [...(config.plugins ?? []), ["react-native-google-mobile-ads", {
      androidAppId: admobAndroidAppId(),
      iosAppId: ADMOB_PRUEBA.ios,
      delayAppMeasurementInit: true,
    }]],
    extra: { ...config.extra, plusDemo: demo },
  };
};
