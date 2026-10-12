import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Acceso, Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { usePlus } from "../lib/PlusContext";
import { BENEFICIOS_PLUS } from "../lib/plus";
import type { PlanPlus } from "../lib/founderPlus";

export default function Plus() {
  const { t, mensajeError } = usePreferencias(), { tema } = useTema(), plus = usePlus(), router = useRouter();
  const actual = useRef(plus);
  useEffect(() => { actual.current = plus; }, [plus]);
  const cerrojo = useRef(false);
  const [confirmar, setConfirmar] = useState(false), [selector, setSelector] = useState(false);
  const [plan, setPlan] = useState<PlanPlus>("annual"), [aviso, setAviso] = useState(""), [error, setError] = useState<unknown>(null);
  useFocusEffect(useCallback(() => {
    void actual.current.refrescar();
    void actual.current.registrarVista().catch(() => {});
  }, []));
  useEffect(() => {
    const timer = setTimeout(() => { setConfirmar(false); setSelector(false); setAviso(""); setError(null); }, 0);
    return () => clearTimeout(timer);
  }, [plus.identidad]);
  async function intentar(accion: () => Promise<void>) {
    if (cerrojo.current) return;
    cerrojo.current = true; const id = actual.current.identidad; setError(null);
    try { await accion(); } catch (e) { if (id === actual.current.identidad) setError(e); }
    finally { cerrojo.current = false; }
  }
  const trialActivo = plus.tipoAcceso === "FOUNDER_TRIAL";
  const errorActual = error ?? plus.error;
  const horas = Math.ceil(plus.trialRestanteMs / 3_600_000);
  const dias = Math.floor(horas / 24), restoHoras = horas % 24;
  const etiqueta = plus.demostracion ? "PLUS DEMO" : trialActivo ? "FOUNDER TRIAL ACTIVO" : plus.activo ? "PLUS ACTIVO" : plus.trialDisponible ? "FOUNDER TRIAL" : "PRÓXIMAMENTE";
  const titulo = plus.demostracion ? "Probá los sonidos y temas de Plus." : trialActivo ? "Estás probando Blindly Plus." : plus.activo ? "Tu mesa ya es Plus." : plus.trialDisponible ? "Probá Blindly Plus durante 3 días." : "Blindly Plus estará disponible próximamente.";
  return <Pantalla titulo={t("Blindly Plus")} subtitulo={t("Tu mesa, a tu manera.")}>
    <Tarjeta style={{ borderColor: tema.acento, backgroundColor: tema.fondoTarjeta, overflow: "hidden" }}>
      <View style={{ position: "absolute", width: 140, height: 140, borderRadius: 70, right: -52, top: -58, backgroundColor: tema.acento + "18" }} />
      <Etiqueta activa>{t(etiqueta)}</Etiqueta>
      <Texto style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.8 }}>{t(titulo)}</Texto>
      {plus.demostracion ? <Texto suave>{t("Los sonidos y la personalización se desbloquean en este dispositivo. Las funciones online requieren una cuenta con Plus verificado.")}</Texto>
        : trialActivo ? <>
          <Texto accessibilityLiveRegion="polite">{t("Te quedan {dias} días y {horas} h.", { dias, horas: restoHoras })}</Texto>
          <Texto suave>{t("La prueba termina automáticamente. No hay suscripción ni cobro al finalizar.")}</Texto>
        </> : plus.activo ? <Texto suave>{t("Las funciones Plus están habilitadas para esta cuenta.")}</Texto>
        : plus.trialDisponible ? <>
          <Texto>{t("Sin tarjeta. Sin compras. Sin suscripción.")}</Texto>
          <Texto suave>{t("Las funciones Plus se desbloquean durante 72 horas desde que activás la prueba. Plus será pago más adelante.")}</Texto>
        </> : plus.trial?.expired ? <>
          <Texto>{t("Tu Prueba Founder terminó.")}</Texto>
          <Texto suave>{t("Gracias por probar Plus antes del lanzamiento. Tus datos se conservan.")}</Texto>
        </> : <Texto suave>{t("Por ahora no hay pagos disponibles. Podés guardar tu interés para el lanzamiento.")}</Texto>}
    </Tarjeta>

    {plus.trialDisponible && !plus.activo && !plus.demostracion && (
      confirmar ? <Tarjeta>
        <Texto style={{ fontWeight: "800" }}>{t("PRUEBA FOUNDER")}</Texto>
        <Texto>{t("Vas a desbloquear Blindly Plus durante 72 horas.")}</Texto>
        <Texto suave>{t("La prueba comienza ahora y solo puede activarse una vez en esta cuenta. No se realizará ningún cobro.")}</Texto>
        <Boton titulo={t("Ahora no")} secundario disabled={plus.cargando} onPress={() => setConfirmar(false)} />
        <Boton titulo={t(plus.cargando ? "Cargando…" : "Empezar prueba")} disabled={plus.cargando} onPress={() => void intentar(async () => { await actual.current.iniciarPrueba(); setConfirmar(false); })} />
      </Tarjeta> : <Boton titulo={t("PROBAR PLUS GRATIS · 3 DÍAS")} disabled={plus.cargando} onPress={() => setConfirmar(true)} />
    )}

    {BENEFICIOS_PLUS.map(beneficio => <Tarjeta key={beneficio.titulo} style={{ flexDirection: "row", gap: 14 }}>
      <View style={{ width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: tema.acento + "18" }}><Texto style={{ color: tema.acento, fontSize: 21 }}>{beneficio.simbolo}</Texto></View>
      <View style={{ flex: 1, gap: 4 }}><Texto style={{ fontSize: 16, fontWeight: "700" }}>{t(beneficio.titulo)}</Texto><Texto suave style={{ fontSize: 13, lineHeight: 19 }}>{t(beneficio.detalle)}</Texto></View>
    </Tarjeta>)}
    {trialActivo && <Boton titulo={t("Explorar funciones Plus")} onPress={() => router.push("/sonidos")} />}
    <Tarjeta><Texto style={{ fontWeight: "700" }}>{t("El poker entre amigos sigue siendo gratis")}</Texto><Texto suave>{t("Crear y unirse a salas, gestionar turnos, usar fichas físicas o virtuales y repartir el pozo seguirán disponibles para todos.")}</Texto></Tarjeta>
    {!!aviso && <Tarjeta><Texto accessibilityLiveRegion="polite">{t(aviso)}</Texto></Tarjeta>}
    {!!(error ?? plus.error) && <Texto accessibilityLiveRegion="assertive">{mensajeError(error ?? plus.error)}</Texto>}
    {!plus.lanzamientoDisponible && !plus.demostracion && <Boton titulo={t("Actualizar estado de Plus")} secundario disabled={plus.cargando} onPress={() => void intentar(actual.current.refrescar)} />}

    {plus.demostracion ? <Tarjeta>
      <Texto suave>{t("Versión de prueba, sin compras ni suscripciones.")}</Texto>
      <Boton titulo={t("Probar todos los sonidos")} onPress={() => router.push("/sonidos")} />
    </Tarjeta> : plus.disponible ? <>
      <Boton titulo={t(plus.cargando ? "Cargando…" : plus.activo ? plus.gestionable ? "Administrar suscripción" : "Actualizar estado de Plus" : "Ver planes de Blindly Plus")}
        disabled={plus.cargando} onPress={() => void intentar(plus.activo ? plus.gestionable ? actual.current.gestionar : actual.current.refrescar : actual.current.comprar)} />
      <Boton secundario titulo={t("Restaurar compras")} disabled={plus.cargando} onPress={() => void intentar(actual.current.restaurar)} />
      {errorActual instanceof Error && errorActual.message === "PLUS_PROTEGER_CUENTA" && <Boton titulo={t("Proteger mi cuenta")} onPress={() => router.push({ pathname: "/cuenta", params: { volver: "plus" } })} />}
    </> : !plus.activo && plus.lanzamientoDisponible ? <Tarjeta>
      <Texto style={{ fontWeight: "800" }}>{t("Precio previsto")}</Texto>
      <Texto suave>{t("Precios previstos para cuando Plus esté disponible comercialmente.")}</Texto>
      <Texto>{t("Mensual")} · USD 0,99</Texto><Texto>{t("Anual")} · USD 9,99</Texto><Texto>{t("Founder Lifetime")} · USD 24,99</Texto>
      <Texto suave>{t("Founder Trial es la prueba gratuita. Founder Lifetime será un producto pago de acceso vitalicio.")}</Texto>
      <Boton titulo={t("Quiero Plus")} disabled={plus.cargando} onPress={() => { setSelector(v => !v); setPlan(actual.current.trial?.interest_plan ?? "annual"); }} />
      {selector && <>
        <Texto style={{ fontWeight: "700" }}>{t("¿Qué plan elegirías?")}</Texto>
        {(["monthly", "annual", "lifetime"] as const).map(p => <Acceso key={p} titulo={t(p === "monthly" ? "Mensual" : p === "annual" ? "Anual · Recomendado" : "Founder Lifetime")}
          detalle={p === "monthly" ? "USD 0,99" : p === "annual" ? "USD 9,99" : "USD 24,99"} activo={plan === p} disabled={plus.cargando} onPress={() => setPlan(p)} />)}
        <Boton titulo={t("Guardar interés")} disabled={plus.cargando} onPress={() => void intentar(async () => {
          const id = actual.current.identidad; await actual.current.registrarInteres(plan);
          if (id === actual.current.identidad) { setAviso("Interés guardado."); setSelector(false); }
        })} />
      </>}
      <Boton titulo={t(plus.trial?.waitlist ? "Ya estás en la lista de espera" : "Anotarme a la lista de espera")} secundario disabled={plus.cargando || plus.trial?.waitlist}
        onPress={() => void intentar(async () => {
          const id = actual.current.identidad, contactable = await actual.current.registrarWaitlist();
          if (id === actual.current.identidad) setAviso(contactable ? "Listo. Te avisaremos cuando Blindly Plus esté disponible." : "Listo. Guardamos tu interés.");
        })} />
      {plus.trial?.waitlist && !plus.trial.contactable && <>
        <Texto suave>{t("Protegé tu cuenta cuando quieras para poder recibir novedades.")}</Texto>
        <Boton titulo={t("Proteger mi cuenta")} secundario onPress={() => router.push({ pathname: "/cuenta", params: { volver: "plus" } })} />
      </>}
    </Tarjeta> : null}
  </Pantalla>;
}
