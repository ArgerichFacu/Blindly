import { useFocusEffect } from "expo-router";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Vibration } from "react-native";
import { Boton, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
export function AudioMesa({
  indice,
  corriendo,
  musica,
}: {
  indice: number;
  corriendo: boolean;
  musica: boolean;
}) {
  const { preferencias, t } = usePreferencias(),
    campana = useAudioPlayer(require("../../assets/sounds/campana.wav")),
    ambiente = useAudioPlayer(require("../../assets/sounds/casino-lounge.mp3"));
  const { playing: sonando, isLoaded } = useAudioPlayerStatus(ambiente);
  const anterior = useRef(indice),
    [error, setError] = useState(false);
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(() => {});
  }, []);
  useEffect(() => {
    // Expo AudioPlayer expone estas propiedades nativas como configuración mutable.
    // eslint-disable-next-line react-hooks/immutability
    campana.volume = preferencias.sonido ? preferencias.volumenRonda : 0;
    // eslint-disable-next-line react-hooks/immutability
    ambiente.volume = preferencias.volumenMusica;
    ambiente.loop = true;
  }, [preferencias, campana, ambiente]);
  useEffect(() => {
    if (indice > anterior.current && corriendo && preferencias.sonido) {
      Vibration.vibrate([0, 300, 150, 300]);
      void campana
        .seekTo(0)
        .then(() => campana.play())
        .catch(() => setError(true));
    }
    anterior.current = indice;
  }, [indice, corriendo, preferencias.sonido, campana]);
  useEffect(() => {
    if (!musica || !corriendo) {
      ambiente.pause();
    }
  }, [musica, corriendo, ambiente]);
  useEffect(() => {
    const escucha = AppState.addEventListener("change", (estado) => {
      if (estado !== "active") {
        ambiente.pause();
      }
    });
    return () => escucha.remove();
  }, [ambiente]);
  useFocusEffect(
    useCallback(
      () => () => {
        ambiente.pause();
      },
      [ambiente],
    ),
  );
  function alternar() {
    try {
      setError(false);
      if (sonando) ambiente.pause();
      else ambiente.play();
    } catch {
      setError(true);
    }
  }
  return (
    <>
      {musica && (
        <Boton
          titulo={t(sonando ? "Detener música" : "Reproducir música")}
          secundario
          disabled={!corriendo || !isLoaded}
          onPress={alternar}
        />
      )}{" "}
      {error && <Texto>{t("No se pudo completar. Probá de nuevo.")}</Texto>}
    </>
  );
}
