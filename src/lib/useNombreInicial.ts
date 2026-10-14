import { useEffect, useRef, useState } from "react";
import { useNombreVisible } from "./useNombreVisible";

// Precarga una sola vez por identidad; nunca pisa lo que ya escribió el jugador.
export function useNombreInicial(inicial = "") {
  const identidad = useNombreVisible();
  const [nombre, setNombre] = useState(inicial);
  const editado = useRef(!!inicial);
  useEffect(() => {
    if (!editado.current && identidad.nombre) setNombre(identidad.nombre);
  }, [identidad.nombre]);
  return [nombre, (valor: string) => { editado.current = true; setNombre(valor); }] as const;
}
