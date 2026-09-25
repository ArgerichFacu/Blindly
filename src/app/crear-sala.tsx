import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { unirseASala } from "../lib/jugadores";
import { NIVELES_REGULAR } from "../lib/niveles";
import { crearSala } from "../lib/salas";
import { useTema } from "../lib/TemaContext";

export default function CrearSala() {
  const router = useRouter();
  const { tema } = useTema();
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear() {
    if (creando) return;
    if (!nombre.trim()) {
      setError("Escribí tu nombre para crear la sala.");
      return;
    }
    setError(null);
    setCreando(true);
    try {
      const sala = await crearSala(NIVELES_REGULAR);
      await unirseASala(sala.codigo, nombre);
      router.replace({ pathname: "/sala", params: { codigo: sala.codigo } });
    } catch (e) {
      console.warn("crearSala falló:", e);
      setError("No se pudo crear la sala. Probá de nuevo.");
    } finally {
      setCreando(false);
    }
  }

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <KeyboardAvoidingView style={styles.formulario} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={[styles.titulo, { color: tema.textoFuerte }]}>Crear sala</Text>

        <Text style={[styles.etiqueta, { color: tema.textoSuave }]}>Tu nombre (host)</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: tema.fondoTarjeta, borderColor: tema.textoSuave, color: tema.textoFuerte },
          ]}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Facu"
          placeholderTextColor={tema.textoSuave}
          maxLength={30}
        />

        {error && <Text style={[styles.error, { color: tema.error }]}>{error}</Text>}

        <Pressable
          style={[styles.botonPrincipal, { backgroundColor: tema.acento }]}
          onPress={crear}
          disabled={creando}
        >
          <Text style={[styles.textoPrincipal, { color: tema.acentoTexto }]}>
            {creando ? "Creando sala..." : "Crear sala"}
          </Text>
        </Pressable>

        <Pressable style={[styles.botonSecundario, { borderColor: tema.textoSuave }]} onPress={() => router.back()}>
          <Text style={[styles.textoSecundario, { color: tema.textoSuave }]}>Cancelar</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  formulario: { flex: 1, padding: 20, justifyContent: "center" },
  titulo: { fontSize: 26, fontWeight: "bold", marginBottom: 24 },
  etiqueta: { fontSize: 18, letterSpacing: 4, marginTop: 8, marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 20,
    marginBottom: 12,
  },
  error: { fontSize: 15, marginBottom: 14, textAlign: "center" },
  botonPrincipal: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  textoPrincipal: { fontSize: 20, fontWeight: "bold" },
  botonSecundario: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  textoSecundario: { fontSize: 18, fontWeight: "600" },
});