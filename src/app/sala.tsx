import type { RealtimeChannel } from "@supabase/supabase-js";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { listarJugadores, type Jugador } from "../lib/jugadores";
import { describir, estadoActual, numeroDeNivel } from "../lib/niveles";
import {
  comenzarSala,
  obtenerSalaPorCodigo,
  pausarSala,
  saltarNivelSala,
  suscribirseASala,
  type Sala,
} from "../lib/salas";
import { supabase } from "../lib/supabase";
import { ahoraServidor, sincronizarReloj } from "../lib/tiempoServidor";

const SONIDO_CAMBIO = require("../../assets/sounds/campana.wav");

function formatear(ms: number) {
  const totalSegundos = Math.ceil(ms / 1000);
  const min = Math.floor(totalSegundos / 60);
  const seg = totalSegundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

export default function SalaHost() {
  const router = useRouter();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();

  const [sala, setSala] = useState<Sala | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [ahora, setAhora] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Cargar la sala, sincronizar el reloj y suscribirse a los cambios
  useEffect(() => {
    if (!codigo) return;
    let activo = true;
    let canalSala: RealtimeChannel | null = null;
    let canalJugadores: RealtimeChannel | null = null;

    async function iniciar() {
      await sincronizarReloj();

      const salaActual = await obtenerSalaPorCodigo(codigo).catch(() => null);
      if (!activo) return;
      if (!salaActual) {
        setError("No se pudo cargar la sala.");
        return;
      }
      setSala(salaActual);

      const recargarJugadores = () =>
        listarJugadores(salaActual.id).then((lista) => {
          if (activo) setJugadores(lista);
        });
      recargarJugadores();

      canalJugadores = supabase
        .channel(`jugadores-de-${salaActual.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "jugadores" }, recargarJugadores)
        .subscribe();

      canalSala = suscribirseASala(salaActual.id, (nueva) => {
        if (activo) setSala(nueva);
      });
    }

    iniciar().catch(() => setError("No se pudo cargar la sala."));

    return () => {
      activo = false;
      if (canalSala) supabase.removeChannel(canalSala);
      if (canalJugadores) supabase.removeChannel(canalJugadores);
    };
  }, [codigo]);

  const corriendo = sala?.estado === "jugando";

  // Refresca la pantalla cuatro veces por segundo mientras el reloj corre
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(id);
  }, [corriendo]);

  useEffect(() => {
    if (!corriendo) return;
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, [corriendo]);

  const transcurrido = sala
    ? sala.acumulado_ms + (sala.inicio_en ? Math.max(0, ahora + (ahoraServidor() - ahora) - new Date(sala.inicio_en).getTime()) : 0)
    : 0;
  const estado = sala ? estadoActual(sala.niveles, transcurrido) : null;
  const nivel = sala && estado ? sala.niveles[estado.indice] : null;
  const siguienteNivel = sala && estado ? sala.niveles[estado.indice + 1] : null;

  const indiceAnterior = useRef(estado?.indice ?? 0);
  const player = useAudioPlayer(SONIDO_CAMBIO);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    if (!estado) return;
    if (estado.indice > indiceAnterior.current) {
      Vibration.vibrate([0, 400, 200, 400]);
      player.seekTo(0);
      player.play();
    }
    indiceAnterior.current = estado.indice;
  }, [estado?.indice]);

  async function alComenzar() {
    if (!sala) return;
    try {
      await comenzarSala(sala);
    } catch (e) {
      console.warn("comenzarSala falló:", e);
      Alert.alert("No se pudo iniciar el reloj", "Probá de nuevo.");
    }
  }

  async function alPausar() {
    if (!sala) return;
    try {
      await pausarSala(sala);
    } catch (e) {
      console.warn("pausarSala falló:", e);
      Alert.alert("No se pudo pausar el reloj", "Probá de nuevo.");
    }
  }

  function confirmarSalto(indiceDestino: number, pregunta: string) {
    if (!sala) return;
    Alert.alert("Cambiar de nivel", pregunta, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cambiar",
        onPress: () => saltarNivelSala(sala, indiceDestino).catch(() => Alert.alert("No se pudo cambiar de nivel")),
      },
    ]);
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.contenedor, styles.centrado]}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.boton} onPress={() => router.back()}>
          <Text style={styles.textoBoton}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!sala || !estado || !nivel) {
    return (
      <SafeAreaView style={[styles.contenedor, styles.centrado]}>
        <Text style={styles.cargando}>Cargando sala...</Text>
      </SafeAreaView>
    );
  }

  const puedeRetroceder = transcurrido > 0;
  const puedeAvanzar = !estado.terminado && estado.indice < sala.niveles.length - 1;
  const titulo = estado.terminado
    ? "FIN DE LA LISTA"
    : nivel.esBreak
      ? "BREAK"
      : `NIVEL ${numeroDeNivel(sala.niveles, estado.indice)}`;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.etiquetaCodigo}>CÓDIGO DE SALA</Text>
        <Text style={styles.codigo}>{sala.codigo}</Text>

        <View style={styles.marcoQr}>
          <QRCode value={`BLINDLY:${sala.codigo}`} size={140} />
        </View>

        <Text style={styles.etiqueta}>{titulo}</Text>
        <Text style={styles.tiempo}>{formatear(estado.msRestantes)}</Text>

        {!nivel.esBreak && (
          <Text style={styles.ciegas}>
            Ciegas {nivel.smallBlind} / {nivel.bigBlind}
          </Text>
        )}
        {siguienteNivel && (
          <Text style={styles.siguiente}>Siguiente: {describir(siguienteNivel)}</Text>
        )}

        <View style={styles.botones}>
          <Pressable
            style={[styles.boton, styles.botonPrincipal]}
            onPress={corriendo ? alPausar : alComenzar}
          >
            <Text style={styles.textoBoton}>{corriendo ? "Pausar" : "Comenzar"}</Text>
          </Pressable>
        </View>

        <View style={styles.navegacion}>
          <Pressable
            disabled={!puedeRetroceder}
            style={[styles.botonNav, !puedeRetroceder && styles.deshabilitado]}
            onPress={() =>
              confirmarSalto(
                estado.terminado ? estado.indice : Math.max(0, estado.indice - 1),
                "¿Volver al nivel anterior?"
              )
            }
          >
            <Text style={styles.textoNav}>◀ Anterior</Text>
          </Pressable>

          <Pressable
            disabled={!puedeAvanzar}
            style={[styles.botonNav, !puedeAvanzar && styles.deshabilitado]}
            onPress={() => confirmarSalto(estado.indice + 1, "¿Pasar al nivel siguiente?")}
          >
            <Text style={styles.textoNav}>Siguiente ▶</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitulo}>Jugadores ({jugadores.length})</Text>
        {jugadores.length === 0 ? (
          <Text style={styles.vacio}>Todavía no se unió nadie</Text>
        ) : (
          jugadores.map((j) => (
            <View key={j.id} style={styles.fila}>
              <Text style={styles.nombre}>{j.nombre}</Text>
            </View>
          ))
        )}

        <Pressable style={styles.botonSecundario} onPress={() => router.back()}>
          <Text style={styles.textoSecundario}>Volver</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#0b3d2e" },
  centrado: { alignItems: "center", justifyContent: "center", padding: 20 },
  contenido: { alignItems: "center", padding: 20, paddingBottom: 40 },
  cargando: { color: "#9fd8c0", fontSize: 18 },
  error: { color: "#ff8a80", fontSize: 16, textAlign: "center", marginBottom: 16 },
  etiquetaCodigo: { color: "#9fd8c0", fontSize: 14, letterSpacing: 3, marginTop: 4 },
  codigo: { color: "#f5c542", fontSize: 32, fontWeight: "bold", letterSpacing: 4, marginBottom: 8 },
  marcoQr: { backgroundColor: "#ffffff", padding: 10, borderRadius: 12, marginBottom: 20 },
  etiqueta: { color: "#9fd8c0", fontSize: 18, letterSpacing: 4, marginTop: 8 },
  tiempo: { color: "#ffffff", fontSize: 72, fontWeight: "bold" },
  ciegas: { color: "#f5c542", fontSize: 24, marginTop: 4 },
  siguiente: { color: "#9fd8c0", fontSize: 15, marginTop: 10 },
  botones: { flexDirection: "row", gap: 16, marginTop: 24 },
  boton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
  },
  botonPrincipal: { backgroundColor: "#f5c542", borderColor: "#f5c542" },
  textoBoton: { color: "#ffffff", fontSize: 20, fontWeight: "600" },
  navegacion: { flexDirection: "row", gap: 12, marginTop: 16 },
  botonNav: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#9fd8c0",
  },
  textoNav: { color: "#9fd8c0", fontSize: 16, fontWeight: "600" },
  deshabilitado: { opacity: 0.3 },
  subtitulo: { color: "#ffffff", fontSize: 20, fontWeight: "bold", marginTop: 32, marginBottom: 12 },
  vacio: { color: "#9fd8c0", fontSize: 16 },
  fila: {
    alignSelf: "stretch",
    backgroundColor: "#0f4d3a",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  nombre: { color: "#ffffff", fontSize: 18 },
  botonSecundario: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
  },
  textoSecundario: { color: "#9fd8c0", fontSize: 18, fontWeight: "600" },
});