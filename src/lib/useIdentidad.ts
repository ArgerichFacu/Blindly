import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { asegurarSesion } from "./sesion";
import { identidadUsuario } from "./identidad";
import { supabase } from "./supabase";
export function useIdentidad() {
  const [estado, setEstado] = useState<{
    cargando: boolean;
    recuperable: boolean;
    error: unknown;
  }>({ cargando: true, recuperable: false, error: null });
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setEstado({ cargando: !sesion, recuperable: sesion ? identidadUsuario(sesion.user).recuperable : false, error: null });
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      setEstado({ cargando: true, recuperable: false, error: null });
      void asegurarSesion()
        .then((u) => {
          if (vivo)
            setEstado({
              cargando: false,
              recuperable: identidadUsuario(u).recuperable,
              error: null,
            });
        })
        .catch((error) => {
          if (vivo) setEstado({ cargando: false, recuperable: false, error });
        });
      return () => {
        vivo = false;
      };
    }, []),
  );
  return estado;
}
