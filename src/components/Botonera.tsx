import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View, useWindowDimensions } from "react-native";
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
  pato: require("../../assets/sounds/pato.wav"),
  bateria: require("../../assets/sounds/bateria.wav"),
  dealer: require("../../assets/sounds/dealer.wav"),
  sorpresa: require("../../assets/sounds/sorpresa.wav"),
  risa: require("../../assets/sounds/risa.wav"),
  buzzer: require("../../assets/sounds/buzzer.wav"),
};
type Control = ReturnType<typeof useControlAudio>;
function Sonido({
  sonido,
  control,
  volumen,
  permitido,
  avisar,
  ultimoRef,
  ancho,
}: {
  sonido: (typeof SONIDOS)[number];
  control: Control;
  volumen: number;
  permitido: boolean;
  avisar: (valor: boolean) => void;
  ultimoRef: { current: number };
  ancho?: number;
}) {
  const { t, preferencias } = usePreferencias(), { tema } = useTema();
  const player = useAudioPlayer(archivos[sonido.id], { downloadFirst: true, updateInterval: 100 });
  const { isLoaded, playing } = useAudioPlayerStatus(player);
  const [pulso] = useState(() => new Animated.Value(0));
  useEffect(() => () => pulso.stopAnimation(), [pulso]);
  useEffect(() => control.registrar(player), [control, player]);
  useEffect(() => {
    configurarAudio(player, volumen);
    if (volumen === 0) control.pausar(player);
  }, [player, volumen, control]);
  return (
    <View style={{ width: ancho ?? "48%" }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t(sonido.nombre)}${sonido.plus ? " · Plus" : ""}`}
        accessibilityState={{ disabled: !permitido || volumen === 0 || !isLoaded, selected: playing }}
        disabled={!permitido || volumen === 0 || !isLoaded}
        style={({ pressed }) => ({ minHeight: 52, paddingHorizontal: 10, paddingVertical: 10, gap: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: playing || pressed ? tema.acento : tema.borde, backgroundColor: sonido.id === "allin" || sonido.id === "bust" ? SALON.bordo : tema.fondoTarjeta, ...RELIEVE.bajo, opacity: !permitido || volumen === 0 || !isLoaded ? .42 : 1, transform: [{ scale: pressed ? .97 : 1 }] })}
        onPress={() => {
          if (!permitido || volumen === 0 || !isLoaded) return;
          // Una sola reacción a la vez, sin cola de sonidos ni ráfagas accidentales.
          const ahora = Date.now();
          if (ahora - ultimoRef.current < 350) return;
          ultimoRef.current = ahora;
          avisar(false);
          pulso.stopAnimation();
          pulso.setValue(.35);
          Animated.timing(pulso, { toValue: 0, duration: 200, useNativeDriver: true }).start();
          void vibrarToque(preferencias.hapticos);
          void control.reproducir(player, true).catch(() => avisar(true));
        }}
      ><Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", inset: 0, borderRadius: 10, backgroundColor: tema.acento, opacity: pulso }}/><Icono nombre={sonido.icono} color={tema.acento} size={20}/><Texto style={{ flexShrink: 1, fontWeight: "700", fontSize: 12 }}>{t(sonido.nombre)}</Texto></Pressable>
    </View>
  );
}
export function Botonera({ corriendo = true }: { corriendo?: boolean }) {
  const { tema } = useTema();
  const { preferencias, t } = usePreferencias(),
    plus = usePlus(),
    router = useRouter();
  const volumen = volumenAudio(preferencias, "botonera");
  const control = useControlAudio(corriendo && volumen > 0, true);
  const [error, setError] = useState(false),
    ultimoRef = useRef(0);
  const [ancho, setAncho] = useState(0);
  const [cerrados, setCerrados] = useState<Record<string, boolean>>({});
  const { fontScale } = useWindowDimensions();
  const columnas = ancho >= 390 && fontScale <= 1.2 ? 3 : 2;
  const anchoBoton = ancho > 0 ? (ancho - (columnas - 1) * 8) / columnas : undefined;
  useEffect(() => {
    control.detener();
  }, [control, plus.activo, plus.cargando, plus.error]);
  const lista = sonidosDisponibles(preferencias, capacidadesPlus(plus).botonera);
  return (
    <>
      <Texto suave>
        {t("Reacciones de mesa")}
      </Texto>
      {(["Poker Room", "Party"] as const).filter(pack => lista.some(s => s.pack === pack)).map(pack => <View key={pack} onLayout={event => setAncho(event.nativeEvent.layout.width)} style={{ gap: 10 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t(pack)} accessibilityState={{ expanded: !cerrados[pack] }} onPress={() => setCerrados(actual => ({ ...actual, [pack]: !actual[pack] }))} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icono nombre="altavoz" color={tema.acento} size={18}/>
        <Texto suave style={{ fontSize: 12, fontWeight: "600" }}>{t(pack)}</Texto>
        <View style={{ transform: [{ rotate: cerrados[pack] ? "0deg" : "90deg" }] }}><Icono nombre="flecha" color={tema.acento} size={14}/></View>
      </Pressable>
      <View
        style={{
          display: cerrados[pack] ? "none" : "flex",
          flexDirection: "row",
          flexWrap: "wrap",
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
            ancho={anchoBoton}
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
