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
  borde: string;
  pano: string;
};

export const TEMAS: PaletaTema[] = [
  {
    id: "verde",
    nombre: "Verde (paño)",
    fondo: "#0A1713",
    fondoTarjeta: "#12251D",
    acento: "#E8C77A",
    acentoTexto: "#0A1713",
    textoSuave: "#9EB6A8",
    textoFuerte: "#F5F3E9",
    error: "#ff8a80",
    borde: "#294036",
    pano: "#163B2D",
  },
  {
    id: "rojo",
    nombre: "Rojo",
    fondo: "#1D1016",
    fondoTarjeta: "#301B23",
    acento: "#E8C77A",
    acentoTexto: "#1D1016",
    textoSuave: "#C6A7B2",
    textoFuerte: "#F5F3E9",
    error: "#ffb199",
    borde: "#51303D",
    pano: "#4C2533",
  },
  {
    id: "negro",
    nombre: "Negro",
    fondo: "#101315",
    fondoTarjeta: "#1B2125",
    acento: "#E8C77A",
    acentoTexto: "#101315",
    textoSuave: "#ACB8BE",
    textoFuerte: "#F5F3E9",
    error: "#ff8a80",
    borde: "#333E45",
    pano: "#283740",
  },
];

export const TEMA_DEFECTO = TEMAS[0];

export function obtenerTema(id: string | null): PaletaTema {
  return TEMAS.find((t) => t.id === id) ?? TEMA_DEFECTO;
}
