import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Boton, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { SONIDOS, sonidosDisponibles, type SonidoId } from "../lib/botonera";
import { configurarAudio, volumenAudio } from "../lib/audio";
import { useControlAudio } from "../lib/useControlAudio";
const archivos: Record<SonidoId, number> = {
  aplausos: require("../../assets/sounds/aplausos.wav"),
  fichas: require("../../assets/sounds/fichas.wav"),
  grillos: require("../../assets/sounds/grillos.wav"),
  campana: require("../../assets/sounds/campana.wav"),
  bocina: require("../../assets/sounds/bocina.wav"),
  trombon: require("../../assets/sounds/trombon.wav"),
  caja: require("../../assets/sounds/caja.wav"),
  respeto: require("../../assets/sounds/respeto.wav"),
};
type Control = ReturnType<typeof useControlAudio>;
function Sonido({
  sonido,
  control,
  volumen,
  permitido,
  avisar,
  ultimoRef,
}: {
  sonido: (typeof SONIDOS)[number];
  control: Control;
  volumen: number;
  permitido: boolean;
  avisar: (valor: boolean) => void;
  ultimoRef: { current: number };
}) {
  const { t } = usePreferencias();
  const player = useAudioPlayer(archivos[sonido.id]);
  const { isLoaded } = useAudioPlayerStatus(player);
  useEffect(() => control.registrar(player), [control, player]);
  useEffect(() => {
    configurarAudio(player, volumen);
    if (volumen === 0) control.pausar(player);
  }, [player, volumen, control]);
  return (
    <View style={{ width: "48%" }}>
      <Boton
        secundario
        titulo={`${sonido.simbolo} ${t(sonido.nombre)}`}
        disabled={!permitido || volumen === 0 || !isLoaded}
        onPress={() => {
          // Una sola reacción a la vez, sin cola de sonidos ni ráfagas accidentales.
          const ahora = Date.now();
          if (ahora - ultimoRef.current < 350) return;
          ultimoRef.current = ahora;
          avisar(false);
          void control.reproducir(player, true).catch(() => avisar(true));
        }}
      />
    </View>
  );
}
export function Botonera({ corriendo = true }: { corriendo?: boolean }) {
  const { preferencias, t } = usePreferencias(),
    plus = usePlus(),
    router = useRouter();
  const volumen = volumenAudio(preferencias, "botonera");
  const control = useControlAudio(corriendo && volumen > 0, true);
  const [error, setError] = useState(false),
    ultimoRef = useRef(0);
  useEffect(() => {
    control.detener();
  }, [control, plus.activo, plus.cargando, plus.error]);
  const lista = sonidosDisponibles(preferencias, capacidadesPlus(plus).botonera);
  return (
    <>
      <Texto suave>
        {t("Reacciones que suenan en tu celular, para compartir en la mesa.")}
      </Texto>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {lista.map((sonido) => (
          <Sonido
            key={sonido.id}
            sonido={sonido}
            control={control}
            volumen={volumen}
            permitido={corriendo}
            avisar={setError}
            ultimoRef={ultimoRef}
          />
        ))}
      </View>
      {lista.length === 0 && (
        <Texto suave>
          {t("No hay sonidos seleccionados. Elegilos en Sonidos y ambiente.")}
        </Texto>
      )}
      {error && <Texto>{t("No se pudo completar. Probá de nuevo.")}</Texto>}
      {!capacidadesPlus(plus).botonera && (
        <Boton
          titulo={t("Más sonidos y personalización · Plus")}
          secundario
          onPress={() => router.push("/plus")}
        />
      )}
    </>
  );
}
