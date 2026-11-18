import Svg, { Circle, Path } from "react-native-svg";

// Un solo set de íconos: grilla de 24, trazo 2, extremos redondeados (estilo Lucide).
// Dibujos propios de Blindly; ver docs/brand/BRAND.md.
export type NombreIcono =
  | "corazon" | "inicio" | "ligas" | "perfil" | "config" | "flecha" | "volver" | "sumar" | "compartir" | "libro"
  | "plus" | "escudo" | "fichas" | "cartas" | "barajar" | "campana" | "aplauso" | "impacto" | "party" | "mesa"
  | "sorpresa" | "risa" | "bocina" | "trombon" | "bateria" | "pato" | "grillo" | "altavoz" | "check" | "qr"
  | "candado" | "reloj" | "rayo" | "capas" | "lista" | "historial" | "estadisticas" | "paleta" | "cerrar"
  | "grupo" | "editar" | "pausa" | "play";

const trazos: Record<NombreIcono, string> = {
  corazon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
  mesa: "M3 12h18 M5 12v9 M19 12v9 M12 2v5 M8 5l4 4 4-4",
  sorpresa: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M8 8v1 M16 8v1 M14 15a2 3 0 1 1-4 0 2 3 0 0 1 4 0",
  risa: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M6 9l2-2 2 2 M14 9l2-2 2 2 M7 13h10a5 5 0 0 1-10 0z",
  bocina: "M3 9h5l9-5v16l-9-5H3z M8 15v6H5v-6 M21 8v8",
  trombon: "M3 5h9v4H5a3 3 0 0 0 0 6h10 M12 5v4 M15 12l6-3v9l-6-3z",
  bateria: "M4 12a8 3 0 1 0 16 0 8 3 0 1 0-16 0 M4 12v7a8 3 0 0 0 16 0v-7 M8 15v6 M16 15v6 M6 2l7 6 M18 2l-7 6",
  pato: "M4 14c-3 6 10 9 14 3l-1-6 4-2-5-2a4 4 0 0 0-7 3l1 4z M13 7h.1",
  grillo: "M8 13l8-3 3 6-8 3z M8 13L5 7 2 6 M11 19l-4 3 M16 18l4 3 M15 10l-2-5 M6 11l-3 4",
  altavoz: "M3 9h4l5-5v16l-5-5H3z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14",
  escudo: "M12 3l8 3v7c0 5-8 9-8 9S4 18 4 13V6z M9 12l2 2 4-4",
  fichas: "M3 7a9 4 0 1 0 18 0 9 4 0 1 0-18 0 M3 7v5a9 4 0 0 0 18 0V7 M3 12v5a9 4 0 0 0 18 0v-5",
  cartas: "M8 4h12v17H8z M5 18L2 4l11-2 M14 9.5l2 3-2 3-2-3z",
  barajar: "M3 6h3c5 0 7 12 12 12h3 M18 15l3 3-3 3 M3 18h3c2 0 3-2 4-4 M14 9c1-2 2-3 4-3h3 M18 3l3 3-3 3",
  campana: "M5 17h14l-2-4V8a5 5 0 0 0-10 0v5z M10 21h4",
  aplauso: "M6 15V8l3 1V5l3 1V3l3 1v9l3-3 3 2-5 8H9z M2 5l2 2 M17 2l-1 2",
  impacto: "M12 3v6 M4 7l4 4 M20 7l-4 4 M3 15h5 M21 15h-5 M8 21l4-6 4 6",
  party: "M3 21l4-13 10 10z M13 3l2 3 M19 7l3-1 M17 12l4 1 M8 3v3",
  inicio: "M3 10l9-7 9 7v10h-6v-6H9v6H3z",
  ligas: "M7 3h10v6a5 5 0 0 1-10 0V3z M7 5H3v3a4 4 0 0 0 4 4 M17 5h4v3a4 4 0 0 1-4 4 M12 14v6 M7 21h10",
  perfil: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M4 21v-2a8 8 0 0 1 16 0v2",
  config: "M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6",
  flecha: "M9 5l7 7-7 7",
  volver: "M15 5l-7 7 7 7",
  sumar: "M12 4v16 M4 12h16",
  compartir: "M12 16V3 M7 8l5-5 5 5 M5 13v8h14v-8",
  libro: "M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15",
  plus: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 8v8 M8 12h8",
  check: "M20 6L9 17l-5-5",
  qr: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v1 M17 20h4v-3 M14 20h1",
  candado: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
  reloj: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2",
  rayo: "M13 2L4 14h7l-1 8 9-12h-7z",
  capas: "M12 3L2 8l10 5 10-5z M2 13l10 5 10-5 M2 18l10 5 10-5",
  lista: "M9 6h12 M9 12h12 M9 18h12 M4 6h1 M4 12h1 M4 18h1",
  historial: "M3 12a9 9 0 1 0 2.6-6.4L3 8 M3 3v5h5 M12 7v5l3 2",
  estadisticas: "M3 3v18h18 M8 16v-3 M13 16V9 M18 16V6",
  paleta: "M12 3a9 9 0 0 0 0 18c1 0 1.6-.7 1.6-1.6 0-1.3-1.2-1.7-1.2-2.9 0-.9.7-1.5 1.7-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z M7.5 11h.01 M10 7h.01 M15 7h.01",
  cerrar: "M18 6L6 18 M6 6l12 12",
  grupo: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  editar: "M4 20h4L19 9l-4-4L4 16z M14 6l4 4",
  pausa: "M8 5v14 M16 5v14",
  play: "M7 4l13 8-13 8z",
};

export function Icono({ nombre, color, size = 22, relleno = false }: {
  nombre: NombreIcono;
  color: string;
  size?: number;
  relleno?: boolean;
}) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={true}>
    <Path d={trazos[nombre]} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill={relleno ? color : "none"}/>
  </Svg>;
}

// Palos de cartas: dibujo propio y relleno (assets/brand/palos.svg). Acepta el carácter del palo
// porque así se guardan las cartas en los datos; nunca se muestra el carácter como texto.
export type CaracterPalo = "♠" | "♥" | "♦" | "♣";
export const PALO_ROJO: Record<CaracterPalo, boolean> = { "♠": false, "♥": true, "♦": true, "♣": false };
export function Palo({ palo, color, size = 16 }: { palo: CaracterPalo; color: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={true}>
    {palo === "♠" && <Path fill={color} d="M12 2.5C8.2 6.9 3.5 9.8 3.5 14a4.3 4.3 0 0 0 7.4 3c-.3 1.7-1 3-2.2 4.5h6.6c-1.2-1.5-1.9-2.8-2.2-4.5a4.3 4.3 0 0 0 7.4-3c0-4.2-4.7-7.1-8.5-11.5z"/>}
    {palo === "♥" && <Path fill={color} d="M12 20.5C6.2 16.3 2.5 12.9 2.5 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 9.5 2.4c0 4.2-3.7 7.6-9.5 11.8z"/>}
    {palo === "♦" && <Path fill={color} d="M12 2.5 19.5 12 12 21.5 4.5 12z"/>}
    {palo === "♣" && <>
      <Circle cx={12} cy={7.2} r={4.2} fill={color}/><Circle cx={7} cy={13.4} r={4.2} fill={color}/><Circle cx={17} cy={13.4} r={4.2} fill={color}/>
      <Path fill={color} d="M10.8 13.5h2.4c.3 3.1 1 5.3 2.6 8H8.2c1.6-2.7 2.3-4.9 2.6-8z"/>
    </>}
  </Svg>;
}
