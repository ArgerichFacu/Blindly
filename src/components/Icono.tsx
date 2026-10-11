import Svg, { Path } from "react-native-svg";
export type NombreIcono = "inicio" | "ligas" | "perfil" | "config" | "flecha" | "sumar" | "compartir" | "libro" | "plus" | "escudo" | "fichas" | "cartas" | "barajar" | "campana" | "aplauso" | "impacto" | "party" | "mesa" | "sorpresa" | "risa" | "bocina" | "trombon" | "bateria" | "pato" | "grillo" | "altavoz";
const trazos: Record<NombreIcono, string> = {
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
    cartas: "M7 4h13v17H7z M4 18L1 3l12-2 M11 11l3-4 3 4-3 4z",
    barajar: "M3 6h3c5 0 7 12 12 12h3 M18 15l3 3-3 3 M3 18h3c2 0 3-2 4-4 M14 9c1-2 2-3 4-3h3 M18 3l3 3-3 3",
    campana: "M5 17h14l-2-4V8a5 5 0 0 0-10 0v5z M10 21h4",
    aplauso: "M6 15V8l3 1V5l3 1V3l3 1v9l3-3 3 2-5 8H9z M2 5l2 2 M17 2l-1 2",
    impacto: "M12 3v6 M4 7l4 4 M20 7l-4 4 M3 15h5 M21 15h-5 M8 21l4-6 4 6",
    party: "M3 21l4-13 10 10z M13 3l2 3 M19 7l3-1 M17 12l4 1 M8 3v3",
    inicio: "M3 10l9-7 9 7v10H15v-6H9v6H3z",
    ligas: "M7 3h10v6a5 5 0 0 1-10 0V3z M7 5H3v3a4 4 0 0 0 4 4 M17 5h4v3a4 4 0 0 1-4 4 M12 14v6 M7 21h10",
    perfil: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M4 21v-2a8 8 0 0 1 16 0v2",
    config: "M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6",
    flecha: "M9 5l7 7-7 7", sumar: "M12 4v16 M4 12h16",
    compartir: "M12 16V3 M7 8l5-5 5 5 M5 13v8h14v-8",
    libro: "M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15",
    plus: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
};
export function Icono({ nombre, color, size = 22 }: {
    nombre: NombreIcono;
    color: string;
    size?: number;
}) {
    return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={true}><Path d={trazos[nombre]} stroke={color} strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" fill="none"/></Svg>;
}
