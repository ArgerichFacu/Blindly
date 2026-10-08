import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
} from "react-native-purchases";

export const PLUS_ENTITLEMENT = "blindly_plus";
export const PLUS_HABILITADO =
  process.env.EXPO_PUBLIC_PLUS_READY === "true";

const clave =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
      : undefined;

// RevenueCat cierra intencionalmente las builds release que usan Test Store.
// Esta defensa evita que una variable EAS mal configurada vuelva a inutilizar
// una APK preview o una build enviada a tienda.
const CLAVE_TEST_STORE = clave?.startsWith("test_") ?? false;
export const PLUS_DISPONIBLE =
  PLUS_HABILITADO && !!clave && (__DEV__ || !CLAVE_TEST_STORE);

let preparando: Promise<CustomerInfo> | null = null;
let usuarioPreparando: string | null = null;

export function tieneEntitlementPlus(info: CustomerInfo | null | undefined) {
  const entitlement = info?.entitlements.active[PLUS_ENTITLEMENT];
  return entitlement?.isActive === true && (entitlement.expirationDate == null
    || Date.parse(entitlement.expirationDate) > Date.now());
}

export async function prepararCompras(usuarioId: string) {
  if (!PLUS_DISPONIBLE || !clave) throw new Error("PLUS_NO_CONFIGURADO");
  if (preparando) {
    if (usuarioPreparando === usuarioId) return preparando;
    // Serializa cambios de cuenta: una consulta pendiente del UUID anterior
    // nunca puede convertirse en el entitlement de la identidad nueva.
    try { await preparando; } catch { /* La siguiente identidad vuelve a intentar. */ }
    return prepararCompras(usuarioId);
  }
  usuarioPreparando = usuarioId;
  preparando = (async () => {
    if (!(await Purchases.isConfigured())) {
      await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      Purchases.configure({
        apiKey: clave,
        appUserID: usuarioId,
        automaticDeviceIdentifierCollectionEnabled: false,
      });
    } else if ((await Purchases.getAppUserID()) !== usuarioId) {
      await Purchases.logIn(usuarioId);
    }
    return Purchases.getCustomerInfo();
  })();
  try {
    return await preparando;
  } finally {
    preparando = null;
    usuarioPreparando = null;
  }
}

export async function tienePlusActivo() {
  if (!PLUS_DISPONIBLE || !(await Purchases.isConfigured())) return false;
  return tieneEntitlementPlus(await Purchases.getCustomerInfo());
}

export const BENEFICIOS_PLUS = [
  {
    simbolo: "♛",
    titulo: "Personalizar botonera · Plus",
    detalle: "Elegí tus sonidos, marcá favoritos y cambiá el orden. Tus ajustes se conservan si vence Plus.",
  },
  {
    simbolo: "◈",
    titulo: "Estadísticas avanzadas",
    detalle: "Analizá resultados, evolución y rendimiento de tus partidas.",
  },
  {
    simbolo: "♾",
    titulo: "Historial completo",
    detalle: "Revisá todas tus partidas y compará resultados entre amigos.",
  },
  {
    simbolo: "♣",
    titulo: "Mesas habituales",
    detalle: "Guardá la configuración de tu grupo y creá la próxima partida en segundos.",
  },
  {
    simbolo: "◆",
    titulo: "Temas y ambientaciones premium",
    detalle: "Personalizá la mesa, los sonidos y la experiencia del torneo.",
  },
  {
    simbolo: "♜",
    titulo: "Estructura personalizada",
    detalle: "Creá tus propios niveles de ciegas y descansos para la mesa.",
  },
  {
    simbolo: "↗",
    titulo: "Recaps para compartir",
    detalle: "Convertí el resultado final en una tarjeta lista para tus redes.",
  },
] as const;
