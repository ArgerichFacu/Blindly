import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Boton,
  Campo,
  Pantalla,
  Tarjeta,
  Texto,
} from "../components/Controles";
import {
  aceptarInvitacionLiga,
  consultarInvitacionLiga,
  type InvitacionLiga,
} from "../lib/ligas";
import {
  codigoInvitacion,
  guardarInvitacion,
  invitacionPendiente,
  borrarInvitacion,
} from "../lib/invitaciones";
import { vibrarMomento } from "../lib/hapticos";
import { useIdentidad } from "../lib/useIdentidad";
import { usePreferencias } from "../lib/Preferencias";

export default function UnirseClub() {
  const { codigo: inicial } = useLocalSearchParams<{ codigo?: string }>();
  const router = useRouter(),
    { t, mensajeError, preferencias } = usePreferencias(),
    identidad = useIdentidad();
  const [codigo, setCodigo] = useState(
    typeof inicial === "string" ? (codigoInvitacion(inicial) ?? "") : "",
  );
  const [nombre, setNombre] = useState(""),
    [vista, setVista] = useState<InvitacionLiga | null>(null);
  const [error, setError] = useState(""),
    [ocupado, setOcupado] = useState(false),
    [camara, setCamara] = useState(false);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const bloqueo = useRef(false),
    escaneado = useRef(false);
  const traducirError = useRef(mensajeError);
  useEffect(() => {
    traducirError.current = mensajeError;
  }, [mensajeError]);
  // Persistir antes de ir a auth o abandonar la app. Nunca implica consentir el ingreso.
  useEffect(() => {
    const c = codigoInvitacion(codigo);
    if (c) void guardarInvitacion(c).catch(e => setError(traducirError.current(e)));
  }, [codigo]);
  useEffect(() => {
    const c = codigoInvitacion(codigo);
    if (!c || identidad.cargando || !identidad.recuperable) return;
    let vivo = true;
    void consultarInvitacionLiga(c).then(async resultado => {
      if (!vivo) return;
      if (resultado.ya_miembro) {
        await borrarInvitacion(c);
        if (vivo) router.replace({ pathname: "/liga", params: { id: resultado.liga_id } });
      } else setVista(resultado);
    }).catch(e => { if (vivo) setError(traducirError.current(e)); });
    return () => { vivo = false; };
  }, [codigo, identidad.cargando, identidad.recuperable, router]);
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      if (!inicial)
        void invitacionPendiente()
          .then((v) => {
            if (vivo && v) setCodigo((actual) => actual || v);
          })
          .catch((e) => {
            if (vivo) setError(traducirError.current(e));
          });
      else if (typeof inicial === "string") {
        setCodigo(codigoInvitacion(inicial) ?? "");
        setVista(null);
      }
      return () => {
        vivo = false;
      };
    }, [inicial]),
  );
  async function ejecutar(accion: (c: string) => Promise<void>) {
    if (bloqueo.current) return;
    const c = codigoInvitacion(codigo);
    if (!c) {
      setError(t("La invitación no es válida o venció."));
      return;
    }
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    try {
      await guardarInvitacion(c);
      await accion(c);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  async function abrirCamara() {
    try {
      const p = permiso?.granted ? permiso : await pedirPermiso();
      if (!p.granted) {
        setError(t("Permitir cámara"));
        return;
      }
      escaneado.current = false;
      setCamara(true);
    } catch (e) {
      setError(mensajeError(e));
    }
  }
  return (
    <Pantalla
      titulo={t("Unirme a un club")}
      subtitulo={t("Tu grupo, tus temporadas.")}
    >
      <Campo
        etiqueta={t("Código o enlace de invitación")}
        value={codigo}
        onChangeText={(v) => {
          setCodigo(v);
          setVista(null);
          setError("");
        }}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!ocupado}
        maxLength={600}
      />
      {camara ? (
        <>
          <Texto>{t("Apuntá al QR de Blindly")}</Texto>
          <View style={{ height: 280, overflow: "hidden", borderRadius: 16 }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => {
                if (escaneado.current) return;
                const c = codigoInvitacion(data);
                if (!c) {
                  setError(t("QR inválido"));
                  return;
                }
                escaneado.current = true;
                setCodigo(c);
                setVista(null);
                setError("");
                setCamara(false);
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
        <Boton
          titulo={t("Escanear QR")}
          secundario
          disabled={ocupado}
          onPress={() => void abrirCamara()}
        />
      )}
      {identidad.cargando ? (
        <Texto>{t("Cargando…")}</Texto>
      ) : !identidad.recuperable ? (
        <Tarjeta>
          <Texto>
            {t(
              "Protegé tu cuenta para aceptar la invitación. La partida casual sigue siendo gratis y sin registro.",
            )}
          </Texto>
          <Boton
            titulo={t("Proteger mi cuenta")}
            disabled={ocupado || !codigoInvitacion(codigo)}
            onPress={() =>
              void ejecutar(async (c) => {
                router.push({
                  pathname: "/cuenta",
                  params: { volver: "liga-unirse", codigo: c },
                });
              })
            }
          />
        </Tarjeta>
      ) : !vista ? (
        <Boton
          titulo={t("Ver invitación")}
          disabled={ocupado || !codigoInvitacion(codigo)}
          onPress={() =>
            void ejecutar(async (c) => {
              const resultado = await consultarInvitacionLiga(c);
              if (resultado.ya_miembro) {
                await borrarInvitacion(c);
                router.replace({ pathname: "/liga", params: { id: resultado.liga_id } });
              } else setVista(resultado);
            })
          }
        />
      ) : (
        <Tarjeta>
          <Texto style={{ fontSize: 24, fontWeight: "800" }}>
            {vista.nombre}
          </Texto>
          {!!vista.descripcion && <Texto suave>{vista.descripcion}</Texto>}
          {vista.ya_miembro ? (
            <>
              <Texto>{t("Ya sos miembro de este club.")}</Texto>
              <Boton
                titulo={t("Volver a mi club")}
                disabled={ocupado}
                onPress={() =>
                  void ejecutar(async (c) => {
                    await borrarInvitacion(c);
                    router.replace({
                      pathname: "/liga",
                      params: { id: vista.liga_id },
                    });
                  })
                }
              />
            </>
          ) : (
            <>
              <Campo
                etiqueta={t("Tu nombre")}
                value={nombre}
                onChangeText={setNombre}
                maxLength={30}
                editable={!ocupado}
              />
              <Texto suave>
                {t(
                  "Al confirmar, tu nombre y resultados de liga serán visibles para los miembros del club.",
                )}
              </Texto>
              <Boton
                titulo={t("Confirmar y unirme")}
                disabled={ocupado || !nombre.trim()}
                onPress={() =>
                  void ejecutar(async (c) => {
                    const id = await aceptarInvitacionLiga(c, nombre);
                    void vibrarMomento("club", preferencias.hapticos, `ingreso:${id}`);
                    await borrarInvitacion(c);
                    router.replace({ pathname: "/liga", params: { id } });
                  })
                }
              />
            </>
          )}
        </Tarjeta>
      )}
      {!!(error || identidad.error) && (
        <Texto>{error || mensajeError(identidad.error)}</Texto>
      )}
      <Boton
        titulo={t("Cancelar")}
        secundario
        disabled={ocupado}
        onPress={() => {
          const c = codigoInvitacion(codigo);
          void (c ? borrarInvitacion(c) : Promise.resolve())
            .then(() => router.replace("/ligas"))
            .catch((e) => setError(mensajeError(e)));
        }}
      />
    </Pantalla>
  );
}
