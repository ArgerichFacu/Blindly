// v35 sólo permite anuncios oficiales de TEST a la allowlist privada del servidor.
// No hay override de identidad, de consentimiento ni IDs de producción.
export const PUBLICIDAD = Object.freeze({ soloPruebas: true });
export type EscenarioAdsQA = "normal" | "no_load" | "show_error" | "show_timeout";
export function escenarioAdsQA(datos: Record<string, unknown>): EscenarioAdsQA | null {
  const valor = datos.ads_qa_scenario ?? "normal";
  return valor === "normal" || valor === "no_load" || valor === "show_error" || valor === "show_timeout" ? valor : null;
}

export function permitePublicidadPrueba(datos: unknown): boolean {
  if (!datos || typeof datos !== "object") return false;
  const d = datos as Record<string, unknown>;
  return d.ads_qa_enabled === true && d.elegible_free === true;
}
