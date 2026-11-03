import { Platform } from "react-native";
import type { User } from "@supabase/supabase-js";
import { identidadUsuario } from "./identidad";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
} from "react-native-purchases";

export const PLUS_ENTITLEMENT = "blindly_plus";
export const PLUS_HABILITADO =
  process.env.EXPO_PUBLIC_PLUS_READY === "true";
const DIAGNOSTICO_PAYMENT_RC =
  process.env.EXPO_PUBLIC_PAYMENT_RC_DIAGNOSTICS === "true";

function registrarCatalogoRC(evento: Record<string, unknown>) {
  if (DIAGNOSTICO_PAYMENT_RC) console.info("[BlindlyPaymentRC]", JSON.stringify(evento));
}

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
const CLAVE_TIENDA = !!clave && (
  (Platform.OS === "android" && clave.startsWith("goog_")) ||
  (Platform.OS === "ios" && clave.startsWith("appl_"))
);
export const PLUS_DISPONIBLE =
  PLUS_HABILITADO && (CLAVE_TIENDA || (__DEV__ && CLAVE_TEST_STORE));

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

// Comprar y restaurar usan la identidad recuperable existente, nunca un UUID
// nuevo de RevenueCat. Jugar como invitado sigue disponible sin este requisito.
export async function prepararIdentidadCompra(usuario: User) {
  if (!identidadUsuario(usuario).recuperable) throw new Error("PLUS_PROTEGER_CUENTA");
  await prepararCompras(usuario.id);
}

// Inicializar/consultar no autoriza compras ni sincroniza accesos comerciales.
export async function consultarCatalogoPlus(usuario: User) {
  try {
    // Un invitado puede ver precios; comprar/restaurar siguen exigiendo cuenta
    // recuperable y autorización remota en cada operación.
    await prepararCompras(usuario.id);
    const oferta = (await Purchases.getOfferings()).all.default;
    if ((await Purchases.getAppUserID()) !== usuario.id) throw new Error("SESION_CAMBIO");
    if (!catalogoPlusValido(oferta)) throw new Error("PLUS_OFERTA_INCOMPLETA");
    registrarCatalogoRC({
      evento: "catalogo_leido", sdkConfigurado: true, identidadCoincide: true,
      offering: oferta.identifier,
      paquetes: oferta.availablePackages.map(paquete => ({
        paquete: paquete.identifier, producto: paquete.product.identifier,
        precio: paquete.product.price, precioLocalizado: paquete.product.priceString,
        moneda: paquete.product.currencyCode,
      })),
    });
    return oferta;
  } catch (error) {
    // Nunca registrar el error crudo: el SDK puede incluir identificadores o recibos.
    const codigos = ["PLUS_NO_CONFIGURADO", "PLUS_PROTEGER_CUENTA", "SESION_CAMBIO", "PLUS_OFERTA_INCOMPLETA"];
    const codigo = error instanceof Error && codigos.includes(error.message) ? error.message : "SDK_ERROR";
    registrarCatalogoRC({ evento: "catalogo_error", codigo });
    throw error;
  }
}

export function catalogoPlusValido(oferta: PurchasesOffering | null | undefined): oferta is PurchasesOffering {
  const productos = {
    $rc_monthly: "blindly_plus:monthly",
    $rc_annual: "blindly_plus:annual",
    $rc_lifetime: "blindly_plus_founder_lifetime",
  };
  return oferta?.identifier === "default" && oferta.availablePackages.length === 3 &&
    Object.entries(productos).every(([id, producto]) => oferta.availablePackages.some(p =>
      p.identifier === id && p.product.identifier === producto &&
      Number.isFinite(p.product.price) && p.product.price > 0 && !!p.product.priceString?.trim()));
}

export async function obtenerOfertaPlus() {
  const oferta = (await Purchases.getOfferings()).all.default;
  if (!catalogoPlusValido(oferta)) throw new Error("PLUS_OFERTA_INCOMPLETA");
  return oferta;
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
