import { Pressable, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Acabado } from "./Superficie";
import { RELIEVE, velo } from "../lib/visual";
import { Texto } from "./Controles";
import { Icono } from "./Icono";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { clasificacion } from "../lib/clasificacion";
import { claveUltimaLiga } from "../lib/useClubes";
import type { DetalleLiga, ResumenLiga } from "../lib/ligas";
export function ResumenClub({ liga, detalle, usuario }: {
    liga: ResumenLiga;
    detalle?: DetalleLiga;
    usuario: string;
}) {
    const router = useRouter(), { tema } = useTema(), { t, preferencias } = usePreferencias();
    const lider = detalle ? clasificacion(detalle.ranking, detalle.temporada?.estado).mvp : null;
    const yo = detalle?.ranking.find(f => f.user_id === usuario);
    const numero = (n: number) => n.toLocaleString(preferencias.idioma);
    return <Pressable accessibilityRole="button" accessibilityLabel={`${liga.nombre}, ${t("Ver liga")}`} onPress={() => {
            void AsyncStorage.setItem(claveUltimaLiga(usuario), liga.id).catch(() => { });
            router.push({ pathname: "/liga", params: { id: liga.id } });
        }} style={({ pressed }) => ({ backgroundColor: tema.fondoTarjeta, borderColor: velo(tema.acento, "30"), ...RELIEVE.panel, borderWidth: 1, borderRadius: 24, padding: 22, gap: 14, opacity: pressed ? .88 : 1, transform: [{ scale: pressed ? .99 : 1 }] })}>
    <Acabado material="pano"/><View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><Icono nombre="ligas" color={tema.acento}/><Texto style={{ flex: 1, fontSize: 20, fontWeight: "800" }}>{liga.nombre}</Texto><Icono nombre="flecha" color={tema.textoSuave} size={18}/></View>
    <Texto suave style={{ fontSize: 12 }}>{detalle?.temporada?.nombre ?? liga.temporada?.nombre ?? t("Sin temporada")} · {t("{n} miembros", { n: liga.miembros })}</Texto>
    {lider && <View style={{ gap: 5, padding: 16, borderRadius: 18, backgroundColor: velo(tema.fondo, "B8"), borderWidth: 1, borderColor: velo(tema.acento, "24") }}><Texto suave style={{ fontSize: 11, letterSpacing: 1 }}>{t("MVP")}</Texto><Texto style={{ fontSize: 24, fontWeight: "700", color: tema.acento }}>{lider.nombre}</Texto><Texto suave>{t("{p} pts", { p: numero(lider.puntos) })}</Texto></View>}
    {yo && <View style={{ borderTopWidth: 1, borderColor: tema.borde, paddingTop: 12, gap: 5 }}><Texto>{t("Tu temporada: #{n} · {p} pts", { n: yo.posicion, p: numero(yo.puntos) })}</Texto>{lider && lider.user_id !== usuario && <Texto suave>{t("A {n} pts del MVP", { n: numero(Math.max(0, lider.puntos - yo.puntos)) })}</Texto>}</View>}
    {detalle?.proxima_fecha && <Texto suave>{t("Próxima fecha")} · {new Date(detalle.proxima_fecha.cuando).toLocaleString(preferencias.idioma, { weekday: "short", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</Texto>}
    {detalle && !detalle.ranking.length && <Texto suave>{t("Una partida puede cambiar el líder.")}</Texto>}
  </Pressable>;
}
