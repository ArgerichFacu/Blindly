import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Pantalla, Texto, Boton } from "../../components/Controles";
import { Icono } from "../../components/Icono";
import { ResumenClub } from "../../components/ResumenClub";
import { FilaOpcion } from "../../components/FilaOpcion";
import { useClubes } from "../../lib/useClubes";
import { useTema } from "../../lib/TemaContext";
import { usePreferencias } from "../../lib/Preferencias";
import { usePlus } from "../../lib/PlusContext";
import { EntradaSuave } from "../../components/EntradaSuave";
export default function Menu() {
    const router = useRouter(), { t } = usePreferencias(), { tema } = useTema(), plus = usePlus();
    const clubes = useClubes(true), liga = clubes.datos?.ligas.find(l => l.id === clubes.datos?.elegida);
    return <Pantalla titulo="" volver={false} enTabs cabecera={false}>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 8 }}>
      <Texto style={{ fontSize: 32, lineHeight: 44, fontWeight: "900", letterSpacing: -1.4, paddingRight: 6, color: tema.acento }}>blindly.</Texto>
      {!plus.activo && <Pressable accessibilityRole="button" accessibilityLabel={t("Blindly Plus")} onPress={() => router.push("/plus")} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: tema.borde, borderRadius: 30, paddingHorizontal: 13, paddingVertical: 10, opacity: pressed ? .7 : 1 })}><Icono nombre="plus" color={tema.acento} size={15}/><Texto style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: tema.acento }}>PLUS</Texto></Pressable>}
    </View>
    <EntradaSuave><View style={{ paddingTop: 28, paddingBottom: 18, gap: 12 }}>
      <Texto suave style={{ fontSize: 10, letterSpacing: 2 }}>{t("POKER ENTRE AMIGOS")}</Texto>
      <Texto style={{ fontSize: 36, lineHeight: 43, fontWeight: "800", letterSpacing: -1 }}>{t("La mesa está lista.\nFaltan ustedes.")}</Texto>
      <Texto suave style={{ fontSize: 14, lineHeight: 22 }}>{t("Una noche. Tu grupo. Que empiece la partida.")}</Texto>
    </View></EntradaSuave>
    <Boton titulo={t("Crear partida")} onPress={() => router.push("/crear-sala")} style={{ borderRadius: 18, minHeight: 58 }}/>
    <FilaOpcion titulo={t("Unirme con código")} detalle={t("Entrá con el código o escaneá el QR.")} icono="compartir" onPress={() => router.push("/unirse")}/>
    <View style={{ paddingTop: 18, gap: 16 }}>
      <Texto suave style={{ fontSize: 11, letterSpacing: 1.5 }}>{t("TU NOCHE DE POKER")}</Texto>
      {liga && clubes.datos ? <ResumenClub liga={liga} detalle={clubes.datos.detalles[liga.id]} usuario={clubes.datos.usuario}/> : clubes.datos && !clubes.error ? <View style={{ paddingVertical: 18, gap: 10 }}><Texto style={{ fontSize: 23, fontWeight: "700" }}>{t("Todavía no tenés liga.")}</Texto><Texto suave>{t("Convertí las noches de poker en una competencia.")}</Texto><View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}><Boton titulo={t("+ Crear liga")} compacto secundario onPress={() => router.push("/liga-nueva")}/><Boton titulo={t("Unirme")} compacto secundario onPress={() => router.push("/liga-unirse")}/></View></View> : !clubes.error && <Texto suave>{t("Cargando…")}</Texto>}
      {!!clubes.error && <View style={{ gap: 8 }}><Texto suave>{t("No pudimos actualizar tus ligas.")}</Texto><Boton titulo={t("Reintentar")} compacto secundario onPress={clubes.recargar}/></View>}
    </View>
    <View style={{ marginTop: 8, paddingVertical: 10 }}><FilaOpcion titulo={t("¿Primera vez?")} detalle={t("Aprendé poker en minutos.")} icono="libro" onPress={() => router.push("/instrucciones")}/></View>
  </Pantalla>;
}
