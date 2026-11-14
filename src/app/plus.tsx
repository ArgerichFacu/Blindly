import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { Superficie } from "../components/Superficie";
import { Icono } from "../components/Icono";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { usePlus } from "../lib/PlusContext";
import { BENEFICIOS_PLUS } from "../lib/plus";

export default function Plus() {
  const { t, mensajeError } = usePreferencias(), { tema } = useTema(), plus = usePlus(), router = useRouter();
  const actual = useRef(plus);
  useEffect(() => { actual.current = plus; }, [plus]);
  const cerrojo = useRef(false);
  const [confirmar, setConfirmar] = useState(false), [error, setError] = useState<unknown>(null);
  useFocusEffect(useCallback(() => {
    void actual.current.refrescar();
    void actual.current.registrarVista().catch(() => {});
  }, []));
  useEffect(() => {
    const timer = setTimeout(() => { setConfirmar(false); setError(null); }, 0);
    return () => clearTimeout(timer);
  }, [plus.identidad]);
  async function intentar(accion: () => Promise<void>) {
    if (cerrojo.current) return;
    cerrojo.current = true; const id = actual.current.identidad; setError(null);
    try { await accion(); } catch (e) { if (id === actual.current.identidad) setError(e); }
    finally { cerrojo.current = false; }
  }
  const trialActivo = plus.tipoAcceso === "FOUNDER_TRIAL";
  const comercialActivo = plus.tipoAcceso === "REVENUECAT_PAID" || plus.tipoAcceso === "PLAY_REVIEW";
  const errorActual = error ?? plus.error;
  const horas = Math.ceil(plus.trialRestanteMs / 3_600_000);
  const dias = Math.floor(horas / 24), restoHoras = horas % 24;
  const etiqueta = plus.demostracion ? "Plus demo" : trialActivo ? "Founder Trial activo" : plus.activo ? "Plus activo" : plus.trialDisponible ? "Founder Trial" : "Blindly Plus";
  const titulo = plus.demostracion ? "Probá los sonidos y temas de Plus." : trialActivo ? "Estás probando Blindly Plus." : plus.activo ? "Tu mesa ya es Plus." : plus.trialDisponible ? "Probá Blindly Plus durante 3 días." : "Más herramientas para tu grupo.";
  return <Pantalla titulo={t("Blindly Plus")} subtitulo={t("Sin anuncios y con más herramientas para tu grupo.")}>
    <Tarjeta variante="hero">
      <Etiqueta activa={plus.activo}>{t(etiqueta)}</Etiqueta>
      <Texto style={{ fontSize: 28, lineHeight: 34, fontWeight: "700" }}>{t(titulo)}</Texto>
      {plus.demostracion ? <Texto suave>{t("Los sonidos y la personalización se desbloquean en este dispositivo. Las funciones online requieren una cuenta con Plus verificado.")}</Texto>
        : trialActivo ? <>
          <Texto accessibilityLiveRegion="polite">{t("Te quedan {dias} días y {horas} h.", { dias, horas: restoHoras })}</Texto>
          <Texto suave>{t("La prueba termina automáticamente. No hay suscripción ni cobro al finalizar.")}</Texto>
        </> : plus.activo ? <Texto suave>{t("Las funciones Plus están habilitadas para esta cuenta.")}</Texto>
        : plus.trialDisponible ? <>
          <Texto>{t("Sin tarjeta. Sin compras. Sin suscripción.")}</Texto>
          <Texto suave>{t("La prueba es opcional: 72 horas, una vez por cuenta. Sin tarjeta ni cobro automático.")}</Texto>
        </> : plus.trial?.expired ? <>
          <Texto>{t("Tu Prueba Founder terminó.")}</Texto>
          <Texto suave>{t("Gracias por probar Plus antes del lanzamiento. Tus datos se conservan.")}</Texto>
        </> : !plus.disponible ? <Texto suave>{t("Los pagos todavía no están disponibles.")}</Texto> : null}
    </Tarjeta>

    {plus.trialDisponible && !plus.activo && !plus.demostracion && (
      confirmar ? <Tarjeta>
        <Texto style={{ fontSize: 18, fontWeight: "600" }}>{t("Prueba Founder")}</Texto>
        <Texto>{t("Vas a desbloquear Blindly Plus durante 72 horas.")}</Texto>
        <Texto suave>{t("La prueba comienza ahora y solo puede activarse una vez en esta cuenta. No se realizará ningún cobro.")}</Texto>
        <Boton titulo={t("Ahora no")} secundario disabled={plus.cargando} onPress={() => setConfirmar(false)} />
        <Boton titulo={t(plus.cargando ? "Cargando…" : "Empezar prueba")} disabled={plus.cargando} onPress={() => void intentar(async () => { await actual.current.iniciarPrueba(); setConfirmar(false); })} />
      </Tarjeta> : <Boton titulo={t("Probar Plus gratis por 3 días")} disabled={plus.cargando} onPress={() => setConfirmar(true)} />
    )}

    <Texto style={{ fontSize: 20, fontWeight: "700" }}>{t("Qué incluye")}</Texto>
    <Superficie style={{ padding: 0, gap: 0 }}>
      {BENEFICIOS_PLUS.map((beneficio, i) => <View key={beneficio.titulo} style={{ flexDirection: "row", gap: 14, padding: 16, borderTopWidth: i ? 1 : 0, borderColor: tema.borde }}>
        <Icono nombre={beneficio.icono} color={tema.acento} size={22} />
        <View style={{ flex: 1, gap: 2 }}><Texto style={{ fontSize: 16, fontWeight: "600" }}>{t(beneficio.titulo)}</Texto><Texto suave style={{ fontSize: 14, lineHeight: 20 }}>{t(beneficio.detalle)}</Texto></View>
      </View>)}
    </Superficie>
    {trialActivo && <Boton titulo={t("Explorar funciones Plus")} onPress={() => router.push("/sonidos")} />}
    <Tarjeta><Texto style={{ fontSize: 16, fontWeight: "600" }}>{t("El poker entre amigos sigue siendo gratis")}</Texto><Texto suave>{t("Crear y unirse a salas, gestionar turnos, usar fichas físicas o virtuales y repartir el pozo seguirán disponibles para todos.")}</Texto></Tarjeta>
    {!!(error ?? plus.error) && <Texto accessibilityLiveRegion="assertive">{mensajeError(error ?? plus.error)}</Texto>}
    {!plus.lanzamientoDisponible && !plus.demostracion && <Boton titulo={t("Actualizar estado de Plus")} secundario disabled={plus.cargando} onPress={() => void intentar(actual.current.refrescar)} />}

    {plus.demostracion ? <Tarjeta>
      <Texto suave>{t("Versión de prueba, sin compras ni suscripciones.")}</Texto>
      <Boton titulo={t("Probar todos los sonidos")} onPress={() => router.push("/sonidos")} />
    </Tarjeta> : <>
      {plus.compraVisible && <Boton titulo={t(plus.cargando ? "Cargando…" : "Obtener Plus")}
        disabled={plus.cargando} onPress={() => void intentar(actual.current.comprar)} />}
      {comercialActivo && <Boton titulo={t(plus.gestionable ? "Administrar suscripción" : "Actualizar estado de Plus")} disabled={plus.cargando} onPress={() => void intentar(plus.gestionable ? actual.current.gestionar : actual.current.refrescar)} />}
      {plus.compraAutorizada && <Boton secundario titulo={t("Restaurar compras")} disabled={plus.cargando} onPress={() => void intentar(actual.current.restaurar)} />}
      {errorActual instanceof Error && errorActual.message === "PLUS_PROTEGER_CUENTA" && <Boton titulo={t("Proteger mi cuenta")} onPress={() => router.push({ pathname: "/cuenta", params: { volver: "plus" } })} />}
    </>}
  </Pantalla>;
}
