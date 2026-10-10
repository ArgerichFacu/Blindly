import Svg, { Path } from "react-native-svg";
export type NombreIcono = "inicio" | "ligas" | "perfil" | "config" | "flecha" | "sumar" | "compartir" | "libro" | "plus" | "escudo" | "fichas" | "cartas" | "barajar" | "campana" | "aplauso" | "impacto" | "party";
const trazos: Record<NombreIcono, string> = {
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
