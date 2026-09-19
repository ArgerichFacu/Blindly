import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { listarJugadores, type Jugador } from "../lib/jugadores";
import { supabase } from "../lib/supabase";

export default function Sala() {
  const router = useRouter();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    let canal: RealtimeChannel | null = null;

    async function iniciar() {
      const { data: sala, error: errorSala } = await supabase
        .from("salas")
        .select("id")
        .eq("codigo", codigo)
        .maybeSingle();

      if (!activo) return;
      if (errorSala || !sala) {
        setError("No se pudo cargar la sala.");
        return;
      }

      const recargar = () =>
        listarJugadores(sala.id)
          .then((lista) => {
            if (activo) setJugadores(lista);
          })
          .catch(() => {
            if (activo) setError("No se pudo cargar la lista de jugadores.");
          });

      recargar();

      // Cada vez que cambia algo en la tabla de jugadores, se vuelve a pedir la lista
      canal = supabase
        .channel(`jugadores-de-${sala.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "jugadores" }, recargar)
        .subscribe();
    }

    iniciar();

    return () => {
      activo = false;
      if (canal) supabase.removeChannel(canal);
    };
  }, [codigo]);

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.etiqueta}>CÓDIGO DE SALA</Text>
        <Text style={styles.codigo}>{codigo}</Text>

        <View style={styles.marcoQr}>
          <QRCode value={`BLINDLY:${codigo}`} size={180} />
        </View>

        <Text style={styles.subtitulo}>Jugadores ({jugadores.length})</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {jugadores.length === 0 && !error ? (
          <Text style={styles.vacio}>Todavía no se unió nadie</Text>
        ) : (
          jugadores.map((j) => (
            <View key={j.id} style={styles.fila}>
              <Text style={styles.nombre}>{j.nombre}</Text>
            </View>
          ))
        )}

        <Pressable style={styles.boton} onPress={() => router.back()}>
          <Text style={styles.textoBoton}>Volver</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#0b3d2e" },
  contenido: { alignItems: "center", padding: 20, paddingBottom: 40 },
  etiqueta: { color: "#9fd8c0", fontSize: 18, letterSpacing: 4, marginTop: 8 },
  codigo: { color: "#f5c542", fontSize: 56, fontWeight: "bold", letterSpacing: 8, marginVertical: 8 },
  marcoQr: { backgroundColor: "#ffffff", padding: 14, borderRadius: 16, marginTop: 4 },
  subtitulo: { color: "#ffffff", fontSize: 20, fontWeight: "bold", marginTop: 28, marginBottom: 12 },
  vacio: { color: "#9fd8c0", fontSize: 16 },
  error: { color: "#ff8a80", fontSize: 15, marginBottom: 8 },
  fila: {
    alignSelf: "stretch",
    backgroundColor: "#0f4d3a",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  nombre: { color: "#ffffff", fontSize: 18 },
  boton: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
  },
  textoBoton: { color: "#ffffff", fontSize: 20, fontWeight: "600" },
});