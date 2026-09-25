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
import { listarJugadores, unirseASala, type Jugador } from "../lib/jugadores";
import { describir, estadoActual, numeroDeNivel } from "../lib/niveles";
import { suscribirseASala, type Sala } from "../lib/salas";
import { supabase } from "../lib/supabase";
import { useTema } from "../lib/TemaContext";
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
  const { tema } = useTema();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [sala, setSala] = useState<Sala | null>(null);
  const [jugadorId, setJugadorId] = useState<string | null>(null);
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
      const { sala: salaUnida, jugadorId: id } = await unirseASala(codigo, nombre);
      setSala(salaUnida);
      setJugadorId(id);
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

  if (sala && jugadorId) {
    return (
      <VistaJugador
        salaInicial={sala}
        jugadorId={jugadorId}
        nombre={nombre.trim()}
        onVolver={() => router.back()}
      />
    );
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
          <Pressable style={[styles.botonCancelarCamara, { borderColor: tema.textoSuave }]} onPress={() => setEscaneando(false)}>
            <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Cancelar</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <KeyboardAvoidingView
        style={styles.formulario}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={[styles.titulo, { color: tema.textoFuerte }]}>Unirme a una sala</Text>

        <Text style={[styles.etiqueta, { color: tema.textoSuave }]}>Tu nombre</Text>
        <TextInput
          style={[styles.input, { backgroundColor: tema.fondoTarjeta, borderColor: tema.textoSuave, color: tema.textoFuerte }]}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Facu"
          placeholderTextColor={tema.textoSuave}
          maxLength={30}
        />

        <Text style={[styles.etiqueta, { color: tema.textoSuave }]}>Código de sala</Text>
        <TextInput
          style={[
            styles.input,
            styles.inputCodigo,
            { backgroundColor: tema.fondoTarjeta, borderColor: tema.textoSuave, color: tema.textoFuerte },
          ]}
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase())}
          placeholder="XXXXX"
          placeholderTextColor={tema.textoSuave}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={5}
        />

        <Pressable style={[styles.botonEscanear, { borderColor: tema.acento }]} onPress={abrirCamara}>
          <Text style={[styles.textoEscanear, { color: tema.acento }]}>📷 Escanear QR</Text>
        </Pressable>

        {aviso && <Text style={[styles.aviso, { color: tema.error }]}>{aviso}</Text>}

        <Pressable
          style={[styles.botonPrincipal, { backgroundColor: tema.acento }]}
          onPress={unirme}
          disabled={uniendo}
        >
          <Text style={[styles.textoPrincipal, { color: tema.acentoTexto }]}>
            {uniendo ? "Uniéndome..." : "Unirme"}
          </Text>
        </Pressable>

        <Pressable style={[styles.botonSecundario, { borderColor: tema.textoSuave }]} onPress={() => router.back()}>
          <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Cancelar</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function VistaJugador({
  salaInicial,
  jugadorId,
  nombre,
  onVolver,
}: {
  salaInicial: Sala;
  jugadorId: string;
  nombre: string;
  onVolver: () => void;
}) {
  const { tema } = useTema();
  const [sala, setSala] = useState(salaInicial);
  const [ahora, setAhora] = useState(Date.now());
  const [jugadores, setJugadores] = useState<Jugador[]>([]);

  useEffect(() => {
    const canalSala = suscribirseASala(salaInicial.id, setSala);

    const recargarJugadores = () => listarJugadores(salaInicial.id).then(setJugadores);
    recargarJugadores();

    const canalTodos = supabase
      .channel(`jugadores-de-${salaInicial.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "jugadores" }, recargarJugadores)
      .subscribe();

    return () => {
      supabase.removeChannel(canalSala);
      supabase.removeChannel(canalTodos);
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
    <SafeAreaView style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenidoJugador}>
        <Text style={[styles.bienvenida, { color: tema.textoFuerte }]}>{nombre}</Text>
        <Text style={[styles.codigoChico, { color: tema.textoSuave }]}>Sala {sala.codigo}</Text>

        <Text style={[styles.etiqueta, { color: tema.textoSuave }]}>{titulo}</Text>
        <Text style={[styles.tiempo, { color: tema.textoFuerte }]}>{formatear(estado.msRestantes)}</Text>

        {sala.estado !== "esperando" && !nivel.esBreak && (
          <Text style={[styles.ciegas, { color: tema.acento }]}>
            Ciegas {nivel.smallBlind} / {nivel.bigBlind}
          </Text>
        )}
        {sala.estado !== "esperando" && siguienteNivel && (
          <Text style={[styles.siguiente, { color: tema.textoSuave }]}>Siguiente: {describir(siguienteNivel)}</Text>
        )}

        <Text style={[styles.subtitulo, { color: tema.textoFuerte }]}>Mesa ({jugadores.length})</Text>
        {jugadores.map((j) => (
          <View
            key={j.id}
            style={[
              styles.filaMesa,
              { backgroundColor: tema.fondoTarjeta },
              j.id === jugadorId && { borderWidth: 1.5, borderColor: tema.acento },
            ]}
          >
            <Text
              style={[
                styles.nombre,
                { color: tema.textoFuerte },
                j.eliminado_en && { color: tema.textoSuave, textDecorationLine: "line-through" },
              ]}
            >
              {j.nombre}
              {j.user_id === sala.host_id ? " (host)" : ""}
              {j.eliminado_en ? " (eliminado)" : ""}
            </Text>
            <Text style={[styles.fichas, { color: tema.acento }]}>{j.fichas.toLocaleString("es-AR")}</Text>
          </View>
        ))}

        <Pressable style={[styles.botonSecundario, { borderColor: tema.textoSuave }]} onPress={onVolver}>
          <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Salir</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  formulario: { flex: 1, padding: 20, justifyContent: "center" },
  titulo: { fontSize: 26, fontWeight: "bold", marginBottom: 24 },
  etiqueta: { fontSize: 18, letterSpacing: 4, marginTop: 8 },
  input: { borderRadius: 10, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14, fontSize: 20, marginBottom: 20 },
  inputCodigo: { letterSpacing: 6, fontWeight: "bold", textAlign: "center", fontSize: 28, marginBottom: 12 },
  botonEscanear: { borderRadius: 12, borderWidth: 2, paddingVertical: 12, alignItems: "center", marginBottom: 16 },
  textoEscanear: { fontSize: 18, fontWeight: "600" },
  aviso: { fontSize: 15, marginBottom: 14, textAlign: "center" },
  botonPrincipal: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  textoPrincipal: { fontSize: 20, fontWeight: "bold" },
  botonSecundario: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  textoSecundario: { fontSize: 18, fontWeight: "600" },
  camara: { flex: 1, backgroundColor: "#000000" },
  capa: { ...StyleSheet.absoluteFill, justifyContent: "space-between", alignItems: "center", padding: 20 },
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
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  contenidoJugador: { flexGrow: 1, alignItems: "center", padding: 20, paddingTop: 40 },
  bienvenida: { fontSize: 24, fontWeight: "bold" },
  codigoChico: { fontSize: 16, letterSpacing: 2, marginTop: 4, marginBottom: 20 },
  tiempo: { fontSize: 64, fontWeight: "bold" },
  ciegas: { fontSize: 22, marginTop: 4 },
  siguiente: { fontSize: 15, marginTop: 10 },
  subtitulo: { fontSize: 20, fontWeight: "bold", marginTop: 32, marginBottom: 12, alignSelf: "flex-start" },
  filaMesa: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  nombre: { fontSize: 18 },
  fichas: { fontSize: 18, fontWeight: "bold" },
});