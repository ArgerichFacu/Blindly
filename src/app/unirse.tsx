import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { unirseASala } from "../lib/jugadores";

const PREFIJO_QR = "BLINDLY:";

export default function Unirse() {
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [unidoA, setUnidoA] = useState<string | null>(null);
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

  // Se llama varias veces por segundo mientras el QR esté a la vista
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
      const sala = await unirseASala(codigo, nombre);
      setUnidoA(sala.codigo);
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

  if (unidoA) {
    return (
      <SafeAreaView style={[styles.contenedor, styles.centrado]}>
        <Text style={styles.titulo}>¡Listo, {nombre.trim()}!</Text>
        <Text style={styles.codigoGrande}>{unidoA}</Text>
        <Text style={styles.ayuda}>Ya estás en la sala. Esperando que el host arranque la partida.</Text>
        <Pressable style={styles.botonSecundario} onPress={() => router.back()}>
          <Text style={styles.textoSecundario}>Volver</Text>
        </Pressable>
      </SafeAreaView>
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

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#0b3d2e" },
  centrado: { alignItems: "center", justifyContent: "center", padding: 20 },
  formulario: { flex: 1, padding: 20, justifyContent: "center" },
  titulo: { color: "#ffffff", fontSize: 26, fontWeight: "bold", marginBottom: 24 },
  etiqueta: { color: "#9fd8c0", fontSize: 14, marginBottom: 6, letterSpacing: 1 },
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
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
    alignItems: "center",
  },
  textoSecundario: { color: "#9fd8c0", fontSize: 18, fontWeight: "600" },
  codigoGrande: {
    color: "#f5c542",
    fontSize: 56,
    fontWeight: "bold",
    letterSpacing: 8,
    marginVertical: 12,
  },
  ayuda: { color: "#9fd8c0", fontSize: 16, textAlign: "center", marginTop: 8 },
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
});