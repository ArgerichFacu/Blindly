import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { User } from "@supabase/supabase-js";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
import { nombreVisible } from "./nombreVisible";

export function useNombreVisible() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [error, setError] = useState<unknown>(null);
  const generacion = useRef(0);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      generacion.current++;
      setUsuario(sesion?.user ?? null);
      setError(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useFocusEffect(useCallback(() => {
    let vivo = true;
    const turno = generacion.current;
    void asegurarSesion().then(u => { if (vivo && turno === generacion.current) setUsuario(u); }).catch(e => { if (vivo && turno === generacion.current) setError(e); });
    return () => { vivo = false; };
  }, []));
  return { usuario, nombre: nombreVisible(usuario), error };
}
