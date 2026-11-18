import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Pantalla, Texto, Boton } from "../../components/Controles";
import { Icono } from "../../components/Icono";
import { ResumenClub } from "../../components/ResumenClub";
import { FilaOpcion } from "../../components/FilaOpcion";
import { LogoBlindly } from "../../components/LogoBlindly";
import { useClubes } from "../../lib/useClubes";
import { useTema } from "../../lib/TemaContext";
import { usePreferencias } from "../../lib/Preferencias";
import { usePlus } from "../../lib/PlusContext";
import { Superficie } from "../../components/Superficie";
import { EntradaSuave } from "../../components/EntradaSuave";

// Home "Marcador": las dos acciones de la noche arriba (crear o unirse) y después los clubes reales.
export default function Menu() {
  const router = useRouter(), { t } = usePreferencias(), { tema } = useTema(), plus = usePlus();
  const clubes = useClubes(true), liga = clubes.datos?.ligas.find(l => l.id === clubes.datos?.elegida);
  return <Pantalla titulo="" volver={false} enTabs cabecera={false}>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 8, minHeight: 48 }}>
      <View style={{ alignItems: "flex-start" }}><LogoBlindly ancho={112} /></View>
      {!plus.activo && <Pressable accessibilityRole="button" accessibilityLabel={t("Blindly Plus")} onPress={() => router.push("/plus")} hitSlop={4}
        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 40, borderWidth: 1, borderColor: tema.bordeControl, borderRadius: 8, paddingHorizontal: 12, opacity: pressed ? .7 : 1 })}>
        <Icono nombre="plus" color={tema.acento} size={18}/><Texto style={{ fontSize: 15, fontWeight: "600" }}>Plus</Texto>
      </Pressable>}
    </View>
    <EntradaSuave><View style={{ gap: 12, marginTop: 8 }}>
      <Texto style={{ fontSize: 30, lineHeight: 36, fontWeight: "700" }}>{t("Armá la partida o sumate a una")}</Texto>
      <Texto suave style={{ fontSize: 16, lineHeight: 24 }}>{t("Todos ven el mismo reloj, las mismas ciegas y los mismos stacks.")}</Texto>
      <Boton titulo={t("Crear partida")} icono="sumar" onPress={() => router.push("/crear-sala")} style={{ minHeight: 56, marginTop: 4 }}/>
      <Superficie variante="suave" style={{ padding: 0 }}>
        <FilaOpcion titulo={t("Unirme con código")} detalle={t("Escribí el código de la sala o escaneá su QR.")} icono="qr" onPress={() => router.push("/unirse")}/>
      </Superficie>
    </View></EntradaSuave>
    <View style={{ paddingTop: 16, gap: 12 }}>
      <Texto style={{ fontSize: 20, fontWeight: "700" }}>{t("Tus clubes")}</Texto>
      {liga && clubes.datos ? <ResumenClub liga={liga} detalle={clubes.datos.detalles[liga.id]} usuario={clubes.datos.usuario}/>
        : clubes.datos && !clubes.error ? <Superficie style={{ gap: 12 }}>
          <Texto style={{ fontSize: 18, fontWeight: "600" }}>{t("Todavía no tenés liga.")}</Texto>
          <Texto suave>{t("Un club guarda los resultados de cada noche y arma el ranking de la temporada.")}</Texto>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Boton titulo={t("Crear liga")} icono="sumar" compacto secundario onPress={() => router.push("/liga-nueva")}/>
            <Boton titulo={t("Unirme a una liga")} compacto secundario onPress={() => router.push("/liga-unirse")}/>
          </View>
        </Superficie> : !clubes.error && <Texto suave>{t("Cargando…")}</Texto>}
      {!!clubes.error && <View style={{ gap: 8 }}><Texto suave>{t("No pudimos actualizar tus ligas.")}</Texto><Boton titulo={t("Reintentar")} compacto secundario onPress={clubes.recargar}/></View>}
    </View>
    <Superficie variante="suave" style={{ marginTop: 4, padding: 0 }}><FilaOpcion titulo={t("¿Primera vez?")} detalle={t("Aprendé poker en minutos.")} icono="libro" onPress={() => router.push("/instrucciones")}/></Superficie>
  </Pantalla>;
}
