import { View } from "react-native";
import { useRouter } from "expo-router";
import { Pantalla, Texto, Boton, Tarjeta } from "../../components/Controles";
import { ResumenClub } from "../../components/ResumenClub";
import { useClubes } from "../../lib/useClubes";
import { usePreferencias } from "../../lib/Preferencias";
export default function Ligas() {
    const router = useRouter(), { t, mensajeError } = usePreferencias(), clubes = useClubes();
    return <Pantalla titulo={t("Ligas")} subtitulo={t("Tu grupo. La próxima noche. La rivalidad.")} volver={false} enTabs>
    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", paddingBottom: 16 }}><Boton titulo={t("+ Crear liga")} compacto onPress={() => router.push("/liga-nueva")}/><Boton titulo={t("Unirme")} compacto secundario onPress={() => router.push("/liga-unirse")}/></View>
    {!!clubes.error && <View style={{ gap: 8 }}><Texto>{mensajeError(clubes.error)}</Texto><Boton titulo={t("Reintentar")} compacto secundario onPress={clubes.recargar}/></View>}
    {!clubes.datos && !clubes.error && <Texto suave>{t("Cargando…")}</Texto>}
    {clubes.datos?.ligas.length === 0 && <Tarjeta variante="hero" style={{ paddingVertical: 30, gap: 16 }}><Texto style={{ fontSize: 27, fontWeight: "700" }}>{t("Todavía no tenés liga.")}</Texto><Texto suave>{t("Convertí las noches de poker en una competencia.")}</Texto>{!clubes.datos.protegida && <Boton titulo={t("Proteger mi cuenta")} secundario onPress={() => router.push({ pathname: "/cuenta", params: { volver: "ligas" } })}/>}</Tarjeta>}
    {clubes.datos?.ligas.map(liga => <ResumenClub key={liga.id} liga={liga} detalle={clubes.datos?.detalles[liga.id]} usuario={clubes.datos!.usuario}/>)}
  </Pantalla>;
}
