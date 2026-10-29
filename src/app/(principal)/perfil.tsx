import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View } from "react-native";
import { Pantalla, Texto, Boton, Tarjeta, Campo } from "../../components/Controles";
import { useNombreVisible } from "../../lib/useNombreVisible";
import { guardarNombreVisible, inicialNombre, validarNombreVisible } from "../../lib/nombreVisible";
import { Icono } from "../../components/Icono";
import { Superficie } from "../../components/Superficie";
import { RELIEVE, velo } from "../../lib/visual";
import { FilaOpcion } from "../../components/FilaOpcion";
import { TitulosJugador } from "../../components/TitulosJugador";
import { necesitaCuenta } from "../../components/ProtegerCuenta";
import { clasificacion } from "../../lib/clasificacion";
import { useClubes } from "../../lib/useClubes";
import { miPuntuacion, type Puntuacion } from "../../lib/puntuacion";
import { useTema } from "../../lib/TemaContext";
import { usePreferencias } from "../../lib/Preferencias";
import { usePlus } from "../../lib/PlusContext";
export default function Perfil({ enTabs = true }: { enTabs?: boolean } = {}) {
    const router = useRouter(), { t, preferencias, mensajeError } = usePreferencias(), { tema } = useTema(), plus = usePlus(), clubes = useClubes();
    const [puntos, setPuntos] = useState<Puntuacion | null>(null), [error, setError] = useState<unknown>(null), [revision, setRevision] = useState(0);
    const identidad = useNombreVisible();
    const [editando, setEditando] = useState(false), [borrador, setBorrador] = useState(""), [guardando, setGuardando] = useState(false), [mensaje, setMensaje] = useState(""), [errorNombre, setErrorNombre] = useState<unknown>(null);
    const bloqueo = useRef(false);
    const [propietario, setPropietario] = useState<string | null>(null);
    const editorVisible = editando && propietario === identidad.usuario?.id;
    async function guardar() {
      if (bloqueo.current || !editorVisible) return;
      bloqueo.current = true; setGuardando(true); setErrorNombre(null); setMensaje("");
      try {
        await guardarNombreVisible(borrador, propietario ?? undefined);
        setEditando(false); setMensaje(t("Nombre actualizado.")); clubes.recargar();
      } catch (e) { setErrorNombre(e); } finally { bloqueo.current = false; setGuardando(false); }
    }
    let nombreValido = false;
    try { validarNombreVisible(borrador); nombreValido = true; } catch { /* Validación también en servidor. */ }
    useFocusEffect(useCallback(() => { void revision; let activo = true; setPuntos(null); setError(null); void miPuntuacion().then(p => { if (activo)
        setPuntos(p); }).catch(e => { if (activo)
        setError(e); }); return () => { activo = false; }; }, [revision]));
    const detalles = Object.values(clubes.datos?.detalles ?? {}), titulos = detalles.flatMap(d => d.ranking.filter(f => f.user_id === clubes.datos?.usuario).map(fila => ({ fila, club: d.liga.nombre, esMvp: clasificacion(d.ranking, d.temporada?.estado).mvp?.user_id === fila.user_id })));
    const nombreLegacy = detalles.flatMap(d => d.miembros).find(m => m.user_id === identidad.usuario?.id)?.nombre;
    const nombre = identidad.nombre || nombreLegacy || t("Jugador");
    const acceso = plus.activo ? plus.tipoAcceso === "FOUNDER_TRIAL" ? "Founder Trial" : "Blindly Plus" : "Free";
    return <Pantalla titulo={t("Perfil")} volver={!enTabs} enTabs={enTabs}>
    <Superficie variante="hero" style={{ paddingVertical: 28, gap: 14, alignItems: "center" }}><View style={{ flexDirection: "row", gap: 8, alignItems: "center", alignSelf: "stretch", borderBottomWidth: 1, borderColor: tema.borde, paddingBottom: 12 }}><Icono nombre="cartas" color={tema.acento} size={18}/><Texto suave style={{ fontSize: 10, letterSpacing: 1.5 }}>{t("TARJETA DE JUGADOR")}</Texto></View><View style={{ width: 88, height: 88, borderRadius: 44, ...RELIEVE.panel, boxShadow: `0 8px 24px rgba(0,0,0,.3), 0 0 0 5px ${velo(tema.acento, "0D")}`, backgroundColor: tema.pano, borderWidth: 1, borderColor: velo(tema.acento, "80"), alignItems: "center", justifyContent: "center" }}><Texto maxFontSizeMultiplier={1.4} style={{ fontSize: 32, fontWeight: "700", color: tema.acento }}>{inicialNombre(nombre)}</Texto></View><Texto style={{ fontSize: 26, fontWeight: "800", textAlign: "center", flexShrink: 1, alignSelf: "stretch" }}>{nombre}</Texto><Texto suave>{t(acceso)}</Texto>
      <Boton titulo={t("Editar nombre")} secundario compacto disabled={!identidad.usuario || guardando} onPress={() => { setPropietario(identidad.usuario?.id ?? null); setBorrador(nombre); setEditando(true); setErrorNombre(null); setMensaje(""); }} />
    </Superficie>
    {editorVisible && <Tarjeta style={{ gap: 14 }}>
      <Campo etiqueta={t("Nombre visible")} value={borrador} onChangeText={setBorrador} editable={!guardando} autoCapitalize="words" returnKeyType="done" onSubmitEditing={() => { if (nombreValido) void guardar(); }} />
      <Texto suave>{t("Así te verán en Blindly. No tiene que ser único.")}</Texto>
      <Texto suave style={{ fontSize: 12 }}>{t("Entre 1 y 30 caracteres, sin saltos de línea.")}</Texto>
      {!!errorNombre && <Texto accessibilityLiveRegion="polite">{mensajeError(errorNombre)}</Texto>}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}><Boton titulo={t(guardando ? "Guardando…" : "Guardar nombre")} compacto disabled={guardando || !nombreValido} onPress={() => void guardar()} /><Boton titulo={t("Cancelar")} secundario compacto disabled={guardando} onPress={() => setEditando(false)} /></View>
    </Tarjeta>}
    {!!mensaje && !editando && propietario === identidad.usuario?.id && <Texto accessibilityLiveRegion="polite">{mensaje}</Texto>}
    {!!identidad.error && <Texto suave>{mensajeError(identidad.error)}</Texto>}
    {puntos && <Tarjeta style={{ borderRadius: 24, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around" }}>{[[puntos.puntos.toLocaleString(preferencias.idioma), t("Puntos acumulados")], [String(puntos.partidas), t("Partidas jugadas")], [puntos.rango ? `#${puntos.rango}` : "—", t("Rango")]].map(([valor, etiqueta]) => <View key={etiqueta} style={{ alignItems: "center", padding: 12, gap: 7, minWidth: 86, borderRadius: 16, backgroundColor: tema.fondo, borderWidth: 1, borderColor: velo(tema.acento, "16") }}><Texto style={{ fontSize: 27, fontWeight: "800", color: tema.acento }}>{valor}</Texto><Texto suave style={{ fontSize: 11 }}>{etiqueta}</Texto></View>)}</Tarjeta>}
    {!puntos && !error && <Texto suave>{t("Cargando…")}</Texto>}
    {!!error && <View style={{ gap: 8 }}><Texto suave>{mensajeError(error)}</Texto><Boton titulo={t(necesitaCuenta(error) ? "Proteger mi cuenta" : "Reintentar")} secundario compacto onPress={() => necesitaCuenta(error) ? router.push("/cuenta") : setRevision(v => v + 1)}/></View>}
    {titulos.length > 0 && <View style={{ gap: 10 }}><Texto suave>{t("Títulos automáticos")}</Texto>{titulos.map(({ fila, club, esMvp }, i) => <View key={`${fila.user_id}:${i}`} style={{ gap: 6 }}><Texto suave>{club}</Texto><TitulosJugador fila={fila} esMvp={esMvp}/></View>)}</View>}
    <FilaOpcion titulo={t("Mi puntuación")} detalle={t("Tus puntos, tu progreso y tu rango.")} icono="ligas" onPress={() => router.push("/puntuacion")}/>
    <FilaOpcion titulo={t("Mis mesas")} detalle={t("Plantillas listas para tu grupo habitual.")} icono="inicio" onPress={() => router.push("/mesas")}/>
    <FilaOpcion titulo={t("Mi cuenta")} detalle={t(clubes.datos?.protegida ? "Cuenta protegida" : "Proteger mi cuenta")} icono="perfil" onPress={() => router.push("/cuenta")}/>
    {puntos?.historial.slice(0, 3).map(partida => <View key={partida.sala_id} style={{ paddingVertical: 12, gap: 6, borderBottomWidth: 1, borderColor: tema.borde }}><Texto>{t("Puesto {p} de {n}", { p: partida.puesto, n: partida.jugadores })} · {t("+{n} puntos", { n: partida.puntos })}</Texto><Texto suave style={{ fontSize: 12 }}>{new Date(partida.finalizada_en).toLocaleDateString(preferencias.idioma)}</Texto></View>)}
  </Pantalla>;
}
