import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import { cargarPersonalizado, cargarPresetId, guardarPresetId } from "../lib/almacenamiento";
import {
  NIVELES_REGULAR,
  PRESETS,
  describir,
  estadoActual,
  inicioDeNivel,
  numeroDeNivel,
  type Nivel,
  type Preset,
} from "../lib/niveles";
import { crearSala } from "../lib/salas";
import { useTema } from "../lib/TemaContext";

const SONIDO_CAMBIO = require("../../assets/sounds/campana.wav");

function formatear(ms: number) {
  const totalSegundos = Math.ceil(ms / 1000);
  const min = Math.floor(totalSegundos / 60);
  const seg = totalSegundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

export default function Configurar() {
  const router = useRouter();
  const { tema } = useTema();
  const [presetId, setPresetId] = useState("regular");
  const [personalizado, setPersonalizado] = useState<Nivel[] | null>(null);
  const [acumulado, setAcumulado] = useState(0);
  const [inicio, setInicio] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [creando, setCreando] = useState(false);

  const corriendo = inicio !== null;
  const enReposo = !corriendo && acumulado === 0;

  const presets: Preset[] = [
    ...PRESETS,
    { id: "personalizado", nombre: "Personalizado", niveles: personalizado ?? NIVELES_REGULAR },
  ];
  const niveles = (presets.find((p) => p.id === presetId) ?? PRESETS[1]).niveles;

  useFocusEffect(
    useCallback(() => {
      cargarPersonalizado().then(setPersonalizado);
      cargarPresetId().then((id) => {
        if (id) setPresetId(id);
      });
    }, [])
  );

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(id);
  }, [corriendo]);

  useEffect(() => {
    if (!corriendo) return;
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      deactivateKeepAwake();
    };
  }, [corriendo]);

  const transcurrido = acumulado + (inicio !== null ? ahora - inicio : 0);
  const estado = estadoActual(niveles, transcurrido);
  const nivel = niveles[estado.indice];
  const siguiente = niveles[estado.indice + 1];

  const indiceAnterior = useRef(estado.indice);
  const player = useAudioPlayer(SONIDO_CAMBIO);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    if (estado.indice > indiceAnterior.current) {
      Vibration.vibrate([0, 400, 200, 400]);
      player.seekTo(0);
      player.play();
    }
    indiceAnterior.current = estado.indice;
  }, [estado.indice]);

  function elegirPreset(id: string) {
    setPresetId(id);
    guardarPresetId(id);
  }

  function iniciar() {
    const t = Date.now();
    setAhora(t);
    setInicio(t);
  }

  function pausar() {
    if (inicio === null) return;
    setAcumulado(acumulado + (Date.now() - inicio));
    setInicio(null);
  }

  function reiniciar() {
    setAcumulado(0);
    setInicio(null);
  }

  function saltarA(indiceDestino: number) {
    const t = Date.now();
    setAcumulado(inicioDeNivel(niveles, indiceDestino));
    setAhora(t);
    if (inicio !== null) setInicio(t);
  }

  function confirmarSalto(indiceDestino: number, pregunta: string) {
    Alert.alert("Cambiar de nivel", pregunta, [
      { text: "Cancelar", style: "cancel" },
      { text: "Cambiar", onPress: () => saltarA(indiceDestino) },
    ]);
  }

  async function crearYAbrirSala() {
    if (creando) return;
    setCreando(true);
    try {
      const sala = await crearSala(niveles);
      router.push({ pathname: "/sala", params: { codigo: sala.codigo } });
    } catch (e) {
      console.warn("crearSala falló:", e);
      const mensaje =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Probá de nuevo.";
      Alert.alert("No se pudo crear la sala", mensaje);
    } finally {
      setCreando(false);
    }
  }

  const puedeRetroceder = transcurrido > 0;
  const puedeAvanzar = !estado.terminado && estado.indice < niveles.length - 1;

  const titulo = estado.terminado
    ? "FIN DE LA LISTA"
    : nivel.esBreak
      ? "BREAK"
      : `NIVEL ${numeroDeNivel(niveles, estado.indice)}`;

  return (
    <View style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      {enReposo && (
        <Pressable style={styles.botonMenu} onPress={() => router.back()}>
          <Text style={[styles.textoMenu, { color: tema.textoSuave }]}>← Menú</Text>
        </Pressable>
      )}

      <View style={[styles.presets, !enReposo && styles.oculto]}>
        {presets.map((p) => (
          <Pressable
            key={p.id}
            disabled={!enReposo}
            onPress={() => elegirPreset(p.id)}
            style={[
              styles.chip,
              { borderColor: tema.textoSuave },
              p.id === presetId && { backgroundColor: tema.textoSuave },
            ]}
          >
            <Text
              style={[
                styles.textoChip,
                { color: tema.textoSuave },
                p.id === presetId && { color: tema.fondo },
              ]}
            >
              {p.nombre}
            </Text>
          </Pressable>
        ))}
        <Pressable
          disabled={!enReposo}
          onPress={() => router.push("/editor")}
          style={[styles.chip, { borderColor: tema.acento }]}
        >
          <Text style={[styles.textoChip, { color: tema.acento }]}>✎ Editar</Text>
        </Pressable>
      </View>

      <Text style={[styles.etiqueta, { color: tema.textoSuave }]}>{titulo}</Text>
      <Text style={[styles.tiempo, { color: tema.textoFuerte }]}>{formatear(estado.msRestantes)}</Text>

      {!nivel.esBreak && (
        <Text style={[styles.ciegas, { color: tema.acento }]}>
          Ciegas {nivel.smallBlind} / {nivel.bigBlind}
        </Text>
      )}

      {siguiente && (
        <Text style={[styles.siguiente, { color: tema.textoSuave }]}>Siguiente: {describir(siguiente)}</Text>
      )}

      <View style={styles.botones}>
        <Pressable
          style={[styles.boton, { backgroundColor: tema.acento, borderColor: tema.acento }]}
          onPress={corriendo ? pausar : iniciar}
        >
          <Text style={[styles.textoBoton, { color: tema.acentoTexto }]}>{corriendo ? "Pausar" : "Iniciar"}</Text>
        </Pressable>

        <Pressable style={[styles.boton, { borderColor: tema.textoSuave }]} onPress={reiniciar}>
          <Text style={[styles.textoBoton, { color: tema.textoFuerte }]}>Reiniciar</Text>
        </Pressable>
      </View>

      <View style={styles.navegacion}>
        <Pressable
          disabled={!puedeRetroceder}
          style={[styles.botonNav, { borderColor: tema.textoSuave }, !puedeRetroceder && styles.deshabilitado]}
          onPress={() =>
            confirmarSalto(
              estado.terminado ? estado.indice : Math.max(0, estado.indice - 1),
              estado.terminado
                ? "¿Volver a empezar el último nivel?"
                : estado.indice === 0
                  ? "¿Volver a empezar este nivel?"
                  : "¿Volver al nivel anterior?"
            )
          }
        >
          <Text style={[styles.textoNav, { color: tema.textoSuave }]}>◀ Anterior</Text>
        </Pressable>

        <Pressable
          disabled={!puedeAvanzar}
          style={[styles.botonNav, { borderColor: tema.textoSuave }, !puedeAvanzar && styles.deshabilitado]}
          onPress={() => confirmarSalto(estado.indice + 1, "¿Pasar al nivel siguiente?")}
        >
          <Text style={[styles.textoNav, { color: tema.textoSuave }]}>Siguiente ▶</Text>
        </Pressable>
      </View>

      {enReposo && (
        <Pressable
          style={[styles.botonSala, { borderColor: tema.acento }]}
          onPress={crearYAbrirSala}
          disabled={creando}
        >
          <Text style={[styles.textoSala, { color: tema.acento }]}>
            {creando ? "Creando sala..." : "Crear sala"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center" },
  botonMenu: { position: "absolute", top: 16, left: 16, zIndex: 1 },
  textoMenu: { fontSize: 15 },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  oculto: { opacity: 0 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5 },
  textoChip: { fontSize: 16, fontWeight: "600" },
  etiqueta: { fontSize: 20, letterSpacing: 4 },
  tiempo: { fontSize: 96, fontWeight: "bold" },
  ciegas: { fontSize: 28, marginTop: 8 },
  siguiente: { fontSize: 18, marginTop: 16 },
  botones: { flexDirection: "row", gap: 16, marginTop: 48 },
  boton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, borderWidth: 2 },
  textoBoton: { fontSize: 20, fontWeight: "600" },
  navegacion: { flexDirection: "row", gap: 12, marginTop: 20 },
  botonNav: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1.5 },
  textoNav: { fontSize: 16, fontWeight: "600" },
  deshabilitado: { opacity: 0.3 },
  botonSala: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, borderWidth: 2 },
  textoSala: { fontSize: 17, fontWeight: "600" },
});