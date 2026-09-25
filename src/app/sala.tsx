import type { RealtimeChannel } from "@supabase/supabase-js";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { cargarDenominaciones, guardarDenominaciones } from "../lib/almacenamiento";
import { darFichas, listarJugadores, unirseASala, type Jugador } from "../lib/jugadores";
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
import { useTema } from "../lib/TemaContext";
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
  const { tema } = useTema();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();

  const [sala, setSala] = useState<Sala | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [ahora, setAhora] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Jugador | null>(null);
  const [montoFichas, setMontoFichas] = useState("");
  const [montoPersonalizado, setMontoPersonalizado] = useState("");
  const [nombrePropio, setNombrePropio] = useState("");
  const [uniendoPropio, setUniendoPropio] = useState(false);
  const [denominaciones, setDenominaciones] = useState<number[]>([25, 100, 500, 1000, 5000]);
  const [editandoValores, setEditandoValores] = useState(false);
  const [valoresTexto, setValoresTexto] = useState<string[]>([]);

  useEffect(() => {
    cargarDenominaciones().then(setDenominaciones);
  }, []);

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

  const transcurrido = sala
    ? sala.acumulado_ms +
      (sala.inicio_en
        ? Math.max(0, ahora + (ahoraServidor() - ahora) - new Date(sala.inicio_en).getTime())
        : 0)
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

  function abrirDarFichas(jugador: Jugador) {
    setEditando(jugador);
    setMontoFichas(String(jugador.fichas));
    setMontoPersonalizado("");
  }

  function aplicarMonto(delta: number) {
    const actual = Number(montoFichas.replace(",", ".")) || 0;
    setMontoFichas(String(Math.max(0, actual + delta)));
  }

  function aplicarMontoPersonalizado(signo: 1 | -1) {
    const valor = Number(montoPersonalizado.replace(",", "."));
    if (!(valor > 0)) return;
    aplicarMonto(signo * valor);
  }

  async function confirmarFichas() {
    if (!editando) return;
    const monto = Number(montoFichas.replace(",", "."));
    if (!(monto >= 0)) {
      Alert.alert("Monto inválido", "Ingresá un número mayor o igual a 0.");
      return;
    }
    try {
      await darFichas(editando.id, Math.round(monto));
      setEditando(null);
    } catch (e) {
      console.warn("darFichas falló:", e);
      Alert.alert("No se pudo guardar", "Probá de nuevo.");
    }
  }

  function abrirEditorValores() {
    setValoresTexto(denominaciones.map(String));
    setEditandoValores(true);
  }

  async function guardarValoresRapidos() {
    const nuevos = valoresTexto
      .map((t) => Number(t.replace(",", ".")))
      .filter((n) => n > 0);
    if (nuevos.length === 0) {
      Alert.alert("Necesitás al menos un monto", "Ingresá al menos un valor mayor a 0.");
      return;
    }
    await guardarDenominaciones(nuevos);
    setDenominaciones(nuevos);
    setEditandoValores(false);
  }

  async function sumarmeALaPartida() {
    if (!sala || uniendoPropio) return;
    if (!nombrePropio.trim()) {
      Alert.alert("Falta tu nombre", "Escribí cómo querés que te vean en la mesa.");
      return;
    }
    setUniendoPropio(true);
    try {
      await unirseASala(sala.codigo, nombrePropio);
    } catch (e) {
      console.warn("sumarmeALaPartida falló:", e);
      Alert.alert("No se pudo unir", "Probá de nuevo.");
    } finally {
      setUniendoPropio(false);
    }
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.contenedor, styles.centrado, { backgroundColor: tema.fondo }]}>
        <Text style={[styles.error, { color: tema.error }]}>{error}</Text>
        <Pressable style={[styles.boton, { borderColor: tema.textoSuave }]} onPress={() => router.back()}>
          <Text style={[styles.textoBoton, { color: tema.textoFuerte }]}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!sala || !estado || !nivel) {
    return (
      <SafeAreaView style={[styles.contenedor, styles.centrado, { backgroundColor: tema.fondo }]}>
        <Text style={[styles.cargando, { color: tema.textoSuave }]}>Cargando sala...</Text>
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

  const jugadorPropio = jugadores.find((j) => j.user_id === sala.host_id) ?? null;

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={[styles.etiquetaCodigo, { color: tema.textoSuave }]}>CÓDIGO DE SALA</Text>
        <Text style={[styles.codigo, { color: tema.acento }]}>{sala.codigo}</Text>

        <View style={styles.marcoQr}>
          <QRCode value={`BLINDLY:${sala.codigo}`} size={140} />
        </View>

        <Text style={[styles.etiqueta, { color: tema.textoSuave }]}>{titulo}</Text>
        <Text style={[styles.tiempo, { color: tema.textoFuerte }]}>{formatear(estado.msRestantes)}</Text>

        {!nivel.esBreak && (
          <Text style={[styles.ciegas, { color: tema.acento }]}>
            Ciegas {nivel.smallBlind} / {nivel.bigBlind}
          </Text>
        )}
        {siguienteNivel && (
          <Text style={[styles.siguiente, { color: tema.textoSuave }]}>Siguiente: {describir(siguienteNivel)}</Text>
        )}

        <View style={styles.botones}>
          <Pressable
            style={[styles.boton, { backgroundColor: tema.acento, borderColor: tema.acento }]}
            onPress={corriendo ? alPausar : alComenzar}
          >
            <Text style={[styles.textoBoton, { color: tema.acentoTexto }]}>{corriendo ? "Pausar" : "Comenzar"}</Text>
          </Pressable>
        </View>

        <View style={styles.navegacion}>
          <Pressable
            disabled={!puedeRetroceder}
            style={[styles.botonNav, { borderColor: tema.textoSuave }, !puedeRetroceder && styles.deshabilitado]}
            onPress={() =>
              confirmarSalto(
                estado.terminado ? estado.indice : Math.max(0, estado.indice - 1),
                "¿Volver al nivel anterior?"
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

        {!jugadorPropio && (
          <View style={[styles.panelSumarme, { backgroundColor: tema.fondoTarjeta }]}>
            <Text style={[styles.etiquetaFichas, { color: tema.textoSuave }]}>¿TAMBIÉN JUGÁS?</Text>
            <TextInput
              style={[
                styles.inputNombrePropio,
                { backgroundColor: tema.fondo, borderColor: tema.textoSuave, color: tema.textoFuerte },
              ]}
              value={nombrePropio}
              onChangeText={setNombrePropio}
              placeholder="Tu nombre en la mesa"
              placeholderTextColor={tema.textoSuave}
              maxLength={30}
            />
            <Pressable
              style={[styles.botonSumarme, { backgroundColor: tema.acento }]}
              onPress={sumarmeALaPartida}
              disabled={uniendoPropio}
            >
              <Text style={[styles.textoPrincipalModal, { color: tema.acentoTexto }]}>
                {uniendoPropio ? "Uniéndome..." : "Sumarme a la partida"}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.filaSubtitulo}>
          <Text style={[styles.subtitulo, { color: tema.textoFuerte }]}>Jugadores ({jugadores.length})</Text>
          <Pressable onPress={abrirEditorValores}>
            <Text style={[styles.enlaceValores, { color: tema.textoSuave }]}>Editar valores rápidos</Text>
          </Pressable>
        </View>

        {jugadores.length === 0 ? (
          <Text style={[styles.vacio, { color: tema.textoSuave }]}>Todavía no se unió nadie</Text>
        ) : (
          jugadores.map((j) => (
            <Pressable
              key={j.id}
              style={[styles.fila, { backgroundColor: tema.fondoTarjeta }]}
              onPress={() => abrirDarFichas(j)}
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
            </Pressable>
          ))
        )}

        <Pressable style={[styles.botonSecundario, { borderColor: tema.textoSuave }]} onPress={() => router.back()}>
          <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Volver</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={!!editando} transparent animationType="fade" onRequestClose={() => setEditando(null)}>
        <View style={styles.fondoModal}>
          <View style={[styles.cajaModal, { backgroundColor: tema.fondoTarjeta }]}>
            <Text style={[styles.tituloModal, { color: tema.textoFuerte }]}>Fichas de {editando?.nombre}</Text>
            <TextInput
              style={[
                styles.inputModal,
                { backgroundColor: tema.fondo, borderColor: tema.textoSuave, color: tema.textoFuerte },
              ]}
              value={montoFichas}
              onChangeText={setMontoFichas}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={tema.textoSuave}
              autoFocus
            />

            <View style={styles.filaMontos}>
              {denominaciones.map((m) => (
                <Pressable
                  key={`menos-${m}`}
                  style={[styles.botonMonto, { borderColor: tema.error }]}
                  onPress={() => aplicarMonto(-m)}
                >
                  <Text style={[styles.textoMonto, { color: tema.textoFuerte }]}>-{m}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.filaMontos}>
              {denominaciones.map((m) => (
                <Pressable
                  key={`mas-${m}`}
                  style={[styles.botonMonto, { borderColor: tema.textoSuave }]}
                  onPress={() => aplicarMonto(m)}
                >
                  <Text style={[styles.textoMonto, { color: tema.textoFuerte }]}>+{m}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.filaPersonalizado}>
              <TextInput
                style={[
                  styles.inputPersonalizado,
                  { backgroundColor: tema.fondo, borderColor: tema.textoSuave, color: tema.textoFuerte },
                ]}
                value={montoPersonalizado}
                onChangeText={setMontoPersonalizado}
                keyboardType="numeric"
                placeholder="Otro monto"
                placeholderTextColor={tema.textoSuave}
              />
              <Pressable
                style={[styles.botonMontoChico, { borderColor: tema.error }]}
                onPress={() => aplicarMontoPersonalizado(-1)}
              >
                <Text style={[styles.textoMonto, { color: tema.textoFuerte }]}>−</Text>
              </Pressable>
              <Pressable
                style={[styles.botonMontoChico, { borderColor: tema.textoSuave }]}
                onPress={() => aplicarMontoPersonalizado(1)}
              >
                <Text style={[styles.textoMonto, { color: tema.textoFuerte }]}>+</Text>
              </Pressable>
            </View>

            <View style={styles.botonesModal}>
              <Pressable
                style={[styles.botonModalSecundario, { borderColor: tema.textoSuave }]}
                onPress={() => setEditando(null)}
              >
                <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.botonModalPrincipal, { backgroundColor: tema.acento }]}
                onPress={confirmarFichas}
              >
                <Text style={[styles.textoPrincipalModal, { color: tema.acentoTexto }]}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editandoValores}
        transparent
        animationType="fade"
        onRequestClose={() => setEditandoValores(false)}
      >
        <View style={styles.fondoModal}>
          <View style={[styles.cajaModal, { backgroundColor: tema.fondoTarjeta }]}>
            <Text style={[styles.tituloModal, { color: tema.textoFuerte }]}>Valores rápidos</Text>
            {[0, 1, 2, 3, 4].map((i) => (
              <TextInput
                key={i}
                style={[
                  styles.inputValorRapido,
                  { backgroundColor: tema.fondo, borderColor: tema.textoSuave, color: tema.textoFuerte },
                ]}
                value={valoresTexto[i] ?? ""}
                onChangeText={(t) =>
                  setValoresTexto((prev) => {
                    const copia = [...prev];
                    copia[i] = t;
                    return copia;
                  })
                }
                keyboardType="numeric"
                placeholder={`Valor ${i + 1}`}
                placeholderTextColor={tema.textoSuave}
              />
            ))}
            <View style={styles.botonesModal}>
              <Pressable
                style={[styles.botonModalSecundario, { borderColor: tema.textoSuave }]}
                onPress={() => setEditandoValores(false)}
              >
                <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.botonModalPrincipal, { backgroundColor: tema.acento }]}
                onPress={guardarValoresRapidos}
              >
                <Text style={[styles.textoPrincipalModal, { color: tema.acentoTexto }]}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  centrado: { alignItems: "center", justifyContent: "center", padding: 20 },
  contenido: { alignItems: "center", padding: 20, paddingBottom: 40 },
  cargando: { fontSize: 18 },
  error: { fontSize: 16, textAlign: "center", marginBottom: 16 },
  etiquetaCodigo: { fontSize: 14, letterSpacing: 3, marginTop: 4 },
  codigo: { fontSize: 32, fontWeight: "bold", letterSpacing: 4, marginBottom: 8 },
  marcoQr: { backgroundColor: "#ffffff", padding: 10, borderRadius: 12, marginBottom: 20 },
  etiqueta: { fontSize: 18, letterSpacing: 4, marginTop: 8 },
  tiempo: { fontSize: 72, fontWeight: "bold" },
  ciegas: { fontSize: 24, marginTop: 4 },
  siguiente: { fontSize: 15, marginTop: 10 },
  botones: { flexDirection: "row", gap: 16, marginTop: 24 },
  boton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, borderWidth: 2 },
  textoBoton: { fontSize: 20, fontWeight: "600" },
  navegacion: { flexDirection: "row", gap: 12, marginTop: 16 },
  botonNav: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1.5 },
  textoNav: { fontSize: 16, fontWeight: "600" },
  deshabilitado: { opacity: 0.3 },
  panelSumarme: { alignSelf: "stretch", borderRadius: 16, padding: 20, marginTop: 28, alignItems: "center" },
  etiquetaFichas: { fontSize: 14, letterSpacing: 3 },
  inputNombrePropio: {
    alignSelf: "stretch",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 18,
    marginTop: 10,
    marginBottom: 12,
  },
  botonSumarme: { alignSelf: "stretch", alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  filaSubtitulo: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 32,
    marginBottom: 12,
  },
  subtitulo: { fontSize: 20, fontWeight: "bold" },
  enlaceValores: { fontSize: 13, textDecorationLine: "underline" },
  vacio: { fontSize: 16 },
  fila: {
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
  botonSecundario: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, borderWidth: 2 },
  textoSecundario: { fontSize: 18, fontWeight: "600" },
  fondoModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  cajaModal: { borderRadius: 16, padding: 24, width: "85%" },
  tituloModal: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  inputModal: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  filaMontos: { flexDirection: "row", gap: 6, marginBottom: 8 },
  botonMonto: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  textoMonto: { fontSize: 13, fontWeight: "600" },
  filaPersonalizado: { flexDirection: "row", gap: 6, marginBottom: 14, alignItems: "center" },
  inputPersonalizado: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  botonMontoChico: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1.5,
  },
  inputValorRapido: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 18,
    marginBottom: 10,
  },
  botonesModal: { flexDirection: "row", gap: 12, marginTop: 8 },
  botonModalSecundario: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 2 },
  botonModalPrincipal: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  textoPrincipalModal: { fontSize: 16, fontWeight: "bold" },
});