import type { AnuncioPreparado } from "./publicidadSesion";
// Web: no SDK, cookies, solicitudes ni publicidad.
export async function prepararInterstitial(_permitido: () => boolean): Promise<AnuncioPreparado | null> {
  return null;
}
