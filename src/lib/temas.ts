export type TemaId = "verde" | "rojo" | "negro";

export type PaletaTema = {
  id: TemaId;
  nombre: string;
  fondo: string;
  fondoTarjeta: string;
  acento: string;
  acentoTexto: string;
  textoSuave: string;
  textoFuerte: string;
  error: string;
};

export const TEMAS: PaletaTema[] = [
  {
    id: "verde",
    nombre: "Verde (paño)",
    fondo: "#0b3d2e",
    fondoTarjeta: "#0f4d3a",
    acento: "#f5c542",
    acentoTexto: "#0b3d2e",
    textoSuave: "#9fd8c0",
    textoFuerte: "#ffffff",
    error: "#ff8a80",
  },
  {
    id: "rojo",
    nombre: "Rojo",
    fondo: "#3d0b0f",
    fondoTarjeta: "#4d0f16",
    acento: "#f5c542",
    acentoTexto: "#3d0b0f",
    textoSuave: "#e39a9f",
    textoFuerte: "#ffffff",
    error: "#ffb199",
  },
  {
    id: "negro",
    nombre: "Negro",
    fondo: "#121212",
    fondoTarjeta: "#1e1e1e",
    acento: "#f5c542",
    acentoTexto: "#121212",
    textoSuave: "#9aa0a6",
    textoFuerte: "#ffffff",
    error: "#ff8a80",
  },
];

export const TEMA_DEFECTO = TEMAS[0];

export function obtenerTema(id: string | null): PaletaTema {
  return TEMAS.find((t) => t.id === id) ?? TEMA_DEFECTO;
}