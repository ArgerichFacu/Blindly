import { useEffect } from "react";
import { useRootNavigationState, useRouter } from "expo-router";
import { actualizarPushAutorizado, pushDisponible } from "../lib/pushNativo";
import { destinoAviso } from "../lib/destinoAviso";
import type { NotificationResponse } from "expo-notifications";
import { usePreferencias } from "../lib/Preferencias";
import { supabase } from "../lib/supabase";
import { AppState } from "react-native";

export function AvisosNativos() {
  const router = useRouter(), navigation = useRootNavigationState();
  const { preferencias } = usePreferencias();
  useEffect(() => {
    if (!pushDisponible) return;
    const refrescar = () => { void actualizarPushAutorizado(preferencias.idioma).catch(() => {}); };
    refrescar();
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(refrescar, 0); });
    const listener = AppState.addEventListener("change", estado => { if (estado === "active") refrescar(); });
    return () => { data.subscription.unsubscribe(); listener.remove(); };
  }, [preferencias.idioma]);
  useEffect(() => {
    if (!pushDisponible || !navigation?.key) return;
    let vivo = true, limpiar = () => {};
    void import("expo-notifications").then(N => {
      if (!vivo) return;
      const abrir = (respuesta: NotificationResponse) => {
        if (!vivo || respuesta.actionIdentifier !== N.DEFAULT_ACTION_IDENTIFIER) return;
        const destino = destinoAviso(respuesta.notification.request.content.data);
        void N.clearLastNotificationResponseAsync().catch(() => {});
        if (destino) router.push(destino);
      };
      const listener = N.addNotificationResponseReceivedListener(abrir);
      limpiar = () => listener.remove();
      void N.getLastNotificationResponseAsync().then(r => { if (r) abrir(r); }).catch(() => {});
    }).catch(() => {});
    return () => { vivo = false; limpiar(); };
  }, [router, navigation?.key]);
  return null;
}
