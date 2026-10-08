import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "./supabase";
import { nombreCanalUnico } from "./salas";

export function useLigaEnVivo(liga: string | undefined, temporada: string | null, actualizar: () => void) {
  const [enVivo, setEnVivo] = useState(false);
  useFocusEffect(useCallback(() => {
    let vivo = true;
    setEnVivo(false);
    if (!liga || !temporada) return;
    const refrescar = () => { if (vivo) actualizar(); };
    const canal = supabase.channel(nombreCanalUnico(`club-${liga}`))
      .on("postgres_changes", { event: "*", schema: "public", table: "liga_partidas", filter: `temporada_id=eq.${temporada}` }, refrescar)
      .on("postgres_changes", { event: "*", schema: "public", table: "liga_temporadas", filter: `liga_id=eq.${liga}` }, refrescar)
      .on("postgres_changes", { event: "*", schema: "public", table: "liga_miembros", filter: `liga_id=eq.${liga}` }, refrescar)
      .subscribe(estado => {
        if (!vivo) return;
        setEnVivo(estado === "SUBSCRIBED");
        if (estado === "SUBSCRIBED") refrescar();
      });
    const app = AppState.addEventListener("change", estado => { if (estado === "active") refrescar(); });
    return () => {
      vivo = false;
      app.remove();
      void supabase.removeChannel(canal).catch(() => {});
    };
  }, [liga, temporada, actualizar]));
  return enVivo;
}
