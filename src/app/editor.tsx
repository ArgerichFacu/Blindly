import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  cargarPersonalizado,
  guardarPersonalizado,
  guardarPresetId,
} from "../lib/almacenamiento";
import { NIVELES_REGULAR, type Nivel } from "../lib/niveles";

// Mientras se edita, los números se guardan como texto para poder borrar y escribir libremente
type Fila = { id: number; sb: string; bb: string; min: string; esBreak: boolean };

let contador = 0;

function aFila(n: Nivel): Fila {
  return {
    id: contador++,
    sb: String(n.smallBlind),
    bb: String(n.bigBlind),
    min: String(n.minutos),
    esBreak: !!n.esBreak,
  };
}

function numero(texto: string) {
  return Number(texto.replace(",", "."));
}

function Campo({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  onChange: (texto: string) => void;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiquetaCampo}>{etiqueta}</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={onChange}
        keyboardType="numeric"
        selectTextOnFocus
      />
    </View>
  );
}

export default function Editor() {
  const router = useRouter();
  const [filas, setFilas] = useState<Fila[]>([]);

  useEffect(() => {
    cargarPersonalizado().then((guardado) => {
      setFilas((guardado ?? NIVELES_REGULAR).map(aFila));
    });
  }, []);

  function cambiar(id: number, cambios: Partial<Fila>) {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  function borrar(id: number) {
    setFilas((prev) => prev.filter((f) => f.id !== id));
  }

  function agregar(esBreak: boolean) {
    const ultimo = [...filas].reverse().find((f) => !f.esBreak);
    const nueva: Fila = esBreak
      ? { id: contador++, sb: "0", bb: "0", min: "10", esBreak: true }
      : {
          id: contador++,
          sb: ultimo ? String(numero(ultimo.sb) * 2) : "25",
          bb: ultimo ? String(numero(ultimo.bb) * 2) : "50",
          min: ultimo ? ultimo.min : "15",
          esBreak: false,
        };
    setFilas((prev) => [...prev, nueva]);
  }

  async function guardar() {
    const resultado: Nivel[] = [];

    for (let i = 0; i < filas.length; i++) {
      const f = filas[i];
      const minutos = numero(f.min);

      if (!(minutos > 0)) {
        Alert.alert("Revisá los datos", `La fila ${i + 1} necesita una duración mayor a 0.`);
        return;
      }

      if (f.esBreak) {
        resultado.push({ smallBlind: 0, bigBlind: 0, minutos, esBreak: true });
        continue;
      }

      const sb = numero(f.sb);
      const bb = numero(f.bb);
      if (!(sb > 0) || !(bb > 0)) {
        Alert.alert("Revisá los datos", `La fila ${i + 1} necesita ciegas mayores a 0.`);
        return;
      }
      resultado.push({ smallBlind: sb, bigBlind: bb, minutos });
    }

    if (!resultado.some((n) => !n.esBreak)) {
      Alert.alert("Revisá los datos", "Agregá al menos un nivel de juego.");
      return;
    }

    try {
      await guardarPersonalizado(resultado);
      await guardarPresetId("personalizado");
      router.back();
    } catch {
      Alert.alert("No se pudo guardar", "Probá de nuevo.");
    }
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelar}>Cancelar</Text>
        </Pressable>
        <Text style={styles.titulo}>Mis niveles</Text>
        <Pressable onPress={guardar}>
          <Text style={styles.guardar}>Guardar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.lista} keyboardShouldPersistTaps="handled">
        {filas.map((f, i) => {
          const numeroNivel = filas.slice(0, i + 1).filter((x) => !x.esBreak).length;
          return (
            <View key={f.id} style={styles.fila}>
              <View style={styles.filaTitulo}>
                <Text style={styles.filaNombre}>
                  {f.esBreak ? "Break" : `Nivel ${numeroNivel}`}
                </Text>
                <Pressable onPress={() => borrar(f.id)}>
                  <Text style={styles.borrar}>Borrar</Text>
                </Pressable>
              </View>

              <View style={styles.campos}>
                {!f.esBreak && (
                  <>
                    <Campo etiqueta="Small" valor={f.sb} onChange={(t) => cambiar(f.id, { sb: t })} />
                    <Campo etiqueta="Big" valor={f.bb} onChange={(t) => cambiar(f.id, { bb: t })} />
                  </>
                )}
                <Campo etiqueta="Minutos" valor={f.min} onChange={(t) => cambiar(f.id, { min: t })} />
              </View>
            </View>
          );
        })}

        <View style={styles.agregar}>
          <Pressable style={styles.botonAgregar} onPress={() => agregar(false)}>
            <Text style={styles.textoAgregar}>+ Nivel</Text>
          </Pressable>
          <Pressable style={styles.botonAgregar} onPress={() => agregar(true)}>
            <Text style={styles.textoAgregar}>+ Break</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#0b3d2e" },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  titulo: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
  cancelar: { color: "#9fd8c0", fontSize: 17 },
  guardar: { color: "#f5c542", fontSize: 17, fontWeight: "bold" },
  lista: { padding: 16, gap: 12 },
  fila: {
    backgroundColor: "#0f4d3a",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  filaTitulo: { flexDirection: "row", justifyContent: "space-between" },
  filaNombre: { color: "#f5c542", fontSize: 16, fontWeight: "bold" },
  borrar: { color: "#ff8a80", fontSize: 15 },
  campos: { flexDirection: "row", gap: 10 },
  campo: { flex: 1 },
  etiquetaCampo: { color: "#9fd8c0", fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: "#0b3d2e",
    color: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9fd8c0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
  },
  agregar: { flexDirection: "row", gap: 12, marginTop: 4 },
  botonAgregar: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9fd8c0",
    borderStyle: "dashed",
  },
  textoAgregar: { color: "#9fd8c0", fontSize: 17, fontWeight: "600" },
});