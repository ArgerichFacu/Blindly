import { useState } from "react";
import { useRouter } from "expo-router";
import { Switch, View } from "react-native";
import { Pantalla, Texto, Boton } from "../../components/Controles";
import { Superficie } from "../../components/Superficie";
import { FilaOpcion } from "../../components/FilaOpcion";
import { usePreferencias } from "../../lib/Preferencias";
import { useTema } from "../../lib/TemaContext";
import { TEMAS } from "../../lib/temas";
import { capacidadesPlus } from "../../lib/capacidadesPlus";
import { usePlus } from "../../lib/PlusContext";
export default function Opciones() {
    const router = useRouter(), { t, preferencias, cambiar } = usePreferencias(), { tema, elegirTema } = useTema(), plus = usePlus();
    const [selector, setSelector] = useState<"idioma" | "tema" | null>(null);
    const etiqueta = (titulo: string) => <Texto suave style={{ fontSize: 11, letterSpacing: 1.5, marginTop: 20, marginBottom: 4 }}>{titulo}</Texto>;
    return <Pantalla titulo={t("Config")} volver={false} enTabs>
    {etiqueta(t("CUENTA"))}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Mi cuenta")} icono="perfil" onPress={() => router.push("/cuenta")}/>
    <FilaOpcion titulo={t("Idioma")} detalle={preferencias.idioma === "es" ? "Español" : preferencias.idioma === "en" ? "English" : "Português"} onPress={() => setSelector(selector === "idioma" ? null : "idioma")}/>
    {selector === "idioma" && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(["es", "en", "pt"] as const).map(idioma => <Boton key={idioma} titulo={idioma === "es" ? "Español" : idioma === "en" ? "English" : "Português"} compacto secundario={idioma !== preferencias.idioma} onPress={() => { cambiar({ idioma }); setSelector(null); }}/>)}</View>}
    <FilaOpcion titulo={t("Clubes y notificaciones")} detalle={t("Preferencias por liga")} onPress={() => router.push("/ligas")}/>
    </Superficie>{etiqueta(t("EXPERIENCIA"))}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Tema")} detalle={t(tema.nombre)} onPress={() => setSelector(selector === "tema" ? null : "tema")}/>
    {selector === "tema" && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{TEMAS.map(paleta => <Boton key={paleta.id} titulo={`${t(paleta.nombre)}${paleta.plus ? " · Plus" : ""}`} compacto secundario={tema.id !== paleta.id} onPress={() => { if (paleta.plus && !capacidadesPlus(plus).personalizar)
        router.push("/plus");
    else
        elegirTema(paleta.id); setSelector(null); }}/>)}</View>}
    <FilaOpcion titulo={t("Sonidos y ambiente")} onPress={() => router.push("/sonidos")}/>
    <FilaOpcion titulo={t("Modo principiante")} control={<Switch accessibilityLabel={t("Modo principiante")} value={preferencias.principiante} onValueChange={principiante => cambiar({ principiante })} trackColor={{ true: tema.acento }}/>}/>
    <FilaOpcion titulo={t("Vibraciones de momentos importantes")} control={<Switch accessibilityLabel={t("Vibraciones de momentos importantes")} value={preferencias.hapticos} onValueChange={hapticos => cambiar({ hapticos })} trackColor={{ true: tema.acento }}/>}/>
    </Superficie>{etiqueta(t("APRENDER"))}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Aprender póker")} icono="libro" onPress={() => router.push("/instrucciones")}/>
    <FilaOpcion titulo={t("Guía rápida")} onPress={() => router.push("/tutorial")}/>
    <FilaOpcion titulo={t("Combinaciones de poker")} onPress={() => router.push("/combinaciones")}/>
    </Superficie>{etiqueta("BLINDLY")}<Superficie variante="suave" style={{ padding: 4, gap: 0 }}>
    <FilaOpcion titulo={t("Blindly Plus")} icono="plus" onPress={() => router.push("/plus")}/>
    <FilaOpcion titulo={t("Créditos de música")} onPress={() => router.push("/creditos")}/>
    <FilaOpcion titulo={t("Política de privacidad")} onPress={() => router.push("/privacidad")}/>
    <FilaOpcion titulo={t("Términos y condiciones")} onPress={() => router.push("/terminos")}/>
  </Superficie></Pantalla>;
}
