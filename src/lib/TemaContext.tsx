import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cargarTemaId, guardarTemaId } from "./almacenamiento";
import { obtenerTema, TEMA_DEFECTO, type PaletaTema, type TemaId } from "./temas";

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

  useEffect(() => {
    cargarTemaId().then((id) => setTema(obtenerTema(id)));
  }, []);

  function elegirTema(id: TemaId) {
    setTema(obtenerTema(id));
    guardarTemaId(id);
  }

  return <TemaContext.Provider value={{ tema, elegirTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}