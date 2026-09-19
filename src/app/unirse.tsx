import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { unirseASala } from "../lib/jugadores";

export default function Unirse() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [unidoA, setUnidoA] = useState<string | null>(null);

  async function unirme() {
    if (uniendo) return;
    if (!nombre.trim()) {
      Alert.alert("Falta tu nombre", "Escribí cómo querés que te vean en la mesa.");
      return;
    }
    if (!codigo.trim()) {
      Alert.alert("Falta el código", "Escribí el código que muestra el host.");
      return;
    }

    setUniendo(true);
    try {
      const sala = await unirseASala(codigo, nombre);
      setUnidoA(sala.codigo);
    } catch (e) {
      const mensaje =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Probá de nuevo.";
      Alert.alert("No se pudo unir", mensaje);
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
  inputCodigo: { letterSpacing: 6, fontWeight: "bold", textAlign: "center", fontSize: 28 },
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
});