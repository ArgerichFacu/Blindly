import type { AnuncioPreparado } from "./publicidadSesion";
import { registrarPublicidadQA } from "./publicidadDiagnostico";
import type { EscenarioAdsQA } from "./publicidadConfig";

let inicializacion: Promise<boolean> | null = null;

// unidad: bloque real de AdMob; sin él se usa el ID de prueba oficial de Google.
export async function prepararInterstitial(permitido: () => boolean, escenario: EscenarioAdsQA = "normal", unidad?: string): Promise<AnuncioPreparado | null> {
  if (!permitido()) return null;
  const network = await import("expo-network");
  const inicial = await network.getNetworkStateAsync();
  if (!permitido()) return null;
  if (inicial.isConnected !== true || inicial.isInternetReachable !== true) { registrarPublicidadQA("offline"); return null; }
  // No evaluar/importar el SDK cuando está apagado o Plus está activo/incierto.
  const { default: mobileAds, AdsConsent, AdEventType, InterstitialAd, TestIds, MaxAdContentRating } = await import("react-native-google-mobile-ads");
  if (!permitido()) return null;
  // No abre formularios en esta transición: el consentimiento se pide al abrir
  // la app (ConsentimientoAnuncios). Si UMP todavía no permite anuncios, se omite.
  let consentimiento;
  try { consentimiento = await AdsConsent.requestInfoUpdate(); }
  catch { registrarPublicidadQA("consent_error"); return null; }
  if (!permitido()) return null;
  if (!consentimiento.canRequestAds) { registrarPublicidadQA("consent_blocked"); return null; }
  if (!inicializacion) inicializacion = (async () => {
    await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.G });
    if (!permitido()) return false;
    registrarPublicidadQA("sdk_init");
    await mobileAds().initialize();
    return true;
  })().catch(error => { inicializacion = null; throw error; });
  if (!await inicializacion) { inicializacion = null; return null; }
  if (!permitido()) return null;
  const actual = await network.getNetworkStateAsync();
  if (!permitido() || actual.isConnected !== true || actual.isInternetReachable !== true) return null;
  const ad = InterstitialAd.createForAdRequest(unidad ?? TestIds.INTERSTITIAL, { requestNonPersonalizedAdsOnly: true });
  let destruido = false, cargadoEn = 0;
  let terminar: ((resultado: "cerrado" | "fallo") => void) | null = null;
  let alAbrir: (() => void) | null = null;
  let conectado = true;
  let esperaApertura: ReturnType<typeof setTimeout> | undefined;
  let esperaCarga: ReturnType<typeof setTimeout> | undefined;
  let esperaCierre: ReturnType<typeof setTimeout> | undefined;
  let red: { remove: () => void } | undefined;
  let finCarga: (ad: AnuncioPreparado | null) => void = () => {};
  const finalizar = (resultado: "cerrado" | "fallo" = "fallo") => {
    if (destruido) return;
    destruido = true;
    clearTimeout(esperaCarga); clearTimeout(esperaApertura); clearTimeout(esperaCierre);
    try { red?.remove(); } catch { /* El cleanup nunca retiene la sala. */ }
    try { ad.destroy(); } catch { /* SDK opcional. */ }
    finCarga(null); terminar?.(resultado); terminar = null; alAbrir = null;
  };
  const destruir = () => finalizar("fallo");
  try {
    red = network.addNetworkStateListener(estado => {
      conectado = estado.isConnected === true && estado.isInternetReachable === true;
      if (!conectado) destruir();
    });
  } catch { destruir(); return null; }
  if (destruido) { red.remove(); return null; }
  const disponible = () => !destruido && conectado && ad.loaded && cargadoEn > 0 && Date.now() - cargadoEn < 55 * 60_000;
  return new Promise(resolve => {
    finCarga = resolve;
    try {
      ad.addAdEventListener(AdEventType.LOADED, () => {
        clearTimeout(esperaCarga);
        if (!permitido()) { destruir(); resolve(null); return; }
        cargadoEn = Date.now();
        registrarPublicidadQA("ready");
        resolve({
          listo: disponible,
          destruir,
          mostrar: (abierto) => new Promise<"cerrado" | "fallo">(continuar => {
            if (!disponible()) { destruir(); continuar("fallo"); return; }
            terminar = continuar;
            alAbrir = abierto;
            // Un SDK que no abre ni devuelve error nunca retiene la navegación.
            // destroy() cancela una presentación tardía antes de entrar al lobby.
            const timeout = () => { registrarPublicidadQA("show_timeout"); destruir(); };
            esperaApertura = setTimeout(timeout, 750);
            // Defensa ante un callback CLOSED perdido. No se espera sin límite.
            // La presentación/descartado nativo se acepta sólo con QA físico.
            esperaCierre = setTimeout(timeout, 90_000);
            if (escenario === "show_error") { registrarPublicidadQA("qa_show_error"); destruir(); return; }
            if (escenario === "show_timeout") { registrarPublicidadQA("qa_show_timeout"); return; }
            const errorShow = () => { registrarPublicidadQA("sdk_error"); destruir(); };
            try { void ad.show().catch(errorShow); } catch { errorShow(); }
          }),
        });
      });
      ad.addAdEventListener(AdEventType.OPENED, () => { registrarPublicidadQA("opened"); clearTimeout(esperaApertura); alAbrir?.(); });
      ad.addAdEventListener(AdEventType.CLOSED, () => { registrarPublicidadQA("closed"); finalizar("cerrado"); });
      ad.addAdEventListener(AdEventType.ERROR, () => { registrarPublicidadQA("sdk_error"); destruir(); resolve(null); });
      esperaCarga = setTimeout(() => { destruir(); resolve(null); }, 10_000);
      registrarPublicidadQA("load"); ad.load();
    } catch { destruir(); resolve(null); }
  });
}
