import type { AnuncioPreparado } from "./publicidadSesion";
import type { EscenarioAdsQA } from "./publicidadConfig";
// Web: no SDK, cookies, solicitudes ni publicidad.
export async function prepararInterstitial(_permitido: () => boolean, _escenario: EscenarioAdsQA = "normal", _unidad?: string): Promise<AnuncioPreparado | null> {
  return null;
}
