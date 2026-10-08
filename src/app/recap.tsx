import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useCallback, useRef, useState } from "react";
import { Platform, Share, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { TarjetaRecap } from "../components/TarjetaRecap";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { duracionLegible, ganadoresRecap, obtenerRecap, type Recap } from "../lib/recap";

export default function RecapPartida() {
  const { sala } = useLocalSearchParams<{ sala: string }>();
  const router = useRouter();
  const { t, mensajeError } = usePreferencias();
  const plus = usePlus();
  const tarjeta = useRef<View>(null);
  const enviando = useRef(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [compartiendo, setCompartiendo] = useState(false);
  useFocusEffect(useCallback(() => {
    let viva = true;
    if (!sala) return () => { viva = false; };
    void obtenerRecap(sala).then((r) => { if (viva) setRecap(r); })
      .catch((e) => { if (viva) setError(e); });
    return () => { viva = false; };
  }, [sala]));

  async function compartir() {
    if (!recap || enviando.current || plus.cargando) return;
    if (!capacidadesPlus(plus).premium) {
      router.push("/plus");
      return;
    }
    enviando.current = true;
    setCompartiendo(true);
    setError(null);
    try {
      if (Platform.OS === "web") {
        await Share.share({ message: `${t("Resultado final")}: ${recap.resultados.slice(0, 3).map((r) => `${r.puesto}° ${r.nombre}`).join(" · ")} — Blindly` });
      } else {
        const uri = await captureRef(tarjeta, { format: "png", quality: 1, width: 1080, height: 1920, result: "tmpfile" });
        if (!(await Sharing.isAvailableAsync())) throw new Error("COMPARTIR_NO_DISPONIBLE");
        await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: t("Compartir resultado") });
      }
    } catch (e) {
      setError(e);
    } finally {
      enviando.current = false;
      setCompartiendo(false);
    }
  }

  return (
    <Pantalla titulo={t("Resumen de la partida")} subtitulo={t("Una noche para recordar.")}>
      {!!error && <Texto>{mensajeError(error)}</Texto>}
      {!recap && !error && <Texto>{t("Cargando…")}</Texto>}
      {!!recap && (
        <>
          <TarjetaRecap ref={tarjeta} recap={recap} />
          <Tarjeta>
            <Etiqueta>{t(ganadoresRecap(recap).length > 1 ? "GANADORES" : "GANADOR")}</Etiqueta>
            <Texto style={{ fontSize: 24, fontWeight: "900" }}>{ganadoresRecap(recap).map(r => r.nombre).join(" · ") || "—"}</Texto>
            {!!recap.nuevo_mvp && <Texto style={{ fontWeight: "800" }}>{t("{nombre} tomó el MVP", { nombre: recap.nuevo_mvp.nombre })}</Texto>}
            <Texto suave>
              {t("{n} jugadores", { n: recap.jugadores })}
              {duracionLegible(recap.duracion_ms) ? ` · ${duracionLegible(recap.duracion_ms)}` : ""}
            </Texto>
            {recap.resultados.filter((r) => r.soy_yo).map((r) => (
              <Texto key={r.user_id ?? r.nombre}>{t("Tu resultado: puesto {p} · +{n} puntos", { p: r.puesto, n: r.puntos })}</Texto>
            ))}
          </Tarjeta>
          <Boton titulo={t(compartiendo ? "Preparando imagen…" : "Compartir resultado")} disabled={compartiendo || plus.cargando} onPress={() => void compartir()} />
          {!capacidadesPlus(plus).premium && <Texto suave style={{ textAlign: "center" }}>{t("La tarjeta para compartir es una función de Blindly Plus.")}</Texto>}
        </>
      )}
    </Pantalla>
  );
}
