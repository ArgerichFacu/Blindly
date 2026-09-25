import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTema } from "../lib/TemaContext";

export default function Menu() {
  const router = useRouter();
  const { tema } = useTema();

  return (
    <View style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <Text style={[styles.titulo, { color: tema.textoFuerte }]}>Blindly</Text>
      <Text style={[styles.subtitulo, { color: tema.textoSuave }]}>Poker presencial, sin vueltas</Text>

      <View style={styles.botones}>
        <Pressable
          style={[styles.boton, { backgroundColor: tema.acento }]}
          onPress={() => router.push("/crear-sala")}
        >
          <Text style={[styles.textoBoton, { color: tema.acentoTexto }]}>Crear sala</Text>
        </Pressable>

        <Pressable
          style={[styles.boton, styles.botonSecundario, { borderColor: tema.textoSuave }]}
          onPress={() => router.push("/unirse")}
        >
          <Text style={[styles.textoBoton, { color: tema.textoFuerte }]}>Unirme</Text>
        </Pressable>

        <Pressable
          style={[styles.boton, styles.botonSecundario, { borderColor: tema.textoSuave }]}
          onPress={() => router.push("/opciones")}
        >
          <Text style={[styles.textoBoton, { color: tema.textoFuerte }]}>Opciones</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  titulo: { fontSize: 40, fontWeight: "bold", letterSpacing: 2 },
  subtitulo: { fontSize: 15, marginTop: 6, marginBottom: 48 },
  botones: { alignSelf: "stretch", gap: 14 },
  boton: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  botonSecundario: { borderWidth: 2 },
  textoBoton: { fontSize: 19, fontWeight: "700" },
});