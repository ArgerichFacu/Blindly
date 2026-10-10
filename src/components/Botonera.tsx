import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Boton, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { SONIDOS, sonidosDisponibles, type SonidoId } from "../lib/botonera";
import { configurarAudio, volumenAudio } from "../lib/audio";
import { useControlAudio } from "../lib/useControlAudio";
import { useTema } from "../lib/TemaContext";
import { Icono } from "./Icono";
import { RELIEVE, SALON } from "../lib/visual";
import { vibrarToque } from "../lib/hapticos";
const archivos: Record<SonidoId, number> = {
  aplausos: require("../../assets/sounds/aplausos.wav"),
  fichas: require("../../assets/sounds/fichas.wav"),
  grillos: require("../../assets/sounds/grillos.wav"),
  campana: require("../../assets/sounds/campana.wav"),
  bocina: require("../../assets/sounds/bocina.wav"),
  trombon: require("../../assets/sounds/trombon.wav"),
  caja: require("../../assets/sounds/caja.wav"),
  respeto: require("../../assets/sounds/respeto.wav"),
  carta: require("../../assets/sounds/carta.wav"),
  barajar: require("../../assets/sounds/barajar.wav"),
  allin: require("../../assets/sounds/allin.wav"),
  bust: require("../../assets/sounds/bust.wav"),
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
  const { t, preferencias } = usePreferencias(), { tema } = useTema();
  const player = useAudioPlayer(archivos[sonido.id]);
  const { isLoaded, playing } = useAudioPlayerStatus(player);
  useEffect(() => control.registrar(player), [control, player]);
  useEffect(() => {
    configurarAudio(player, volumen);
    if (volumen === 0) control.pausar(player);
  }, [player, volumen, control]);
  return (
    <View style={{ width: "48%" }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(sonido.nombre)}
        accessibilityState={{ disabled: !permitido || volumen === 0 || !isLoaded }}
        disabled={!permitido || volumen === 0 || !isLoaded}
        style={({ pressed }) => ({ minHeight: 78, padding: 12, gap: 8, alignItems: "center", justifyContent: "center", borderRadius: 18, borderWidth: 1, borderColor: playing || pressed ? tema.acento : tema.borde, backgroundColor: sonido.id === "allin" || sonido.id === "bust" ? SALON.bordo : tema.fondoTarjeta, ...RELIEVE.bajo, opacity: !permitido || volumen === 0 || !isLoaded ? .42 : 1, transform: [{ scale: pressed ? .97 : 1 }] })}
        onPress={() => {
          if (!permitido || volumen === 0 || !isLoaded) return;
          // Una sola reacción a la vez, sin cola de sonidos ni ráfagas accidentales.
          const ahora = Date.now();
          if (ahora - ultimoRef.current < 350) return;
          ultimoRef.current = ahora;
          avisar(false);
          void vibrarToque(preferencias.hapticos);
          void control.reproducir(player, true).catch(() => avisar(true));
        }}
      ><Icono nombre={sonido.icono} color={tema.acento} size={24}/><Texto style={{ fontWeight: "700", textAlign: "center", fontSize: 12 }}>{t(sonido.nombre)}</Texto></Pressable>
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
        {t("Reacciones de mesa")}
      </Texto>
      {(["Poker Room", "Party"] as const).filter(pack => lista.some(s => s.pack === pack)).map(pack => <View key={pack} style={{ gap: 10 }}>
      <Texto suave style={{ fontSize: 11, letterSpacing: 1 }}>{t(pack)}</Texto>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {lista.filter(sonido => sonido.pack === pack).map((sonido) => (
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
      </View>)}
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
