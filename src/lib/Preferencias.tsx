import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cargarSonidoActivado } from "./almacenamiento";
import { errores, traducir, type Idioma } from "./textos";

type Preferencias = {
  idioma: Idioma;
  sonido: boolean;
  volumenRonda: number;
  volumenMusica: number;
  principiante: boolean;
};
const inicial: Preferencias = {
  idioma: "es",
  sonido: true,
  volumenRonda: 0.8,
  volumenMusica: 0.3,
  principiante: false,
};
const Contexto = createContext({
  preferencias: inicial,
  cambiar: (_: Partial<Preferencias>) => {},
});
export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState(inicial);
  const actual = useRef(inicial);
  const secuencia = useRef(Promise.resolve());
  const modificada = useRef(false);
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("preferenciasBlindly"),
      cargarSonidoActivado(),
    ])
      .then(([texto, sonido]) => {
        const datos = texto ? JSON.parse(texto) : { sonido };
        const nuevas = { ...inicial, ...datos };
        if (!["es", "en", "pt"].includes(nuevas.idioma)) nuevas.idioma = "es";
        if (typeof nuevas.principiante !== "boolean")
          nuevas.principiante = false;
        for (const clave of ["volumenRonda", "volumenMusica"] as const)
          if (
            !Number.isFinite(nuevas[clave]) ||
            nuevas[clave] < 0 ||
            nuevas[clave] > 1
          )
            nuevas[clave] = inicial[clave];
        if (!modificada.current) {
          actual.current = nuevas;
          setPreferencias(nuevas);
        }
      })
      .catch((e) => console.warn("No se pudieron cargar las preferencias", e));
  }, []);
  function cambiar(cambios: Partial<Preferencias>) {
    modificada.current = true;
    actual.current = { ...actual.current, ...cambios };
    setPreferencias(actual.current);
    const texto = JSON.stringify(actual.current);
    secuencia.current = secuencia.current
      .then(() => AsyncStorage.setItem("preferenciasBlindly", texto))
      .catch((e) => console.warn("No se pudieron guardar las preferencias", e));
  }
  return (
    <Contexto.Provider value={{ preferencias, cambiar }}>
      {children}
    </Contexto.Provider>
  );
}
export function usePreferencias() {
  const contexto = useContext(Contexto);
  const t = (clave: string, datos?: Record<string, string | number>) =>
    traducir(contexto.preferencias.idioma, clave, datos);
  const mensajeError = (error: unknown) => {
    const mensaje =
      typeof error === "object" && error && "message" in error
        ? String(error.message)
        : String(error);
    const codigoAuth =
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "";
    const codigo = errores[codigoAuth]
      ? codigoAuth
      : Object.keys(errores).find((c) => mensaje.includes(c));
    return t(
      codigo
        ? errores[codigo]
        : /PGRST202|accion_mesa|unirse_mesa|configuracion/.test(mensaje)
          ? "Hace falta actualizar la base de datos de esta app."
          : "No se pudo completar. Probá de nuevo.",
    );
  };
  return { ...contexto, t, mensajeError };
}
