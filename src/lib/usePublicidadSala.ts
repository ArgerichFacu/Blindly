import { useCallback, useLayoutEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import { usePlus } from "./PlusContext";
import { modoPublicidad, escenarioAdsQA } from "./publicidadConfig";
import { registrarPublicidadQA } from "./publicidadDiagnostico";
import { SesionPublicidad } from "./publicidadSesion";
import { UNIDAD_INTERSTICIAL_REAL } from "./publicidadUnidad";
import { supabase } from "./supabase";

const sesion = new SesionPublicidad(async permitido => {
  if (!permitido()) return null;
  const { data, error } = await supabase.rpc("estado_publicidad");
  if (error || !permitido()) return null;
  const modo = modoPublicidad(data, UNIDAD_INTERSTICIAL_REAL);
  if (!modo) return null;
  // Los escenarios sintéticos de fallo sólo existen en la ruta QA.
  const escenario = modo === "prueba" ? escenarioAdsQA(data as Record<string, unknown>) : "normal";
  if (!escenario) return null;
  if (escenario === "no_load") { registrarPublicidadQA("qa_no_load"); return null; }
  const { prepararInterstitial } = await import("./publicidadAdmob");
  // QA siempre usa el ID de prueba de Google; producción, la unidad real.
  return prepararInterstitial(permitido, escenario, modo === "real" ? UNIDAD_INTERSTICIAL_REAL : undefined);
});

// Sólo se usa en los dos formularios de entrada, nunca en la sala, el lobby,
// el layout, un deep link, una reconexión o un evento de foreground.
export function usePublicidadSala() {
  const plus = usePlus();
  const acceso = useRef(plus);
  const ventana = useRef<ReturnType<SesionPublicidad["abrir"]> | null>(null);
  useLayoutEffect(() => {
    const anterior = acceso.current;
    acceso.current = plus;
    if (anterior.identidad !== plus.identidad || plus.activo || plus.cargando || plus.error || plus.tipoAcceso !== "FREE") ventana.current?.cancelar();
  }, [plus]);
  useFocusEffect(useCallback(() => {
    let vivo = true;
    let actual: ReturnType<SesionPublicidad["abrir"]> | null = null;
    const cancelar = () => { vivo = false; actual?.cancelar(); };
    // Un inicio por deep link/recovery nunca habilita publicidad en esta sesión.
    // Esta consulta no se espera desde crear/unirse; un toque temprano la omite.
    void Linking.getInitialURL().then(url => {
      if (!vivo || url || AppState.currentState !== "active") return;
      const identidad = acceso.current.identidad;
      actual = sesion.abrir(() => {
        const p = acceso.current;
        return vivo && AppState.currentState === "active" && !!identidad && p.identidad === identidad &&
          !p.activo && !p.cargando && !p.error && p.tipoAcceso === "FREE";
      });
      ventana.current = actual;
    }).catch(cancelar);
    const listener = AppState.addEventListener("change", estado => {
      if (estado !== "active") cancelar();
      // Volver del background no precarga ni habilita una presentación tardía.
    });
    const links = Linking.addEventListener("url", cancelar);
    return () => { cancelar(); listener.remove(); links.remove(); if (ventana.current === actual) ventana.current = null; };
  }, []));
  return {
    error: () => { sesion.bloquear(); ventana.current?.error(); },
    confirmar: () => {
      const actual = ventana.current;
      const intento = actual?.confirmar();
      return {
        trasValidar: (entrada: Parameters<NonNullable<typeof actual>["trasValidar"]>[1]) =>
          intento && actual ? actual.trasValidar(intento, entrada) : Promise.resolve(),
        error: () => { sesion.bloquear(); actual?.error(); },
      };
    },
  };
}
