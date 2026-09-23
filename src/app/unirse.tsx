import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { CameraView, useCameraPermissions } from "expo-camera";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { unirseASala } from "../lib/jugadores";
import { describir, estadoActual, numeroDeNivel } from "../lib/niveles";
import { suscribirseASala, type Sala } from "../lib/salas";
import { supabase } from "../lib/supabase";
import { ahoraServidor, sincronizarReloj } from "../lib/tiempoServidor";

const PREFIJO_QR = "BLINDLY:";
const SONIDO_CAMBIO = require("../../assets/sounds/campana.wav");

function formatear(ms: number) {
  const totalSegundos = Math.ceil(ms / 1000);
  const min = Math.floor(totalSegundos / 60);
  const seg = totalSegundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

export default function Unirse() {
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [sala, setSala] = useState<Sala | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const ultimoLeido = useRef(0);

  async function abrirCamara() {
    setAviso(null);
    if (!permiso?.granted) {
      const respuesta = await pedirPermiso();
      if (!respuesta.granted) {
        setAviso("Sin permiso de cámara no se puede escanear. Podés escribir el código a mano.");
        return;
      }
    }
    setEscaneando(true);
  }

  function alLeerQr({ data }: { data: string }) {
    const ahora = Date.now();
    if (ahora - ultimoLeido.current < 1500) return;
    ultimoLeido.current = ahora;

    if (data.startsWith(PREFIJO_QR)) {
      setCodigo(data.slice(PREFIJO_QR.length).trim().toUpperCase());
      setAviso(null);
      setEscaneando(false);
    } else {
      setAviso("Ese QR no es de una sala de Blindly.");
    }
  }

  async function unirme() {
    if (uniendo) return;
    if (!nombre.trim()) {
      setAviso("Escribí cómo querés que te vean en la mesa.");
      return;
    }
    if (!codigo.trim()) {
      setAviso("Escribí el código de la sala o escaneá el QR del host.");
      return;
    }

    setAviso(null);
    setUniendo(true);
    try {
      await sincronizarReloj();
      const salaUnida = await unirseASala(codigo, nombre);
      setSala(salaUnida);
    } catch (e) {
      setAviso(
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "No se pudo unir. Probá de nuevo."
      );
    } finally {
      setUniendo(false);
    }
  }

  // Ya unido: se suscribe a la sala para ver el reloj en vivo
  if (sala) {
    return <VistaJugador salaInicial={sala} nombre={nombre.trim()} onVolver={() => router.back()} />;
  }

  if (escaneando) {
    return (
      <View style={styles.camara}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={alLeerQr}
        />
        <SafeAreaView style={styles.capa}>
          <View style={styles.cartel}>
            <Text style={styles.cartelTexto}>Apuntá al QR de la sala</Text>
            {aviso && <Text style={styles.cartelAviso}>{aviso}</Text>}
          </View>
          <Pressable style={styles.botonCancelarCamara} onPress={() => setEscaneando(false)}>
            <Text style={styles.textoSecundario}>Cancelar</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <KeyboardAvoidingView
        style={styles.formulario}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.titulo}>Unirme a una sala</Text>

        <Text style={styles.etiqueta}>Tu nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Facu"
          placeholderTextColor="#5f9c86"
          maxLength={30}
        />

        <Text style={styles.etiqueta}>Código de sala</Text>
        <TextInput
          style={[styles.input, styles.inputCodigo]}
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase())}
          placeholder="XXXXX"
          placeholderTextColor="#5f9c86"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={5}
        />

        <Pressable style={styles.botonEscanear} onPress={abrirCamara}>
          <Text style={styles.textoEscanear}>📷 Escanear QR</Text>
        </Pressable>

        {aviso && <Text style={styles.aviso}>{aviso}</Text>}

        <Pressable style={styles.botonPrincipal} onPress={unirme} disabled={uniendo}>
          <Text style={styles.textoPrincipal}>{uniendo ? "Uniéndome..." : "Unirme"}</Text>
        </Pressable>

        <Pressable style={styles.botonSecundario} onPress={() => router.back()}>
          <Text style={styles.textoSecundario}>Cancelar</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Pantalla que ve el jugador una vez unido: el reloj de la sala en vivo
function VistaJugador({
  salaInicial,
  nombre,
  onVolver,
}: {
  salaInicial: Sala;
  nombre: string;
  onVolver: () => void;
}) {
  const [sala, setSala] = useState(salaInicial);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    const canal = suscribirseASala(salaInicial.id, setSala);
    return () => {
      supabase.removeChannel(canal);
    };
  }, [salaInicial.id]);

  const corriendo = sala.estado === "jugando";

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

  const transcurrido =
    sala.acumulado_ms +
    (sala.inicio_en
      ? Math.max(0, ahora + (ahoraServidor() - ahora) - new Date(sala.inicio_en).getTime())
      : 0);
  const estado = estadoActual(sala.niveles, transcurrido);
  const nivel = sala.niveles[estado.indice];
  const siguienteNivel = sala.niveles[estado.indice + 1];

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

  const titulo =
    sala.estado === "esperando"
      ? "ESPERANDO AL HOST"
      : estado.terminado
        ? "FIN DE LA LISTA"
        : nivel.esBreak
          ? "BREAK"
          : `NIVEL ${numeroDeNivel(sala.niveles, estado.indice)}`;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenidoJugador}>
        <Text style={styles.bienvenida}>{nombre}</Text>
        <Text style={styles.codigoChico}>Sala {sala.codigo}</Text>

        <Text style={styles.etiqueta}>{titulo}</Text>
        <Text style={styles.tiempo}>{formatear(estado.msRestantes)}</Text>

        {sala.estado !== "esperando" && !nivel.esBreak && (
          <Text style={styles.ciegas}>
            Ciegas {nivel.smallBlind} / {nivel.bigBlind}
          </Text>
        )}
        {sala.estado !== "esperando" && siguienteNivel && (
          <Text style={styles.siguiente}>Siguiente: {describir(siguienteNivel)}</Text>
        )}

        <Pressable style={styles.botonSecundario} onPress={onVolver}>
          <Text style={styles.textoSecundario}>Salir</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#0b3d2e" },
  formulario: { flex: 1, padding: 20, justifyContent: "center" },
  titulo: { color: "#ffffff", fontSize: 26, fontWeight: "bold", marginBottom: 24 },
  etiqueta: { color: "#9fd8c0", fontSize: 18, letterSpacing: 4, marginTop: 8 },
  input: {
    backgroundColor: "#0f4d3a",
    color: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9fd8c0",
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 20,
    marginBottom: 20,
  },
  inputCodigo: { letterSpacing: 6, fontWeight: "bold", textAlign: "center", fontSize: 28, marginBottom: 12 },
  botonEscanear: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f5c542",
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  textoEscanear: { color: "#f5c542", fontSize: 18, fontWeight: "600" },
  aviso: { color: "#ff8a80", fontSize: 15, marginBottom: 14, textAlign: "center" },
  botonPrincipal: {
    backgroundColor: "#f5c542",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  textoPrincipal: { color: "#0b3d2e", fontSize: 20, fontWeight: "bold" },
  botonSecundario: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
    alignItems: "center",
  },
  textoSecundario: { color: "#9fd8c0", fontSize: 18, fontWeight: "600" },
  camara: { flex: 1, backgroundColor: "#000000" },
  capa: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  cartel: {
    backgroundColor: "rgba(11, 61, 46, 0.85)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  cartelTexto: { color: "#ffffff", fontSize: 18, fontWeight: "600" },
  cartelAviso: { color: "#ff8a80", fontSize: 15, marginTop: 6, textAlign: "center" },
  botonCancelarCamara: {
    backgroundColor: "rgba(11, 61, 46, 0.85)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  contenidoJugador: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  bienvenida: { color: "#ffffff", fontSize: 24, fontWeight: "bold" },
  codigoChico: { color: "#9fd8c0", fontSize: 16, letterSpacing: 2, marginTop: 4, marginBottom: 24 },
  tiempo: { color: "#ffffff", fontSize: 80, fontWeight: "bold" },
  ciegas: { color: "#f5c542", fontSize: 26, marginTop: 6 },
  siguiente: { color: "#9fd8c0", fontSize: 16, marginTop: 14 },
});