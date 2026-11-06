// QA opt-in de la candidata: sólo eventos de SDK, sin identidad, recibos ni datos
// de partidas. No envía telemetría ni persiste un historial publicitario propio.
export function registrarPublicidadQA(evento: "sdk_init" | "load" | "ready" | "opened" | "closed" | "sdk_error" | "consent_error" | "consent_blocked" | "offline" | "show_timeout" | "qa_no_load" | "qa_show_error" | "qa_show_timeout") {
  if (process.env.EXPO_PUBLIC_ADS_QA_DIAGNOSTICS === "true") console.info("[BlindlyAdsQA]", evento);
}
