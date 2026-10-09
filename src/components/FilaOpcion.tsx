import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { velo } from "../lib/visual";
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
    const contenido = <><View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>{icono && <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: velo(tema.acento, "0D"), borderWidth: 1, borderColor: velo(tema.acento, "15") }}><Icono nombre={icono} color={tema.acento} size={19}/></View>}<View style={{ flex: 1, gap: 3 }}><Texto style={{ fontSize: 15 }}>{titulo}</Texto>{detalle && <Texto suave style={{ fontSize: 12 }}>{detalle}</Texto>}</View></View>{control ?? <Icono nombre="flecha" color={tema.textoSuave} size={17}/>}</>;
    const estilo = { minHeight: 60, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 16, flexDirection: "row" as const, alignItems: "center" as const, gap: 12 };
    return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={[titulo, detalle].filter(Boolean).join(", ")} onPress={onPress} style={({ pressed }) => [estilo, { backgroundColor: pressed ? velo(tema.acento, "0C") : "transparent", opacity: pressed ? .85 : 1, transform: [{ scale: pressed ? .99 : 1 }] }]}>{contenido}</Pressable> : <View style={estilo}>{contenido}</View>;
}
