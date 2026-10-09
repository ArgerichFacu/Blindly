import Svg, { Path } from "react-native-svg";
export type NombreIcono = "inicio" | "ligas" | "perfil" | "config" | "flecha" | "sumar" | "compartir" | "libro" | "plus";
const trazos: Record<NombreIcono, string> = {
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
