import { useEffect } from "react";
import { Platform } from "react-native";
import { usePlus } from "../lib/PlusContext";
import { modoPublicidad } from "../lib/publicidadConfig";
import { UNIDAD_INTERSTICIAL_REAL } from "../lib/publicidadUnidad";
import { supabase } from "../lib/supabase";

// Al abrir la app, sólo para Free verificado y sólo si el servidor habilita
// publicidad: pide el consentimiento de Google UMP. Plus nunca carga el SDK.
let iniciado = false;
export function ConsentimientoAnuncios() {
  const plus = usePlus();
  const free = !plus.cargando && !plus.error && !!plus.identidad && !plus.activo && plus.tipoAcceso === "FREE";
  useEffect(() => {
    if (!free || Platform.OS === "web" || iniciado) return;
    iniciado = true;
    void (async () => {
      const { data, error } = await supabase.rpc("estado_publicidad");
      if (error || !modoPublicidad(data, UNIDAD_INTERSTICIAL_REAL)) { iniciado = false; return; }
      const { pedirConsentimientoAnuncios } = await import("../lib/consentimientoAds");
      await pedirConsentimientoAnuncios();
    })().catch(() => { iniciado = false; });
  }, [free]);
  return null;
}
