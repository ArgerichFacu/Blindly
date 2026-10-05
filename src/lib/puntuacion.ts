import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
export const PUNTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;
export type Puntuacion = {
  puntos: number;
  partidas: number;
  rango: number | null;
  plus_activo: boolean;
  historial_completo: boolean;
  historial: {
    sala_id: string;
    jugadores: number;
    puesto: number;
    puntos: number;
    finalizada_en: string;
    duracion_ms: number | null;
    temporada_id: string | null;
  }[];
  estadisticas: {
    partidas: number;
    victorias: number;
    podios: number;
    win_rate: number;
    posicion_media: number | null;
    puntos: number;
    mejor_posicion: number | null;
    peor_posicion: number | null;
    mejor_racha_victorias: number;
    evolucion: { finalizada_en: string; puntos: number; acumulado: number }[];
    por_mes: {
      mes: string;
      partidas: number;
      victorias: number;
      puntos: number;
      posicion_media: number;
    }[];
  } | null;
};

export type Comparacion = {
  user_id: string;
  nombre: string;
  partidas_juntos: number;
  yo_arriba: number;
  rival_arriba: number;
  empates: number;
  mis_victorias: number;
  sus_victorias: number;
  mis_podios: number;
  sus_podios: number;
};
export async function miPuntuacion(): Promise<Puntuacion> {
  await asegurarSesion();
  const { data, error } = await supabase.rpc("mi_puntuacion");
  if (error) throw error;
  return data;
}
export async function miHeadToHead(): Promise<Comparacion[]> {
  await asegurarSesion();
  const { data, error } = await supabase.rpc("mi_head_to_head");
  if (error) throw error;
  return data as Comparacion[];
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
