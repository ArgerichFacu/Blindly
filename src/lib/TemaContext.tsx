import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cargarTemaId, guardarTemaId } from "./almacenamiento";
import { obtenerTema, TEMA_DEFECTO, type PaletaTema, type TemaId } from "./temas";
import { usePlus } from "./PlusContext";
import { capacidadesPlus } from "./capacidadesPlus";

type ContextoTema = {
  tema: PaletaTema;
  listo: boolean;
  elegirTema: (id: TemaId) => void;
};

const TemaContext = createContext<ContextoTema>({
  tema: TEMA_DEFECTO,
  listo: false,
  elegirTema: () => {},
});

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<PaletaTema>(TEMA_DEFECTO);
  const [listo, setListo] = useState(false);
  const plus = usePlus();

  useEffect(() => {
    let vivo = true;
    void cargarTemaId().then(id => { if (vivo) setTema(obtenerTema(id)); })
      .catch(() => {}).finally(() => { if (vivo) setListo(true); });
    return () => { vivo = false; };
  }, []);

  function elegirTema(id: TemaId) {
    const elegido = obtenerTema(id);
    if (elegido.plus && !capacidadesPlus(plus).personalizar) return;
    setTema(elegido);
    guardarTemaId(id);
  }

  // El tema guardado permanece: un Free confirmado aplica el fallback sin
  // sobrescribir la selección. Un estado desconocido no es una revocación.
  // Refrescar el acceso no revoca un tema durante unos frames. La selección
  // guardada sólo sirve para apariencia; no habilita funciones ni compras.
  const freeConfirmado = !plus.activo && !plus.cargando && plus.lanzamientoDisponible !== false && !plus.error;
  const visible = tema.plus && freeConfirmado ? TEMA_DEFECTO : tema;
  return <TemaContext.Provider value={{ tema: visible, listo, elegirTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}
