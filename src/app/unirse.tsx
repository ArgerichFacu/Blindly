import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View } from "react-native";
import { Pantalla, Boton, Texto, Campo } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { unirseASala } from "../lib/jugadores";
export default function Unirse() {
  const router = useRouter(),
    { t, mensajeError } = usePreferencias();
  const [nombre, setNombre] = useState(""),
    [codigo, setCodigo] = useState(""),
    [error, setError] = useState(""),
    [ocupado, setOcupado] = useState(false),
    [camara, setCamara] = useState(false);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const bloqueo = useRef(false),
    escaneado = useRef(false);
  async function entrar() {
    if (bloqueo.current) return;
    if (!nombre.trim() || !codigo.trim()) {
      setError(t("Completá tu nombre y el código."));
      return;
    }
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    try {
      const { sala } = await unirseASala(codigo, nombre);
      router.replace({ pathname: "/sala", params: { codigo: sala.codigo } });
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  async function abrir() {
    const respuesta = permiso?.granted ? permiso : await pedirPermiso();
    if (respuesta.granted) {
      escaneado.current = false;
      setCamara(true);
    } else setError(t("Permitir cámara"));
  }
  return (
    <Pantalla
      titulo={t("Unirme a una sala")}
      subtitulo={t("Tu lugar en la mesa te espera.")}
    >
      <Campo
        etiqueta={t("Tu nombre")}
        value={nombre}
        onChangeText={setNombre}
        maxLength={30}
      />
      <Campo
        etiqueta={t("Código de sala")}
        value={codigo}
        onChangeText={(s) =>
          setCodigo(s.toUpperCase().replace(/[^A-Z2-9]/g, ""))
        }
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={5}
        placeholder="ABCDE"
        style={{ fontSize: 26, letterSpacing: 6, fontWeight: "700" }}
      />
      {camara ? (
        <>
          <Texto>{t("Apuntá al QR de Blindly")}</Texto>
          <View style={{ height: 300, overflow: "hidden", borderRadius: 16 }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => {
                if (escaneado.current) return;
                if (!/^BLINDLY:[A-Z2-9]{5}$/.test(data)) {
                  setError(t("QR inválido"));
                  return;
                }
                escaneado.current = true;
                setCodigo(data.slice(8));
                setCamara(false);
                setError("");
              }}
            />
          </View>
          <Boton
            titulo={t("Cancelar")}
            secundario
            onPress={() => setCamara(false)}
          />
        </>
      ) : (
        <Boton titulo={t("Escanear QR")} secundario onPress={abrir} />
      )}
      {!!error && <Texto>{error}</Texto>}
      <Boton
        titulo={t(ocupado ? "Cargando…" : "Unirme")}
        disabled={ocupado || !nombre.trim() || codigo.length !== 5}
        onPress={entrar}
      />
    </Pantalla>
  );
}
