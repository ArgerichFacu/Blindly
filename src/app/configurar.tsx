import { useLocalSearchParams, useRouter } from "expo-router";
import { Switch, View } from "react-native";
import {
  Pantalla,
  Boton,
  Texto,
  Tarjeta,
  Acceso,
  Pasos,
} from "../components/Controles";
import { useSala } from "../lib/useSala";
import { useAccionMesa } from "../lib/useAccionMesa";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
export default function Configurar() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>(),
    router = useRouter(),
    { t, mensajeError } = usePreferencias(),
    { tema } = useTema();
  const mesa = useSala(codigo),
    { sala, usuario, jugadores } = mesa,
    accion = useAccionMesa(sala, mesa.aplicar);
  const listo =
    !!sala?.configuracion.fichas &&
    !!sala?.configuracion.modo &&
    jugadores.length >= 2 &&
    sala.orden.length === jugadores.length &&
    !!sala.dealer_id;
  const host = sala?.host_id === usuario;
  return (
    <Pantalla
      titulo={t("Prepará tu partida")}
      subtitulo={t("Dos elecciones y a jugar.")}
      pie={
        host && (
          <>
            <Texto suave style={{ fontSize: 12, textAlign: "center" }}>
              {t(
                listo
                  ? "Todo listo para repartir las cartas."
                  : "Elegí las fichas y el ritmo de la partida.",
              )}
            </Texto>
            <Boton
              titulo={t(accion.ocupado ? "Guardando…" : "Iniciar partida")}
              disabled={
                !listo || accion.ocupado || sala?.estado !== "esperando"
              }
              onPress={() =>
                accion.ejecutar("iniciar", {}, () =>
                  router.dismissTo({ pathname: "/sala", params: { codigo } }),
                )
              }
            />
          </>
        )
      }
    >
      <Pasos actual={2} />
      {mesa.error ? (
        <>
          <Texto>{mensajeError(mesa.error)}</Texto>
          <Boton titulo={t("Reintentar")} onPress={mesa.reconectar} />
        </>
      ) : !sala ? (
        <Texto>{t("Cargando…")}</Texto>
      ) : !host ? (
        <Texto>{t("Solo el host puede hacer esto.")}</Texto>
      ) : (
        <>
          <Acceso
            titulo={t("Valor de fichas")}
            detalle={
              sala.configuracion.fichas
                ? t(
                    sala.configuracion.fichas.tipo === "virtuales"
                      ? "Fichas virtuales"
                      : "Fichas físicas",
                  )
                : t("Usá tus fichas o llevá el stack en el celular.")
            }
            simbolo="◉"
            activo={!!sala.configuracion.fichas}
            disabled={accion.ocupado}
            onPress={() =>
              router.push({ pathname: "/valor-fichas", params: { codigo } })
            }
          />
          <Acceso
            titulo={t("Modo de juego")}
            detalle={
              sala.configuracion.modo
                ? t(
                    sala.configuracion.modo.id === "deep"
                      ? "Deep stack"
                      : sala.configuracion.modo.id === "personalizado"
                        ? "Personalizado"
                        : sala.configuracion.modo.id === "turbo"
                          ? "Turbo"
                          : "Regular",
                  )
                : t("Una partida rápida, equilibrada o sin apuro.")
            }
            simbolo="◷"
            activo={!!sala.configuracion.modo}
            disabled={accion.ocupado}
            onPress={() =>
              router.push({ pathname: "/modo", params: { codigo } })
            }
          />
          <Tarjeta>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Texto style={{ fontWeight: "600" }}>
                  {t("Música de ambiente")}
                </Texto>
                <Texto suave style={{ fontSize: 12 }}>
                  {t("Un poco de ambiente para tu mesa.")}
                </Texto>
              </View>
              <Switch
                accessibilityLabel={t("Música de ambiente")}
                trackColor={{ false: tema.borde, true: tema.acento }}
                thumbColor={tema.textoFuerte}
                value={!!sala.configuracion.musica}
                disabled={accion.ocupado}
                onValueChange={(valor) =>
                  accion.ejecutar("configurar", { seccion: "musica", valor })
                }
              />
            </View>
          </Tarjeta>
          <Texto suave style={{ textAlign: "center", fontSize: 12 }}>
            {t("Jugadores")}: {jugadores.length} · {t("Código de sala")}:{" "}
            {codigo}
          </Texto>
          {!!sala.configuracion.jugadores_habituales?.length && (
            <Tarjeta>
              <Texto style={{ fontWeight: "700" }}>{t("Jugadores habituales esperados")}</Texto>
              <Texto suave>{t("Es una referencia: cada jugador debe entrar con el código o QR.")}</Texto>
              {sala.configuracion.jugadores_habituales.map((nombre) => (
                <View key={nombre} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Texto style={{ flex: 1 }}>{nombre}</Texto>
                  <Boton
                    titulo={t("Quitar")}
                    compacto
                    secundario
                    disabled={accion.ocupado}
                    onPress={() => accion.ejecutar("configurar", {
                      seccion: "jugadores_habituales",
                      valor: sala.configuracion.jugadores_habituales?.filter((j) => j !== nombre) ?? [],
                    })}
                  />
                </View>
              ))}
            </Tarjeta>
          )}
          {!!accion.error && <Texto>{accion.error}</Texto>}
          {accion.incierto && (
            <Boton titulo={t("Reintentar")} onPress={accion.reintentar} />
          )}
        </>
      )}
    </Pantalla>
  );
}
