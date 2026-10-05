import { useCallback, useRef, useState } from "react";
import { Platform, Share, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { TarjetaRecap } from "../components/TarjetaRecap";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { duracionLegible, obtenerRecap, type Recap } from "../lib/recap";

export default function RecapPartida() {
  const { sala } = useLocalSearchParams<{ sala: string }>();
  const router = useRouter();
  const { t, mensajeError } = usePreferencias();
  const plus = usePlus();
  const tarjeta = useRef<View>(null);
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
    if (!recap) return;
    if (!plus.activo) {
      router.push("/plus");
      return;
    }
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
            <Etiqueta>{t("GANADOR")}</Etiqueta>
            <Texto style={{ fontSize: 24, fontWeight: "900" }}>{recap.resultados[0]?.nombre ?? "—"}</Texto>
            <Texto suave>
              {t("{n} jugadores", { n: recap.jugadores })}
              {duracionLegible(recap.duracion_ms) ? ` · ${duracionLegible(recap.duracion_ms)}` : ""}
            </Texto>
            {recap.resultados.filter((r) => r.soy_yo).map((r) => (
              <Texto key={r.nombre}>{t("Tu resultado: puesto {p} · +{n} puntos", { p: r.puesto, n: r.puntos })}</Texto>
            ))}
          </Tarjeta>
          <Boton titulo={t(compartiendo ? "Preparando imagen…" : "Compartir resultado")} disabled={compartiendo} onPress={() => void compartir()} />
          {!plus.activo && <Texto suave style={{ textAlign: "center" }}>{t("La tarjeta para compartir es una función de Blindly Plus.")}</Texto>}
        </>
      )}
    </Pantalla>
  );
}
