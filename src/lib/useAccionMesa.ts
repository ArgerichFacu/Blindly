import { useRef, useState } from "react";
import {
  ejecutarAccion,
  nuevaSolicitud,
  type AccionMesa,
  type Sala,
} from "./salas";
import { usePreferencias } from "./Preferencias";

export function useAccionMesa(
  sala: Sala | null,
  alGuardar: (s: Sala) => void,
  refrescar?: () => Promise<void>,
) {
  const { mensajeError, t } = usePreferencias();
  const [ocupado, setOcupado] = useState(false),
    [error, setError] = useState(""),
    [incierto, setIncierto] = useState(false);
  const bloqueo = useRef(false);
  const pendiente = useRef<{
    sala: string;
    accion: AccionMesa;
    datos: Record<string, unknown>;
    id: string;
    despues?: () => void;
  } | null>(null);
  async function enviar() {
    const peticion = pendiente.current;
    if (!peticion || bloqueo.current) return;
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    try {
      const nueva = await ejecutarAccion(
        peticion.sala,
        peticion.accion,
        peticion.datos,
        peticion.id,
      );
      alGuardar(nueva);
      pendiente.current = null;
      setIncierto(false);
      // La acción ya está confirmada. Una lectura lenta o fallida no debe
      // bloquear los controles ni presentarla como una apuesta incierta.
      void refrescar?.().catch((e) => console.warn("[Mesa] recarga", e));
      peticion.despues?.();
    } catch (e) {
      console.warn("[Mesa] operación", peticion.accion, e);
      const codigo =
        typeof e === "object" && e && "code" in e ? String(e.code) : "";
      const ambiguo = !codigo || !/^(P0001|22|23|42|PGRST)/.test(codigo);
      setIncierto(ambiguo);
      setError(
        ambiguo
          ? t(
              "La conexión no confirmó la operación. Usá Reintentar para consultar o enviar la misma operación sin duplicarla.",
            )
          : mensajeError(e),
      );
      if (!ambiguo) pendiente.current = null;
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  function ejecutar(
    accion: AccionMesa,
    datos: Record<string, unknown> = {},
    despues?: () => void,
  ) {
    if (!sala || bloqueo.current || pendiente.current) return;
    pendiente.current = {
      sala: sala.id,
      accion,
      datos,
      id: nuevaSolicitud(),
      despues,
    };
    void enviar();
  }
  return {
    ejecutar,
    ocupado: ocupado || incierto,
    error,
    reintentar: enviar,
    incierto,
  };
}
