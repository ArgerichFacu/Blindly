import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const identidadActual = useRef<string | null>(null), epoca = useRef(0);
  const [revisionIdentidad, setRevisionIdentidad] = useState(0);
  const [sesionReemplazada, setSesionReemplazada] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const id = sesion?.user.id ?? null;
      if (id === identidadActual.current) return;
      if (identidadActual.current) setSesionReemplazada(true);
      identidadActual.current = id; epoca.current++;
      setSala(null); setJugadores([]); setUsuario(""); setError(null); setConectado(false);
      recarga.current = reintento.current = async () => {};
      setRevisionIdentidad(v => v + 1);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const aplicar = useCallback(
    (nueva: Sala) => {
      if (revisionIdentidad !== epoca.current) return;
      setSala((actual) =>
        !actual || actual.id !== nueva.id || nueva.revision >= actual.revision
          ? nueva
          : actual,
      );
    },
    [revisionIdentidad],
  );
  useFocusEffect(
    useCallback(() => {
      void revisionIdentidad;
      let activo = true,
        canal: RealtimeChannel | undefined,
        generacion = 0,
        consulta = 0;
      let temporizador: ReturnType<typeof setTimeout> | undefined;
      const turno = epoca.current;
      const vigente = () => activo && turno === epoca.current;
      async function refrescar() {
        const numero = ++consulta;
        try {
          const nueva = await obtenerSalaPorCodigo(codigo);
          const lista = await listarJugadores(nueva.id);
          if (vigente() && numero === consulta) {
            aplicar(nueva);
            setJugadores(lista);
            setError(null);
          }
        } catch (e) {
          if (vigente()) {
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
              if (vigente() && version === generacion) void refrescar();
            },
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "jugadores",
              filter: `sala_id=eq.${salaId}`,
            },
            () => {
              if (vigente() && version === generacion) void refrescar();
            },
          )
          .subscribe((estado, e) => {
            if (!vigente() || version !== generacion) return;
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
                if (vigente()) conectar(salaId);
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
          if (!vigente()) return;
          setUsuario(yo.id);
          setSesionReemplazada(false);
          aplicar(nueva);
          id = nueva.id;
          conectar(id);
          await refrescar();
        } catch (e) {
          if (vigente()) setError(e);
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
        if (estado === "active" && vigente()) {
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
    }, [codigo, aplicar, revisionIdentidad]),
  );
  return {
    sala,
    jugadores,
    usuario,
    error,
    conectado,
    sesionReemplazada,
    aplicar,
    refrescar: () => recarga.current(),
    reconectar: () => reintento.current(),
  };
}
