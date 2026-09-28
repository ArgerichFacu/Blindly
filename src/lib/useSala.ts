import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState } from "react-native";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { listarJugadores, type Jugador } from "./jugadores";
import { obtenerSalaPorCodigo, nombreCanalUnico, type Sala } from "./salas";
import { supabase } from "./supabase";
import { asegurarSesion } from "./sesion";
import { sincronizarReloj } from "./tiempoServidor";

export function useSala(codigo: string) {
  const [sala, setSala] = useState<Sala | null>(null),
    [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [usuario, setUsuario] = useState(""),
    [error, setError] = useState<unknown>(null),
    [conectado, setConectado] = useState(false);
  const recarga = useRef<() => Promise<void>>(async () => {});
  const reintento = useRef<() => Promise<void>>(async () => {});
  const aplicar = useCallback(
    (nueva: Sala) =>
      setSala((actual) =>
        !actual || actual.id !== nueva.id || nueva.revision >= actual.revision
          ? nueva
          : actual,
      ),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      let activo = true,
        canal: RealtimeChannel | undefined,
        generacion = 0,
        consulta = 0;
      let temporizador: ReturnType<typeof setTimeout> | undefined;
      async function refrescar() {
        const numero = ++consulta;
        try {
          const nueva = await obtenerSalaPorCodigo(codigo);
          const lista = await listarJugadores(nueva.id);
          if (activo && numero === consulta) {
            aplicar(nueva);
            setJugadores(lista);
            setError(null);
          }
        } catch (e) {
          if (activo) {
            setError(e);
            console.warn("[Realtime mesa] recarga", e);
          }
        }
      }
      function conectar(salaId: string) {
        const version = ++generacion;
        if (temporizador) clearTimeout(temporizador);
        if (canal) void supabase.removeChannel(canal);
        setConectado(false);
        canal = supabase
          .channel(nombreCanalUnico(`mesa-${salaId}`), {
            config: { postgres_changes_options: { wait: true } },
          })
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "salas",
              filter: `id=eq.${salaId}`,
            },
            () => {
              if (activo && version === generacion) void refrescar();
            },
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "jugadores" },
            () => {
              if (activo && version === generacion) void refrescar();
            },
          )
          .subscribe((estado, e) => {
            if (!activo || version !== generacion) return;
            console.warn("[Realtime mesa]", estado, e?.message ?? "");
            setConectado(estado === "SUBSCRIBED");
            if (estado === "SUBSCRIBED") {
              if (temporizador) clearTimeout(temporizador);
              void refrescar();
            } else if (
              ["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(estado)
            ) {
              if (temporizador) clearTimeout(temporizador);
              temporizador = setTimeout(() => {
                if (activo) conectar(salaId);
              }, 5000);
            }
          });
      }
      let id: string | undefined;
      async function iniciar() {
        try {
          const yo = await asegurarSesion();
          await sincronizarReloj();
          const nueva = await obtenerSalaPorCodigo(codigo);
          if (!activo) return;
          setUsuario(yo.id);
          aplicar(nueva);
          id = nueva.id;
          conectar(id);
          await refrescar();
        } catch (e) {
          if (activo) setError(e);
        }
      }
      const reintentar = async () => {
        if (id) {
          conectar(id);
          await refrescar();
        } else await iniciar();
      };
      recarga.current = refrescar;
      reintento.current = reintentar;
      const escucha = AppState.addEventListener("change", (estado) => {
        console.warn("[Realtime mesa] aplicación", estado);
        if (estado === "active" && activo) {
          void sincronizarReloj().catch((e) => console.warn(e));
          void reintentar();
        }
      });
      void iniciar();
      return () => {
        activo = false;
        generacion++;
        consulta++;
        escucha.remove();
        if (temporizador) clearTimeout(temporizador);
        if (canal) void supabase.removeChannel(canal);
      };
    }, [codigo, aplicar]),
  );
  return {
    sala,
    jugadores,
    usuario,
    error,
    conectado,
    aplicar,
    refrescar: () => recarga.current(),
    reconectar: () => reintento.current(),
  };
}
