import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { supabase } from "../lib/supabase";
export function SesionNativa() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    const ajustar = (estado: string) => {
      if (estado === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    ajustar(AppState.currentState);
    const listener = AppState.addEventListener("change", ajustar);
    return () => {
      listener.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);
  return null;
}
