import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Switch, View } from "react-native";
import { Icono } from "./Icono";
import { Pantalla, Texto, Boton } from "./Controles";
import { Superficie } from "./Superficie";
import { FilaOpcion } from "./FilaOpcion";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { TEMAS } from "../lib/temas";
import { capacidadesPlus } from "../lib/capacidadesPlus";
import { usePlus } from "../lib/PlusContext";
import { usePrivacidadAnunciosRequerida } from "../lib/privacidadAnuncios";
export default function OpcionesApp({ enTabs = false }: { enTabs?: boolean }) {
    const router = useRouter(), { t, preferencias, cambiar } = usePreferencias(), { tema, elegirTema } = useTema(), plus = usePlus();
    const privacidadAnuncios = usePrivacidadAnunciosRequerida();
    const [selector, setSelector] = useState<"idioma" | "tema" | null>(null);
    const etiqueta = (titulo: string) => <Texto suave style={{ fontSize: 14, fontWeight: "600", marginTop: 20, marginBottom: 4 }}>{titulo}</Texto>;
    return <Pantalla titulo={t("Config")} volver={!enTabs} enTabs={enTabs}>
    {etiqueta(t("Cuenta"))}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Mi cuenta")} onPress={() => router.push("/cuenta")}/>
    <FilaOpcion titulo={t("Idioma")} detalle={preferencias.idioma === "es" ? "Español" : preferencias.idioma === "en" ? "English" : "Português"} onPress={() => setSelector(selector === "idioma" ? null : "idioma")}/>
    {selector === "idioma" && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(["es", "en", "pt"] as const).map(idioma => <Boton key={idioma} titulo={idioma === "es" ? "Español" : idioma === "en" ? "English" : "Português"} compacto secundario={idioma !== preferencias.idioma} onPress={() => { cambiar({ idioma }); setSelector(null); }}/>)}</View>}
    <FilaOpcion titulo={t("Clubes y notificaciones")} detalle={t("Preferencias por liga")} onPress={() => router.push("/ligas")}/>
    </Superficie>{etiqueta(t("Experiencia"))}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Tema")} detalle={t(tema.nombre)} onPress={() => setSelector(selector === "tema" ? null : "tema")}/>
    {selector === "tema" && <View accessibilityRole="radiogroup" style={{ gap: 0 }}>{TEMAS.map(paleta => {
        const bloqueado = !!paleta.plus && !capacidadesPlus(plus).personalizar, elegido = tema.id === paleta.id;
        return <Pressable key={paleta.id} accessibilityRole="radio" accessibilityState={{ checked: elegido }}
          accessibilityLabel={`${t(paleta.nombre)}${bloqueado ? `. ${t("Requiere Plus")}` : ""}`}
          onPress={() => { if (bloqueado) router.push("/plus"); else { elegirTema(paleta.id); setSelector(null); } }}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingHorizontal: 12, borderTopWidth: 1, borderColor: tema.borde, opacity: pressed ? .7 : 1 })}>
          <View style={{ flexDirection: "row", borderRadius: 4, overflow: "hidden", borderWidth: 1, borderColor: tema.bordeControl }}>
            {[paleta.fondo, paleta.mesa, paleta.acento].map((c, i) => <View key={i} style={{ width: 14, height: 28, backgroundColor: c }} />)}
          </View>
          <Texto style={{ flex: 1, fontSize: 16 }}>{t(paleta.nombre)}</Texto>
          {bloqueado ? <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icono nombre="candado" color={tema.textoSecundario} size={18} /><Texto suave style={{ fontSize: 14, fontWeight: "600" }}>Plus</Texto></View>
            : elegido ? <Icono nombre="check" color={tema.acento} size={22} /> : null}
        </Pressable>;
      })}</View>}
    <FilaOpcion titulo={t("Sonidos y ambiente")} onPress={() => router.push("/sonidos")}/>
    <FilaOpcion titulo={t("Modo principiante")} control={<Switch accessibilityLabel={t("Modo principiante")} value={preferencias.principiante} onValueChange={principiante => cambiar({ principiante })} trackColor={{ false: tema.bordeControl, true: tema.acento }} thumbColor={tema.texto}/>}/>
    <FilaOpcion titulo={t("Vibraciones de momentos importantes")} control={<Switch accessibilityLabel={t("Vibraciones de momentos importantes")} value={preferencias.hapticos} onValueChange={hapticos => cambiar({ hapticos })} trackColor={{ false: tema.bordeControl, true: tema.acento }} thumbColor={tema.texto}/>}/>
    </Superficie>{etiqueta(t("Aprender"))}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Aprender poker")} onPress={() => router.push("/instrucciones")}/>
    <FilaOpcion titulo={t("Guía rápida")} onPress={() => router.push("/tutorial")}/>
    <FilaOpcion titulo={t("Combinaciones de poker")} onPress={() => router.push("/combinaciones")}/>
    </Superficie>{etiqueta("Blindly")}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Blindly Plus")} onPress={() => router.push("/plus")}/>
    <FilaOpcion titulo={t("Créditos de música")} onPress={() => router.push("/creditos")}/>
    <FilaOpcion titulo={t("Política de privacidad")} onPress={() => router.push("/privacidad")}/>
    {privacidadAnuncios && <FilaOpcion titulo={t("Privacidad de anuncios")} onPress={() => void import("../lib/consentimientoAds").then(m => m.abrirOpcionesPrivacidadAnuncios()).catch(() => {})}/>}
    <FilaOpcion titulo={t("Términos y condiciones")} onPress={() => router.push("/terminos")}/>
  </Superficie></Pantalla>;
}
