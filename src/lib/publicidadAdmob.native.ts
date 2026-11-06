import type { AnuncioPreparado } from "./publicidadSesion";

let inicializacion: Promise<boolean> | null = null;

export async function prepararInterstitial(permitido: () => boolean): Promise<AnuncioPreparado | null> {
  if (!permitido()) return null;
  const network = await import("expo-network");
  const inicial = await network.getNetworkStateAsync();
  if (!permitido() || inicial.isConnected !== true || inicial.isInternetReachable !== true) return null;
  // No evaluar/importar el SDK cuando está apagado o Plus está activo/incierto.
  const { default: mobileAds, AdsConsent, AdEventType, InterstitialAd, TestIds, MaxAdContentRating } = await import("react-native-google-mobile-ads");
  if (!permitido()) return null;
  // No abre formularios en esta transición. Si UMP requiere consentimiento,
  // omite el anuncio. El flujo de consentimiento real es un gate de lanzamiento.
  const consentimiento = await AdsConsent.requestInfoUpdate();
  if (!permitido() || !consentimiento.canRequestAds) return null;
  if (!inicializacion) inicializacion = (async () => {
    await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.G });
    if (!permitido()) return false;
    await mobileAds().initialize();
    return true;
  })().catch(error => { inicializacion = null; throw error; });
  if (!await inicializacion) { inicializacion = null; return null; }
  if (!permitido()) return null;
  const actual = await network.getNetworkStateAsync();
  if (!permitido() || actual.isConnected !== true || actual.isInternetReachable !== true) return null;
  const ad = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, { requestNonPersonalizedAdsOnly: true });
  let destruido = false, cargadoEn = 0, terminar: (() => void) | null = null;
  let conectado = true;
  let esperaApertura: ReturnType<typeof setTimeout> | undefined;
  let esperaCarga: ReturnType<typeof setTimeout> | undefined;
  let red: { remove: () => void } | undefined;
  let finCarga: (ad: AnuncioPreparado | null) => void = () => {};
  const destruir = () => {
    if (destruido) return;
    destruido = true;
    clearTimeout(esperaCarga); clearTimeout(esperaApertura);
    try { red?.remove(); } catch { /* El cleanup nunca retiene la sala. */ }
    try { ad.destroy(); } catch { /* SDK opcional. */ }
    finCarga(null); terminar?.(); terminar = null;
  };
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
        resolve({
          listo: disponible,
          destruir,
          mostrar: () => new Promise<void>(continuar => {
            if (!disponible()) { destruir(); continuar(); return; }
            terminar = continuar;
            // Un SDK que no abre ni devuelve error nunca retiene la navegación.
            // destroy() cancela una presentación tardía antes de entrar al lobby.
            esperaApertura = setTimeout(destruir, 750);
            try { void ad.show().catch(destruir); } catch { destruir(); }
          }),
        });
      });
      ad.addAdEventListener(AdEventType.OPENED, () => clearTimeout(esperaApertura));
      ad.addAdEventListener(AdEventType.CLOSED, destruir);
      ad.addAdEventListener(AdEventType.ERROR, () => { destruir(); resolve(null); });
      esperaCarga = setTimeout(() => { destruir(); resolve(null); }, 10_000);
      ad.load();
    } catch { destruir(); resolve(null); }
  });
}
