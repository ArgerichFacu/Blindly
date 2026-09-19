import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Sala() {
  const router = useRouter();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.etiqueta}>CÓDIGO DE SALA</Text>
      <Text style={styles.codigo}>{codigo}</Text>

      <View style={styles.marcoQr}>
        <QRCode value={`BLINDLY:${codigo}`} size={220} />
      </View>

      <Text style={styles.ayuda}>Los jugadores escanean el QR o escriben el código</Text>

      <Pressable style={styles.boton} onPress={() => router.back()}>
        <Text style={styles.textoBoton}>Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#0b3d2e",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  etiqueta: { color: "#9fd8c0", fontSize: 18, letterSpacing: 4 },
  codigo: { color: "#f5c542", fontSize: 64, fontWeight: "bold", letterSpacing: 8, marginVertical: 12 },
  marcoQr: { backgroundColor: "#ffffff", padding: 16, borderRadius: 16, marginTop: 8 },
  ayuda: { color: "#9fd8c0", fontSize: 16, marginTop: 20, textAlign: "center" },
  boton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
  },
  textoBoton: { color: "#ffffff", fontSize: 20, fontWeight: "600" },
});