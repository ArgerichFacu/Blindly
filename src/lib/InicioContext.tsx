import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { crearInicio } from "./inicio";
const Contexto = createContext<ReturnType<typeof crearInicio> | null>(null);
export function InicioProvider({ children }: { children: ReactNode }) {
  const [inicio] = useState(() => crearInicio(AsyncStorage));
  useEffect(() => {
    void inicio.cargar();
  }, [inicio]);
  return <Contexto.Provider value={inicio}>{children}</Contexto.Provider>;
}
export function useInicio() {
  const inicio = useContext(Contexto);
  if (!inicio) throw new Error("InicioProvider ausente");
  const estado = useSyncExternalStore(
    inicio.subscribe,
    inicio.getSnapshot,
    inicio.getSnapshot,
  );
  return { ...estado, ...inicio };
}
