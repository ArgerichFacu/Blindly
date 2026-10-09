import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View } from "react-native";
import { Pantalla, Texto, Boton, Tarjeta } from "../../components/Controles";
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
export default function Perfil() {
    const router = useRouter(), { t, preferencias, mensajeError } = usePreferencias(), { tema } = useTema(), plus = usePlus(), clubes = useClubes();
    const [puntos, setPuntos] = useState<Puntuacion | null>(null), [error, setError] = useState<unknown>(null), [revision, setRevision] = useState(0);
    useFocusEffect(useCallback(() => { void revision; let activo = true; setPuntos(null); setError(null); void miPuntuacion().then(p => { if (activo)
        setPuntos(p); }).catch(e => { if (activo)
        setError(e); }); return () => { activo = false; }; }, [revision]));
    const detalles = Object.values(clubes.datos?.detalles ?? {}), titulos = detalles.flatMap(d => d.ranking.filter(f => f.user_id === clubes.datos?.usuario).map(fila => ({ fila, club: d.liga.nombre, esMvp: clasificacion(d.ranking, d.temporada?.estado).mvp?.user_id === fila.user_id })));
    const nombre = detalles.flatMap(d => d.miembros).find(m => m.user_id === clubes.datos?.usuario)?.nombre ?? t("Jugador");
    return <Pantalla titulo={t("Perfil")} volver={false} enTabs>
    <Superficie variante="hero" style={{ paddingVertical: 28, gap: 14, alignItems: "center" }}><View style={{ width: 88, height: 88, borderRadius: 44, ...RELIEVE.panel, boxShadow: `0 8px 24px rgba(0,0,0,.3), 0 0 0 5px ${velo(tema.acento, "0D")}`, backgroundColor: tema.pano, borderWidth: 1, borderColor: velo(tema.acento, "80"), alignItems: "center", justifyContent: "center" }}><Texto style={{ fontSize: 32, fontWeight: "700", color: tema.acento }}>{nombre.charAt(0).toUpperCase()}</Texto></View><Texto style={{ fontSize: 26, fontWeight: "800" }}>{nombre}</Texto><Texto suave>{t(plus.activo ? "Blindly Plus" : "Poker entre amigos")}</Texto></Superficie>
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
