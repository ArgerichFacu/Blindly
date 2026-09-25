import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cargarSonidoActivado, guardarSonidoActivado } from "../lib/almacenamiento";
import { useTema } from "../lib/TemaContext";
import { TEMAS, type TemaId } from "../lib/temas";

const TERMINOS =
  "Blindly es una herramienta para organizar partidas de poker presenciales entre amigos. La app no gestiona dinero real ni garantiza resultados. El uso de la app es responsabilidad de quienes juegan.";

export default function Opciones() {
  const router = useRouter();
  const { tema, elegirTema } = useTema();
  const [sonido, setSonido] = useState(true);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);

  useEffect(() => {
    cargarSonidoActivado().then(setSonido);
  }, []);

  function cambiarSonido(valor: boolean) {
    setSonido(valor);
    guardarSonidoActivado(valor);
  }

  function idiomaNoDisponible(idioma: string) {
    Alert.alert("Próximamente", `${idioma} todavía no está disponible. Por ahora la app está en español.`);
  }

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={[styles.titulo, { color: tema.textoFuerte }]}>Opciones</Text>

        <View style={styles.seccion}>
          <Text style={[styles.etiquetaSeccion, { color: tema.textoSuave }]}>SONIDO</Text>
          <View style={[styles.fila, { backgroundColor: tema.fondoTarjeta }]}>
            <Text style={[styles.filaTexto, { color: tema.textoFuerte }]}>Campana de cambio de nivel</Text>
            <Switch value={sonido} onValueChange={cambiarSonido} />
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={[styles.etiquetaSeccion, { color: tema.textoSuave }]}>IDIOMA</Text>
          <View style={styles.filaBotones}>
            <View style={[styles.chip, { borderColor: tema.acento, backgroundColor: tema.acento }]}>
              <Text style={[styles.chipTexto, { color: tema.acentoTexto }]}>Español</Text>
            </View>
            <Pressable
              style={[styles.chip, { borderColor: tema.textoSuave }]}
              onPress={() => idiomaNoDisponible("English")}
            >
              <Text style={[styles.chipTexto, { color: tema.textoSuave }]}>English</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, { borderColor: tema.textoSuave }]}
              onPress={() => idiomaNoDisponible("Português")}
            >
              <Text style={[styles.chipTexto, { color: tema.textoSuave }]}>Português</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={[styles.etiquetaSeccion, { color: tema.textoSuave }]}>TEMA</Text>
          <View style={styles.filaBotones}>
            {TEMAS.map((t) => (
              <Pressable
                key={t.id}
                style={[
                  styles.chipTema,
                  { backgroundColor: t.fondo, borderColor: t.id === tema.id ? t.acento : "transparent" },
                ]}
                onPress={() => elegirTema(t.id as TemaId)}
              >
                <View style={[styles.puntoAcento, { backgroundColor: t.acento }]} />
                <Text style={[styles.chipTemaTexto, { color: t.textoFuerte }]}>{t.nombre}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.seccion}>
          <Pressable onPress={() => setMostrarTerminos((v) => !v)}>
            <Text style={[styles.enlace, { color: tema.textoSuave }]}>
              {mostrarTerminos ? "Ocultar" : "Ver"} términos y condiciones
            </Text>
          </Pressable>
          {mostrarTerminos && (
            <Text style={[styles.textoTerminos, { color: tema.textoSuave }]}>{TERMINOS}</Text>
          )}
        </View>

        <Pressable style={[styles.botonVolver, { borderColor: tema.textoSuave }]} onPress={() => router.back()}>
          <Text style={[styles.textoVolver, { color: tema.textoSuave }]}>Volver</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { padding: 20, paddingTop: 32 },
  titulo: { fontSize: 28, fontWeight: "bold", marginBottom: 28 },
  seccion: { marginBottom: 28 },
  etiquetaSeccion: { fontSize: 13, letterSpacing: 2, marginBottom: 10 },
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 14 },
  filaTexto: { fontSize: 16 },
  filaBotones: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5 },
  chipTexto: { fontSize: 14, fontWeight: "600" },
  chipTema: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  puntoAcento: { width: 14, height: 14, borderRadius: 7 },
  chipTemaTexto: { fontSize: 14, fontWeight: "600" },
  enlace: { fontSize: 15, textDecorationLine: "underline" },
  textoTerminos: { fontSize: 13, lineHeight: 20, marginTop: 12 },
  botonVolver: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
  },
  textoVolver: { fontSize: 17, fontWeight: "600" },
});