import { useCallback, useLayoutEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";
import { usePlus } from "./PlusContext";
import { PUBLICIDAD } from "./publicidadConfig";
import { SesionPublicidad } from "./publicidadSesion";
import { supabase } from "./supabase";

const sesion = new SesionPublicidad(async permitido => {
  if (!PUBLICIDAD.ads_enabled || !permitido()) return null;
  const { data, error } = await supabase.rpc("estado_publicidad");
  if (error || data?.ads_enabled !== true || data?.elegible_free !== true || !permitido()) return null;
  const { prepararInterstitial } = await import("./publicidadAdmob");
  return prepararInterstitial(permitido);
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
    const identidad = acceso.current.identidad;
    const actual = sesion.abrir(() => {
      const p = acceso.current;
      return PUBLICIDAD.ads_enabled && AppState.currentState === "active" &&
        !!identidad && p.identidad === identidad && !p.activo && !p.cargando &&
        !p.error && p.tipoAcceso === "FREE";
    });
    ventana.current = actual;
    const listener = AppState.addEventListener("change", estado => {
      if (estado !== "active") actual.cancelar();
      // Volver del background no precarga ni habilita una presentación tardía.
    });
    return () => { actual.cancelar(); listener.remove(); if (ventana.current === actual) ventana.current = null; };
  }, []));
  return {
    error: () => ventana.current?.error(),
    confirmar: () => {
      const actual = ventana.current;
      const intento = actual?.confirmar();
      return {
        trasValidar: (entrada: Parameters<NonNullable<typeof actual>["trasValidar"]>[1]) =>
          intento && actual ? actual.trasValidar(intento, entrada) : Promise.resolve(),
        error: () => actual?.error(),
      };
    },
  };
}
