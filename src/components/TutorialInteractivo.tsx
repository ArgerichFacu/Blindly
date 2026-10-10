import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Platform, View } from "react-native";
import { Boton, Etiqueta, Tarjeta, Texto } from "./Controles";
import { CartaPoker } from "./CartaPoker";
import { EntradaSuave } from "./EntradaSuave";
import { Icono } from "./Icono";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { vibrarToque } from "../lib/hapticos";
import { SALON, velo } from "../lib/visual";

function MesaDemo({ igualada = false }: { igualada?: boolean }) {
  const { tema } = useTema(), { t } = usePreferencias();
  const [movimiento] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let vivo = true;
    if (igualada) void AccessibilityInfo.isReduceMotionEnabled().then(reducir => {
      if (!vivo) return;
      if (reducir) movimiento.setValue(1);
      else Animated.timing(movimiento, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== "web" }).start();
    }).catch(() => movimiento.setValue(1));
    return () => { vivo = false; movimiento.stopAnimation(); };
  }, [igualada, movimiento]);
  return <View style={{ minHeight: 245, justifyContent: "center", alignItems: "center", marginVertical: 8 }}>
    <View style={{ position: "absolute", left: 10, right: 10, top: 32, bottom: 25, borderRadius: 95, backgroundColor: tema.pano, borderWidth: 6, borderColor: SALON.surface, boxShadow: "inset 0 2px 12px #0005, 0 8px 18px #0004" }}/>
    <View style={{ position: "absolute", top: 0, alignItems: "center", padding: 10, borderRadius: 18, borderWidth: 1, borderColor: tema.acento, backgroundColor: tema.fondoTarjeta, minWidth: 104 }}><Texto style={{ fontWeight: "800" }}>{t("Vos")} · SB</Texto><Texto style={{ color: tema.acento }}>{igualada ? "9.800" : "10.000"}</Texto><Texto suave style={{ fontSize: 11 }}>{t(igualada ? "Apuesta igualada" : "Te toca.")}</Texto></View>
    <View style={{ alignItems: "center", paddingTop: 5 }}><Texto suave style={{ fontSize: 11 }}>{t("Pozo")}</Texto><Texto accessibilityLiveRegion="polite" style={{ fontSize: 30, fontWeight: "800", color: tema.acento }}>{igualada ? "1.700" : "1.500"}</Texto>{igualada && <Texto style={{ color: tema.acento }}>+200</Texto>}</View>
    {[["Facu", "9.500", "DR · BTN"], ["Tomi", "8.200", "BB"]].map(([nombre, stack, rol], i) => <View key={nombre} style={{ position: "absolute", bottom: 0, [i ? "right" : "left"]: 0, alignItems: "center", padding: 10, backgroundColor: tema.fondoTarjeta, borderRadius: 16, borderWidth: 1, borderColor: tema.borde }}><Texto style={{ fontWeight: "700" }}>{nombre}</Texto><Texto suave>{stack}</Texto><Texto style={{ fontSize: 10, color: tema.acento }}>{rol}</Texto></View>)}
    {igualada && <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", top: 82, opacity: movimiento.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: movimiento.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) }] }}><Icono nombre="fichas" color={tema.acento} size={28}/></Animated.View>}
  </View>;
}
function AccionDemo({ avanzar, ocupado }: { avanzar: () => void; ocupado: boolean }) {
  const { t, preferencias } = usePreferencias();
  const [igualada, setIgualada] = useState(false), [pista, setPista] = useState(false);
  return <>
    <MesaDemo igualada={igualada}/>
    <Texto suave style={{ textAlign: "center" }}>{t(igualada ? "Listo. El pozo creció y tus fichas bajaron." : "Probá igualar la apuesta.")}</Texto>
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Boton titulo={t("Retirarme")} compacto secundario style={{ flex: 1, paddingHorizontal: 3 }} disabled={igualada || ocupado} onPress={() => setPista(true)}/>
      <Boton titulo={t("Igualar 200")} compacto style={{ flex: 1, paddingHorizontal: 3 }} disabled={igualada || ocupado} onPress={() => { setIgualada(true); void vibrarToque(preferencias.hapticos); }}/>
      <Boton titulo={t("Subir")} compacto secundario style={{ flex: 1, paddingHorizontal: 3 }} disabled={igualada || ocupado} onPress={() => setPista(true)}/>
    </View>
    {pista && !igualada && <Texto suave accessibilityLiveRegion="polite">{t("En esta práctica, tocá Igualar 200.")}</Texto>}
    <Texto suave style={{ fontSize: 11 }}>{t("Solo práctica. No cambia tus partidas.")}</Texto>
    <Boton titulo={t("Siguiente")} disabled={!igualada || ocupado} onPress={avanzar}/>
  </>;
}
export function PasosTutorial({ paso, ocupado = false, error = false, avanzar, retroceder, terminar }: { paso: 0 | 1 | 2 | 3; ocupado?: boolean; error?: boolean; avanzar: () => void; retroceder: () => void; terminar: () => void }) {
  const { t } = usePreferencias(), { tema } = useTema();
  const titulos = ["Las cartas siguen en la mesa.", "Tu mesa, de un vistazo.", "Te toca.", "Una noche puede cambiar el MVP."];
  return <>
    <View accessibilityRole="progressbar" accessibilityLabel={t("Paso {n} de 4", { n: paso + 1 })} accessibilityValue={{ min: 0, max: 4, now: paso + 1 }} style={{ gap: 8 }}><Texto suave>{t("Paso {n} de 4", { n: paso + 1 })}</Texto><View style={{ flexDirection: "row", gap: 8 }}>{[0, 1, 2, 3].map(n => <View key={n} style={{ height: 4, flex: 1, borderRadius: 4, backgroundColor: n <= paso ? tema.acento : tema.borde }}/>)}</View></View>
    <EntradaSuave key={paso}><Tarjeta variante="hero" style={{ gap: 14 }}>
      <Etiqueta>{t(paso === 2 ? "SIMULACIÓN" : "POKER ENTRE AMIGOS")}</Etiqueta>
      <Texto style={{ fontSize: 28, fontWeight: "800" }}>{t(titulos[paso])}</Texto>
      {paso === 0 && <><View style={{ flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 22 }}><View style={{ width: 68, height: 100, transform: [{ rotate: "-8deg" }] }}><CartaPoker valor="A" palo="♠"/></View><View style={{ width: 68, height: 100, transform: [{ rotate: "8deg" }] }}><CartaPoker valor="K" palo="♥"/></View></View><Texto suave>{t("Blindly lleva el resto.")}</Texto></>}
      {paso === 1 && <><MesaDemo/><Texto suave>{t("Stacks, ciegas, turnos y pozos. Cada uno juega desde su celular.")}</Texto><Texto suave style={{ fontSize: 12 }}>{t("El dealer reparte las cartas y entrega el pozo al ganador.")}</Texto></>}
      {paso === 2 && <AccionDemo avanzar={avanzar} ocupado={ocupado}/>}
      {paso === 3 && <><View style={{ padding: 16, backgroundColor: velo(tema.fondo, "B8"), borderRadius: 18, gap: 14 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icono nombre="escudo" color={tema.acento}/><Texto style={{ fontWeight: "800" }}>{t("Tu grupo")}</Texto></View><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Texto style={{ color: tema.acento }}>MVP · Nacho</Texto><Texto>1.240</Texto></View><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Texto>#2 · Facu</Texto><Texto>1.180</Texto></View><EntradaSuave><Texto style={{ color: tema.acento }}>+60 pts</Texto></EntradaSuave></View><Texto suave>{t("La próxima queda en ustedes.")}</Texto><Texto suave style={{ fontSize: 11 }}>{t("Ejemplo de ranking. Tus puntos dependen de cada partida.")}</Texto></>}
    </Tarjeta></EntradaSuave>
    {error && <Texto>{t("No se pudo guardar tu progreso. Probá otra vez.")}</Texto>}
    {paso !== 2 && <Boton titulo={t(ocupado ? "Guardando…" : paso === 0 ? "Entendido" : paso === 3 ? "Entrar a Blindly" : "Siguiente")} disabled={ocupado} onPress={avanzar}/>}
    {paso > 0 && <Boton titulo={t("Paso anterior")} secundario disabled={ocupado} onPress={retroceder}/>}
    <Boton titulo={t("Omitir tutorial")} secundario disabled={ocupado} onPress={terminar}/>
  </>;
}
