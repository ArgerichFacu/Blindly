import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cargarTemaId, guardarTemaId } from "./almacenamiento";
import { obtenerTema, TEMA_DEFECTO, type PaletaTema, type TemaId } from "./temas";
import { usePlus } from "./PlusContext";

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

  useEffect(() => {
    if (plus.disponible && !plus.cargando && !plus.activo && tema.plus) {
      setTema(TEMA_DEFECTO);
      void guardarTemaId(TEMA_DEFECTO.id);
    }
  }, [plus.activo, plus.cargando, plus.disponible, tema.plus]);

  function elegirTema(id: TemaId) {
    setTema(obtenerTema(id));
    guardarTemaId(id);
  }

  return <TemaContext.Provider value={{ tema, elegirTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}
