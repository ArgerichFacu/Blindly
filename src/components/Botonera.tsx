import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Boton, Campo, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { SONIDOS, sonidosDisponibles, registrarReciente, buscarSonidos, type SonidoId } from "../lib/botonera";
import { configurarAudio, volumenAudio } from "../lib/audio";
import { useControlAudio } from "../lib/useControlAudio";
import { useTema } from "../lib/TemaContext";
import { Icono } from "./Icono";
import { RELIEVE } from "../lib/visual";
import { vibrarToque } from "../lib/hapticos";
const archivos: Record<SonidoId, number> = {
  aplausos: require("../../assets/sounds/aplausos.wav"),
  fichas: require("../../assets/sounds/fichas.wav"),
  grillos: require("../../assets/sounds/grillos.wav"),
  bocina: require("../../assets/sounds/bocina.wav"),
  trombon: require("../../assets/sounds/trombon.wav"),
  carta: require("../../assets/sounds/carta.wav"),
  barajar: require("../../assets/sounds/barajar.wav"),
  pato: require("../../assets/sounds/pato.wav"),
  bateria: require("../../assets/sounds/bateria.wav"),
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
  visible = true,
}: {
  sonido: (typeof SONIDOS)[number];
  control: Control;
  volumen: number;
  permitido: boolean;
  avisar: (valor: boolean) => void;
  ultimoRef: { current: number };
  visible?: boolean;
}) {
  const { t, preferencias, cambiar } = usePreferencias(), { tema } = useTema();
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
    <View style={{ width: "48%", display: visible ? "flex" : "none", flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.fondoTarjeta, ...RELIEVE.bajo }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t(sonido.nombre)}${sonido.plus ? " · Plus" : ""}`}
        accessibilityState={{ disabled: !permitido || volumen === 0 || !isLoaded, selected: playing }}
        disabled={!permitido || volumen === 0 || !isLoaded}
        style={({ pressed }) => ({ flex: 1, minHeight: 52, paddingHorizontal: 8, paddingVertical: 10, gap: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: playing || pressed ? `${tema.acento}18` : "transparent", opacity: !permitido || volumen === 0 || !isLoaded ? .42 : 1, transform: [{ scale: pressed ? .97 : 1 }] })}
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
          void control.reproducir(player, true).then(reproducido => {
            if (reproducido) cambiar({ botoneraRecientes: registrarReciente(preferencias.botoneraRecientes, sonido.id) });
          }).catch(() => avisar(true));
        }}
      ><Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", inset: 0, borderRadius: 10, backgroundColor: tema.acento, opacity: pulso }}/><Icono nombre={sonido.icono} color={tema.acento} size={18}/><Texto style={{ flexShrink: 1, fontWeight: "700", fontSize: 12 }}>{t(sonido.nombre)}</Texto></Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t(preferencias.botoneraFavoritos.includes(sonido.id) ? "Quitar de favoritos" : "Añadir a favoritos")}: ${t(sonido.nombre)}`}
        accessibilityState={{ selected: preferencias.botoneraFavoritos.includes(sonido.id) }}
        style={({ pressed }) => ({ width: 44, minHeight: 52, alignItems: "center", justifyContent: "center", opacity: pressed ? .6 : 1 })}
        onPress={() => cambiar({ botoneraFavoritos: preferencias.botoneraFavoritos.includes(sonido.id)
          ? preferencias.botoneraFavoritos.filter(id => id !== sonido.id)
          : [...preferencias.botoneraFavoritos, sonido.id] })}
      ><Icono nombre="corazon" size={18} color={preferencias.botoneraFavoritos.includes(sonido.id) ? tema.acento : tema.textoSuave} relleno={preferencias.botoneraFavoritos.includes(sonido.id)} /></Pressable>
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
  const [busqueda, setBusqueda] = useState("");
  useEffect(() => {
    control.detener();
  }, [control, plus.activo, plus.cargando, plus.error]);
  const lista = sonidosDisponibles(preferencias, capacidadesPlus(plus).botonera);
  const encontrados = buscarSonidos(busqueda, t);
  const grupos = [
    { nombre: "Recientes", ids: preferencias.botoneraRecientes.filter(id => lista.some(s => s.id === id)) },
    { nombre: "Favoritos", ids: preferencias.botoneraFavoritos.filter(id => lista.some(s => s.id === id)) },
    { nombre: "Todos los sonidos", ids: lista.map(s => s.id) },
  ];
  return (
    <>
      <Texto suave>
        {t("Reacciones de mesa")}
      </Texto>
      <Campo etiqueta={t("Buscar sonidos")} placeholder={t("Buscar sonidos")} value={busqueda} onChangeText={setBusqueda} autoCorrect={false} />
      {grupos.map(grupo => <View key={grupo.nombre} style={{ gap: 10, display: grupo.ids.some(id => encontrados.includes(id)) ? "flex" : "none" }}>
      <Texto suave style={{ fontSize: 12, fontWeight: "600" }}>{t(grupo.nombre)}</Texto>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        {grupo.ids.map(id => SONIDOS.find(s => s.id === id)!).map((sonido) => (
          <Sonido
            key={sonido.id}
            sonido={sonido}
            control={control}
            volumen={volumen}
            permitido={corriendo}
            avisar={setError}
            ultimoRef={ultimoRef}
            visible={encontrados.includes(sonido.id)}
          />
        ))}
      </View>
      </View>)}
      {lista.length > 0 && !lista.some(s => encontrados.includes(s.id)) && <Texto suave>{t("No hay sonidos con ese nombre.")}</Texto>}
      {lista.length === 0 && (
        <Texto suave>
          {t("No hay sonidos seleccionados. Elegilos en Sonidos y ambiente.")}
        </Texto>
      )}
      {error && <Texto>{t("No se pudo completar. Probá de nuevo.")}</Texto>}
      {!capacidadesPlus(plus).botonera && (
        <Boton
          titulo={t("Personalizar reacciones · Plus")}
          secundario
          onPress={() => router.push("/plus")}
        />
      )}
    </>
  );
}
