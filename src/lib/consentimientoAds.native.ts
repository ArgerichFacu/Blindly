import { setPrivacidadAnunciosRequerida } from "./privacidadAnuncios";
// Consentimiento de Google UMP. gatherConsent muestra el formulario sólo donde la
// ley lo exige (UE, Reino Unido, algunos estados de EE. UU.); en el resto del
// mundo resuelve sin mostrar nada. Una vez por runtime y nunca en una sala.
let pedido: Promise<void> | null = null;
export function pedirConsentimientoAnuncios() {
  if (!pedido) pedido = (async () => {
    try {
      const { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus } = await import("react-native-google-mobile-ads");
      const info = await AdsConsent.gatherConsent();
      setPrivacidadAnunciosRequerida(info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED);
    } catch { /* Sin consentimiento resuelto, el interstitial se omite. */ }
  })();
  return pedido;
}
export async function abrirOpcionesPrivacidadAnuncios() {
  const { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus } = await import("react-native-google-mobile-ads");
  const info = await AdsConsent.showPrivacyOptionsForm();
  setPrivacidadAnunciosRequerida(info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED);
}
