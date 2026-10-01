import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import type { User } from "@supabase/supabase-js";
import {
  Pantalla,
  Texto,
  Tarjeta,
  Campo,
  Boton,
} from "../components/Controles";
import {
  asegurarSesion,
  solicitarCodigo,
  confirmarCodigo,
  crearClaveRecuperacion,
  recuperarConClave,
  cuentaConClave,
  eliminarCuenta,
  type SolicitudCuenta,
} from "../lib/sesion";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
const correoListo = process.env.EXPO_PUBLIC_EMAIL_AUTH_READY === "true";
export default function Cuenta() {
  const { t, mensajeError } = usePreferencias(),
    router = useRouter(),
    plus = usePlus();
  const [usuario, setUsuario] = useState<User | null>(null),
    [email, setEmail] = useState(""),
    [codigo, setCodigo] = useState(""),
    [clave, setClave] = useState(""),
    [claveGenerada, setClaveGenerada] = useState(""),
    [mostrarRecuperacion, setMostrarRecuperacion] = useState(false),
    [solicitud, setSolicitud] = useState<SolicitudCuenta | null>(null),
    [recuperar, setRecuperar] = useState(false),
    [ocupado, setOcupado] = useState(false),
    [error, setError] = useState<unknown>(null),
    [revision, setRevision] = useState(0),
    [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const cerrojo = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      void asegurarSesion()
        .then((u) => {
          if (activo) setUsuario(u);
        })
        .catch((e) => {
          if (activo) setError(e);
        });
      return () => {
        activo = false;
      };
    }, [revision]),
  );
  async function ejecutar(fn: () => Promise<void>) {
    if (cerrojo.current) return;
    cerrojo.current = true;
    setOcupado(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e);
    } finally {
      cerrojo.current = false;
      setOcupado(false);
    }
  }
  return (
    <Pantalla titulo={t("Mi cuenta")}>
      {!correoListo && (
        <Tarjeta>
          <Texto>
            {t(
              "El correo está en preparación. La clave de recuperación ya está disponible.",
            )}
          </Texto>
        </Tarjeta>
      )}
      {!!error && (
        <Tarjeta>
          <Texto>{mensajeError(error)}</Texto>
          <Boton
            titulo={t("Reintentar")}
            disabled={ocupado}
            onPress={() => {
              setError(null);
              setRevision((n) => n + 1);
            }}
          />
        </Tarjeta>
      )}
      {!usuario ? (
        <Texto>{t("Cargando…")}</Texto>
      ) : (
        <>
          <Tarjeta>
            <Texto>
              {t(
                usuario.is_anonymous
                  ? "Jugás como invitado"
                  : cuentaConClave(usuario)
                    ? "Cuenta protegida con clave"
                    : "Cuenta recuperable",
              )}
            </Texto>
            {!usuario.is_anonymous && !cuentaConClave(usuario) && (
              <Texto>{usuario.email}</Texto>
            )}
            <Texto suave>
              {t(
                cuentaConClave(usuario)
                  ? "Tu identidad ya se puede recuperar con la clave privada. También podrás agregar un email cuando el correo esté habilitado."
                  : "Vinculá tu email para conservar tus puntos e historial al cambiar de celular. Podés seguir jugando como invitado.",
              )}
            </Texto>
            {plus.activo && (
              <>
                <Texto>
                  {t(
                    "Eliminar tu cuenta no cancela tu suscripción de Apple o Google. Administrala antes de borrar la cuenta.",
                  )}
                </Texto>
                <Boton
                  secundario
                  titulo={t("Administrar suscripción")}
                  disabled={ocupado}
                  onPress={() => void ejecutar(plus.gestionar)}
                />
              </>
            )}
          </Tarjeta>
          {(usuario.is_anonymous || cuentaConClave(usuario)) && (
            <Tarjeta>
              <Texto style={{ fontWeight: "700" }}>
                {t(
                  cuentaConClave(usuario)
                    ? "Tu cuenta tiene una clave de recuperación"
                    : "Protección sin correo",
                )}
              </Texto>
              <Texto suave>
                {t(
                  "Guardá una clave privada para recuperar este mismo usuario, sus puntos, historial y compras en otro celular.",
                )}
              </Texto>
              {!!claveGenerada && (
                <>
                  <Texto selectable style={{ fontWeight: "700" }}>
                    {claveGenerada}
                  </Texto>
                  <Texto>
                    {t(
                      "Guardala ahora en un lugar seguro. Blindly no puede mostrarla de nuevo; crear otra reemplaza la anterior.",
                    )}
                  </Texto>
                </>
              )}
              <Boton
                titulo={t(
                  cuentaConClave(usuario)
                    ? "Crear una clave nueva"
                    : "Crear clave de recuperación",
                )}
                disabled={ocupado}
                onPress={() =>
                  void ejecutar(async () => {
                    const resultado = await crearClaveRecuperacion();
                    setUsuario(resultado.usuario);
                    setClaveGenerada(resultado.clave);
                  })
                }
              />
              {usuario.is_anonymous && (
                <Boton
                  secundario
                  titulo={t("Ya tengo una clave")}
                  disabled={ocupado}
                  onPress={() => setMostrarRecuperacion((valor) => !valor)}
                />
              )}
              {mostrarRecuperacion && usuario.is_anonymous && (
                <>
                  <Campo
                    etiqueta={t("Clave de recuperación")}
                    value={clave}
                    onChangeText={setClave}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!ocupado}
                  />
                  <Boton
                    titulo={t("Recuperar mi cuenta")}
                    disabled={ocupado || !clave.trim()}
                    onPress={() =>
                      void ejecutar(async () => {
                        const recuperado = await recuperarConClave(clave);
                        setUsuario(recuperado);
                        setClave("");
                        setMostrarRecuperacion(false);
                        router.replace("/cuenta");
                      })
                    }
                  />
                </>
              )}
            </Tarjeta>
          )}
          {(usuario.is_anonymous || cuentaConClave(usuario) || recuperar) && (
            <Tarjeta>
              {!solicitud ? (
                <>
                  <Texto>
                    {t(
                      recuperar
                        ? "Recuperar mi cuenta"
                        : cuentaConClave(usuario)
                          ? "Agregar un email"
                          : "Proteger este invitado",
                    )}
                  </Texto>
                  {recuperar && (
                    <Texto>
                      {t(
                        "Al confirmar, entrarás a la cuenta del correo. Los puntos del invitado actual no se trasladan. Si tiene puntos, vinculalo antes a otro correo. No cambies de cuenta durante una partida.",
                      )}
                    </Texto>
                  )}
                  <Campo
                    etiqueta={t("Email")}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!ocupado}
                  />
                  <Boton
                    titulo={t("Enviar código")}
                    disabled={ocupado || !email.trim() || !correoListo}
                    onPress={() =>
                      void ejecutar(async () => {
                        setSolicitud(await solicitarCodigo(email, recuperar));
                      })
                    }
                  />
                  <Boton
                    secundario
                    titulo={t(
                      recuperar
                        ? "Proteger este invitado"
                        : "Ya tengo una cuenta",
                    )}
                    disabled={ocupado}
                    onPress={() => {
                      setRecuperar(!recuperar);
                      setError(null);
                    }}
                  />
                </>
              ) : (
                <>
                  <Texto>{t("Ingresá el código enviado a tu email.")}</Texto>
                  <Texto>{solicitud.email}</Texto>
                  <Campo
                    etiqueta={t("Código de verificación")}
                    value={codigo}
                    onChangeText={setCodigo}
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={10}
                    editable={!ocupado}
                  />
                  <Boton
                    titulo={t("Confirmar código")}
                    disabled={ocupado || !/^\d{6,10}$/.test(codigo.trim())}
                    onPress={() =>
                      void ejecutar(async () => {
                        const u = await confirmarCodigo(solicitud, codigo);
                        setUsuario(u);
                        setSolicitud(null);
                        setCodigo("");
                        setRecuperar(false);
                        router.replace("/cuenta");
                      })
                    }
                  />
                  <Boton
                    secundario
                    titulo={t("Volver a ingresar email")}
                    disabled={ocupado}
                    onPress={() => {
                      setSolicitud(null);
                      setCodigo("");
                    }}
                  />
                </>
              )}
            </Tarjeta>
          )}
          {!usuario.is_anonymous && !cuentaConClave(usuario) && (
            <Texto suave>
              {t(
                "En otro celular, elegí Ya tengo una cuenta e ingresá este mismo correo.",
              )}
            </Texto>
          )}
          <Tarjeta style={{ borderColor: "#B91C1C" }}>
            <Texto style={{ fontWeight: "700" }}>{t("Eliminar mi cuenta")}</Texto>
            <Texto suave>
              {t(
                "Elimina tu identidad, tus puntos y tu historial. No se puede deshacer.",
              )}
            </Texto>
            {confirmarBorrado ? (
              <>
                <Texto>
                  {t(
                    "Confirmá solo si querés borrar definitivamente todos tus datos de Blindly.",
                  )}
                </Texto>
                <Boton
                  titulo={t("Eliminar definitivamente")}
                  disabled={ocupado}
                  onPress={() =>
                    void ejecutar(async () => {
                      await eliminarCuenta();
                      setUsuario(null);
                      router.replace("/");
                    })
                  }
                />
                <Boton
                  secundario
                  titulo={t("Cancelar")}
                  disabled={ocupado}
                  onPress={() => setConfirmarBorrado(false)}
                />
              </>
            ) : (
              <Boton
                secundario
                titulo={t("Eliminar mi cuenta")}
                disabled={ocupado}
                onPress={() => setConfirmarBorrado(true)}
              />
            )}
          </Tarjeta>
          <Boton
            secundario
            titulo={t("Volver al inicio")}
            disabled={ocupado}
            onPress={() => router.replace("/")}
          />
        </>
      )}
    </Pantalla>
  );
}
