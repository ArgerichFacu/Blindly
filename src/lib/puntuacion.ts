import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
export const PUNTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;
export type Puntuacion = {
  puntos: number;
  partidas: number;
  rango: number | null;
  historial: {
    sala_id: string;
    jugadores: number;
    puesto: number;
    puntos: number;
    finalizada_en: string;
  }[];
};
export async function miPuntuacion(): Promise<Puntuacion> {
  await asegurarSesion();
  const { data, error } = await supabase.rpc("mi_puntuacion");
  if (error) throw error;
  return data;
}
export function useRangosMesa(
  salaId: string | undefined,
  mano: number | undefined,
  estado: string | undefined,
  cantidad: number,
) {
  const [rangos, setRangos] = useState<Record<string, number | null>>({});
  const [error, setError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      setRangos({});
      setError(false);
      if (salaId)
        void (async () => {
          const { data, error } = await supabase.rpc("rangos_mesa", {
            p_sala: salaId,
          });
          if (!activo) return;
          if (error) {
            setError(true);
            return;
          }
          setRangos(
            Object.fromEntries(
              (data as { jugador_id: string; rango: number | null }[]).map(
                (r) => [r.jugador_id, r.rango],
              ),
            ),
          );
        })().catch(() => {
          if (activo) setError(true);
        });
      return () => {
        activo = false;
      };
      // Estos cambios remotos fuerzan una nueva consulta aunque no sean parámetros RPC.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salaId, mano, estado, cantidad]),
  );
  return { rangos, error };
}
