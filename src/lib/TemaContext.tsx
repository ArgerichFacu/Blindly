import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cargarTemaId, guardarTemaId } from "./almacenamiento";
import { obtenerTema, TEMA_DEFECTO, type PaletaTema, type TemaId } from "./temas";
import { usePlus } from "./PlusContext";
import { capacidadesPlus } from "./capacidadesPlus";

type ContextoTema = {
  tema: PaletaTema;
  elegirTema: (id: TemaId) => void;
};

const TemaContext = createContext<ContextoTema>({
  tema: TEMA_DEFECTO,
  elegirTema: () => {},
});

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<PaletaTema>(TEMA_DEFECTO);
  const plus = usePlus();

  useEffect(() => {
    cargarTemaId().then((id) => setTema(obtenerTema(id)));
  }, []);

  function elegirTema(id: TemaId) {
    const elegido = obtenerTema(id);
    if (elegido.plus && !capacidadesPlus(plus).personalizar) return;
    setTema(elegido);
    guardarTemaId(id);
  }

  // El tema guardado permanece: expirar/cargar/offline muestra Free, restaurar
  // el entitlement vuelve a mostrarlo sin reescribir preferencias.
  const visible = tema.plus && !capacidadesPlus(plus).personalizar ? TEMA_DEFECTO : tema;
  return <TemaContext.Provider value={{ tema: visible, elegirTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}
