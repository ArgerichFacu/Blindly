// Tokens de color de Blindly (identidad "Marcador"). Única fuente de color de la app:
// ningún componente define colores propios. Los valores son los de assets/brand/tokens.json
// (verificados con scripts/brand/contraste.cjs); tests/tokens-marca.cjs comprueba que coincidan.
export type TemaId = "verde" | "rojo" | "negro" | "violeta";

export type PaletaTema = {
  id: TemaId;
  nombre: string;
  plus?: boolean;
  fondo: string;
  superficie: string;
  superficieElevada: string;
  borde: string;
  bordeControl: string;
  texto: string;
  textoSecundario: string;
  acento: string;
  acentoMesa: string;
  accionPrimaria: string;
  textoAccion: string;
  mesa: string;
  exito: string;
  error: string;
  // Nombres anteriores, derivados de los tokens nuevos (no agregar usos nuevos).
  fondoTarjeta: string;
  acentoTexto: string;
  textoSuave: string;
  textoFuerte: string;
  pano: string;
};

type Base = Omit<PaletaTema, "fondoTarjeta" | "acentoTexto" | "textoSuave" | "textoFuerte" | "pano">;

const tema = (t: Base): PaletaTema => ({
  ...t,
  fondoTarjeta: t.superficie,
  acentoTexto: t.textoAccion,
  textoSuave: t.textoSecundario,
  textoFuerte: t.texto,
  pano: t.mesa,
});

export const TEMAS: PaletaTema[] = [
  tema({
    id: "verde", nombre: "Verde",
    fondo: "#0E1512", superficie: "#17211C", superficieElevada: "#1F2B25", borde: "#2A3A32", bordeControl: "#6A7F73",
    texto: "#F2F0E8", textoSecundario: "#A3B0A8", acento: "#5BD08A", acentoMesa: "#5BD08A",
    accionPrimaria: "#F2F0E8", textoAccion: "#0E1512", mesa: "#1D4A3A", exito: "#5BD08A", error: "#FF7A6B",
  }),
  tema({
    id: "rojo", nombre: "Rojo", plus: true,
    fondo: "#170E10", superficie: "#22151A", superficieElevada: "#2D1C22", borde: "#452A33", bordeControl: "#8F6470",
    texto: "#F5EFEA", textoSecundario: "#C4AAB1", acento: "#F4A6BD", acentoMesa: "#F4A6BD",
    accionPrimaria: "#F5EFEA", textoAccion: "#170E10", mesa: "#55202F", exito: "#5BD08A", error: "#FF8A7A",
  }),
  tema({
    id: "negro", nombre: "Negro", plus: true,
    fondo: "#0C0D0E", superficie: "#16181A", superficieElevada: "#1F2225", borde: "#2E3236", bordeControl: "#6E757B",
    texto: "#F1F1EE", textoSecundario: "#A6ABB0", acento: "#9AD0FF", acentoMesa: "#9AD0FF",
    accionPrimaria: "#F1F1EE", textoAccion: "#0C0D0E", mesa: "#25323A", exito: "#5BD08A", error: "#FF7A6B",
  }),
  tema({
    id: "violeta", nombre: "Violeta realeza", plus: true,
    fondo: "#140C1F", superficie: "#1E1430", superficieElevada: "#2A1B42", borde: "#3A2757", bordeControl: "#8A63C7",
    texto: "#F3EEF9", textoSecundario: "#BCADD4", acento: "#A98BE0", acentoMesa: "#D4C2F2",
    accionPrimaria: "#F3EEF9", textoAccion: "#140C1F", mesa: "#6B3FA0", exito: "#6BD996", error: "#FF8A80",
  }),
];

// Colores de ficha: iguales en todos los temas; siempre acompañados del valor escrito.
export const FICHAS = {
  blanca: "#F4F3EF", roja: "#BF3A31", verde: "#2E9E6A", azul: "#3464C9", negra: "#23262B", amarilla: "#F2C230",
} as const;
export type ColorFicha = keyof typeof FICHAS;
// Tinta legible sobre cada ficha (≥ 4,5:1).
export const TINTA_FICHA: Record<ColorFicha, string> = {
  blanca: "#0E1512", roja: "#F2F0E8", verde: "#0E1512", azul: "#F2F0E8", negra: "#F2F0E8", amarilla: "#0E1512",
};

// Naipes: papel y tintas fijas (una carta es igual en cualquier tema).
export const NAIPE = { papel: "#F7F5EE", borde: "#C9C6BC", tinta: "#161614", rojo: "#B42A24", dorso: "#1D4A3A" } as const;

// Colores de identidad de club (los elige el owner; iguales en todos los temas).
export const COLORES_CLUB = { oro: "#D5B768", esmeralda: "#82CFAD", rubí: "#EB9CBA", zafiro: "#A9BDFC" } as const;

// Marcadores de rol en la mesa, con los colores de ficha: dealer blanco como el botón real.
export const COLORES_ROL: Record<"DR" | "BTN" | "SB" | "BB", { fondo: string; texto: string }> = {
  DR: { fondo: FICHAS.negra, texto: "#F2F0E8" },
  BTN: { fondo: FICHAS.blanca, texto: "#0E1512" },
  SB: { fondo: FICHAS.azul, texto: "#F2F0E8" },
  BB: { fondo: FICHAS.roja, texto: "#F2F0E8" },
};

// Velo detrás de hojas y modales.
export const VELO_MODAL = "#000000A6";

export const RADIOS = { chico: 4, control: 8, panel: 12, pildora: 999 } as const;
export const TACTIL_MINIMO = 48;

// mesas_habituales.tema_id sólo admite estos valores en la base (no se cambia el esquema).
export const TEMAS_MESA_HABITUAL: TemaId[] = ["verde", "rojo", "negro"];

export const TEMA_DEFECTO = TEMAS[0];

export function obtenerTema(id: string | null): PaletaTema {
  return TEMAS.find((t) => t.id === id) ?? TEMA_DEFECTO;
}
