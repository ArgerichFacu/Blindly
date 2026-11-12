// Un único interstitial opcional para Free (ver docs/monetizacion-publicitaria.md).
// QA: anuncios oficiales de TEST sólo para la allowlist privada del servidor.
// Producción: el servidor publica la unidad autorizada (sólo con ads_enabled
// encendido) y la build debe haber sido compilada con esa misma unidad.
export type EscenarioAdsQA = "normal" | "no_load" | "show_error" | "show_timeout";
export type ModoPublicidad = "prueba" | "real";

// Editor de los IDs de ejemplo de Google: nunca cuenta como unidad real.
const EDITOR_PRUEBA_GOOGLE = "3940256099942544";

export function unidadRealValida(unidad: string | undefined | null): unidad is string {
  return typeof unidad === "string" && /^ca-app-pub-\d{16}\/\d{10}$/.test(unidad)
    && !unidad.includes(EDITOR_PRUEBA_GOOGLE);
}

export function escenarioAdsQA(datos: Record<string, unknown>): EscenarioAdsQA | null {
  const valor = datos.ads_qa_scenario ?? "normal";
  return valor === "normal" || valor === "no_load" || valor === "show_error" || valor === "show_timeout" ? valor : null;
}

// Decide qué anuncio corresponde según estado_publicidad(). Sin Free verificado,
// sin unidad autorizada por el servidor o si la build trae otra unidad, no hay
// publicidad. Las builds 1.36–1.38 leían 'ads_enabled', que ya no se publica.
export function modoPublicidad(datos: unknown, unidadReal: string | undefined | null): ModoPublicidad | null {
  if (!datos || typeof datos !== "object") return null;
  const d = datos as Record<string, unknown>;
  if (d.elegible_free !== true) return null;
  if (d.ads_qa_enabled === true) return "prueba";
  if (unidadRealValida(unidadReal) && d.ads_unit_android === unidadReal) return "real";
  return null;
}
