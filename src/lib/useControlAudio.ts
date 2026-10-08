import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { crearControlAudio } from "./audio";
export function useControlAudio(permitido: boolean, exclusivo = false) {
  const [control] = useState(() => crearControlAudio(exclusivo));
  useFocusEffect(
    useCallback(() => {
      let enPrimerPlano =
        AppState.currentState === "active" || AppState.currentState === null;
      control.permitir(permitido && enPrimerPlano);
      const listener = AppState.addEventListener("change", (estado) => {
        enPrimerPlano = estado === "active";
        control.permitir(permitido && enPrimerPlano);
      });
      return () => {
        listener.remove();
        control.permitir(false);
      };
    }, [control, permitido]),
  );
  useEffect(() => () => control.detener(), [control]);
  return control;
}
