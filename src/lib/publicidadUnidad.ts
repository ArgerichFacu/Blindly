import { Platform } from "react-native";
// ID real del bloque interstitial de AdMob, cargado como variable de entorno EAS
// (no es secreto, pero no se versiona). En desarrollo nunca se piden anuncios
// reales: sólo funciona la ruta QA con los IDs de prueba de Google. iOS todavía
// no tiene unidad propia.
export const UNIDAD_INTERSTICIAL_REAL: string | undefined = __DEV__ || Platform.OS !== "android"
  ? undefined
  : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID;
