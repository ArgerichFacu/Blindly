import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { Texto } from "./Controles";
import { Icono, type NombreIcono } from "./Icono";
import { useTema } from "../lib/TemaContext";
export function FilaOpcion({ titulo, detalle, onPress, icono, control }: {
    titulo: string;
    detalle?: string;
    onPress?: () => void;
    icono?: NombreIcono;
    control?: ReactNode;
}) {
    const { tema } = useTema();
    const contenido = <><View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>{icono && <Icono nombre={icono} color={tema.textoSuave}/>}<View style={{ flex: 1, gap: 3 }}><Texto style={{ fontSize: 15 }}>{titulo}</Texto>{detalle && <Texto suave style={{ fontSize: 12 }}>{detalle}</Texto>}</View></View>{control ?? <Icono nombre="flecha" color={tema.textoSuave} size={17}/>}</>;
    const estilo = { minHeight: 54, paddingVertical: 12, borderBottomWidth: 1, borderColor: tema.borde, flexDirection: "row" as const, alignItems: "center" as const, gap: 12 };
    return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={[titulo, detalle].filter(Boolean).join(", ")} onPress={onPress} style={({ pressed }) => [estilo, { opacity: pressed ? .65 : 1 }]}>{contenido}</Pressable> : <View style={estilo}>{contenido}</View>;
}
