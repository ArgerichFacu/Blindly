import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";
import { Boton, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { configurarAudio, volumenAudio, type Reproductor } from "../lib/audio";
import { useControlAudio } from "../lib/useControlAudio";
export function AudioMesa({
  indice,
  corriendo,
  musica,
  permitirAmbiente = true,
}: {
  indice: number;
  corriendo: boolean;
  musica: boolean;
  permitirAmbiente?: boolean;
}) {
  const { preferencias, t } = usePreferencias();
  const campana = useAudioPlayer(require("../../assets/sounds/campana.wav"));
  const cancion = useAudioPlayer(
    require("../../assets/sounds/casino-lounge.mp3"),
  );
  const ambiente = useAudioPlayer(
    require("../../assets/sounds/ambiente-casino.wav"),
  );
  const statusMusica = useAudioPlayerStatus(cancion),
    statusAmbiente = useAudioPlayerStatus(ambiente);
  const control = useControlAudio(corriendo && !preferencias.silencio);
  const anterior = useRef(indice),
    [error, setError] = useState(false);
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "duckOthers",
    }).catch(() => setError(true));
  }, []);
  useEffect(() => {
    const salir = [campana, cancion, ambiente].map(control.registrar);
    return () => salir.forEach((f) => f());
  }, [control, campana, cancion, ambiente]);
  const volMusica = musica ? volumenAudio(preferencias, "musica") : 0;
  const volAmbiente = permitirAmbiente
    ? volumenAudio(preferencias, "ambiente")
    : 0;
  const volRonda = volumenAudio(preferencias, "efectos");
  useEffect(() => {
    configurarAudio(campana, volRonda);
    configurarAudio(cancion, volMusica, true);
    configurarAudio(ambiente, volAmbiente, true);
    if (volRonda === 0) control.pausar(campana);
    if (volMusica === 0) control.pausar(cancion);
    if (volAmbiente === 0) control.pausar(ambiente);
  }, [control, campana, cancion, ambiente, volRonda, volMusica, volAmbiente]);
  useEffect(() => {
    if (indice > anterior.current && corriendo && volRonda > 0) {
      Vibration.vibrate([0, 300, 150, 300]);
      void control.reproducir(campana, true).catch(() => setError(true));
    }
    anterior.current = indice;
  }, [indice, corriendo, volRonda, campana, control]);
  function alternar(player: Reproductor, sonando: boolean) {
    setError(false);
    if (sonando) control.pausar(player);
    else void control.reproducir(player).catch(() => setError(true));
  }
  return (
    <>
      {musica && (
        <Boton
          titulo={t(
            statusMusica.playing ? "Detener música" : "Reproducir música",
          )}
          secundario
          disabled={!corriendo || !statusMusica.isLoaded || volMusica === 0}
          onPress={() => alternar(cancion, statusMusica.playing)}
        />
      )}
      {permitirAmbiente && preferencias.ambiente === "casino" && (
        <Boton
          titulo={t(
            statusAmbiente.playing ? "Detener ambiente" : "Reproducir ambiente",
          )}
          secundario
          disabled={!corriendo || !statusAmbiente.isLoaded || volAmbiente === 0}
          onPress={() => alternar(ambiente, statusAmbiente.playing)}
        />
      )}
      {error && <Texto>{t("No se pudo completar. Probá de nuevo.")}</Texto>}
    </>
  );
}
