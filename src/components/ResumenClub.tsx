import { Pressable, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Texto } from "./Controles";
import { Icono } from "./Icono";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { clasificacion } from "../lib/clasificacion";
import { claveUltimaLiga } from "../lib/useClubes";
import type { DetalleLiga, ResumenLiga } from "../lib/ligas";
import { formatoNumero } from "../lib/numeros";
export function ResumenClub({ liga, detalle, usuario }: {
    liga: ResumenLiga;
    detalle?: DetalleLiga;
    usuario: string;
}) {
    const router = useRouter(), { tema } = useTema(), { t, preferencias } = usePreferencias();
    const lider = detalle ? clasificacion(detalle.ranking, detalle.temporada?.estado).mvp : null;
    const yo = detalle?.ranking.find(f => f.user_id === usuario);
    const numero = (n: number) => formatoNumero(n, preferencias.idioma);
    return <Pressable accessibilityRole="button" accessibilityLabel={`${liga.nombre}, ${t("Ver liga")}`} onPress={() => {
            void AsyncStorage.setItem(claveUltimaLiga(usuario), liga.id).catch(() => { });
            router.push({ pathname: "/liga", params: { id: liga.id } });
        }} style={({ pressed }) => ({ backgroundColor: tema.superficie, borderColor: tema.borde, borderWidth: 1, borderRadius: 12, padding: 16, gap: 12, opacity: pressed ? .8 : 1 })}>
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><View style={{ padding: 10, borderRadius: 8, backgroundColor: tema.superficieElevada }}><Icono nombre="escudo" color={tema.acento} size={24}/></View><Texto style={{ flex: 1, fontSize: 22, fontWeight: "700" }}>{liga.nombre}</Texto><Icono nombre="flecha" color={tema.textoSuave} size={18}/></View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}><View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: tema.bordeControl }}><Texto style={{ fontSize: 13, color: tema.textoSecundario }}>{detalle?.temporada?.nombre ?? liga.temporada?.nombre ?? t("Sin temporada")}</Texto></View><Texto suave style={{ fontSize: 14 }}>{t(liga.miembros === 1 ? "1 miembro" : "{n} miembros", { n: liga.miembros })}</Texto></View>
    {lider && <View style={{ gap: 2, padding: 12, borderRadius: 8, backgroundColor: tema.superficieElevada }}><Texto suave style={{ fontSize: 13 }}>{t("MVP")}</Texto><Texto style={{ fontSize: 24, fontWeight: "700" }}>{lider.nombre}</Texto><Texto suave>{t("{p} pts", { p: numero(lider.puntos) })}</Texto></View>}
    {yo && <View style={{ borderTopWidth: 1, borderColor: tema.borde, paddingTop: 12, gap: 5 }}><Texto>{t("Tu temporada: #{n} · {p} pts", { n: yo.posicion, p: numero(yo.puntos) })}</Texto>{lider && lider.user_id !== usuario && <Texto suave>{t("A {n} pts del MVP", { n: numero(Math.max(0, lider.puntos - yo.puntos)) })}</Texto>}</View>}
    {detalle?.proxima_fecha && <Texto suave>{t("Próxima fecha")} · {new Date(detalle.proxima_fecha.cuando).toLocaleString(preferencias.idioma, { weekday: "short", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</Texto>}
    {detalle && !detalle.ranking.length && <Texto suave>{t("Una partida puede cambiar el líder.")}</Texto>}
  </Pressable>;
}
