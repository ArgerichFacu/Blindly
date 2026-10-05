import { useCallback, useState } from "react";
import { useRouter, useFocusEffect, type Href } from "expo-router";
import { View } from "react-native";
import {
  Pantalla,
  Tarjeta,
  Texto,
  Boton,
  Etiqueta,
  Seccion,
} from "../components/Controles";
import { miPuntuacion, PUNTOS_F1, type Puntuacion } from "../lib/puntuacion";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
export default function MiPuntuacion() {
  const router = useRouter();
  const { t, mensajeError, preferencias } = usePreferencias(),
    { tema } = useTema();
  const [datos, setDatos] = useState<Puntuacion | null>(null),
    [error, setError] = useState<unknown>(null),
    [revision, setRevision] = useState(0),
    [cantidad, setCantidad] = useState(6);
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      setError(null);
      void miPuntuacion()
        .then((d) => {
          if (activo) setDatos(d);
        })
        .catch((e) => {
          if (activo) setError(e);
        });
      return () => {
        activo = false;
      };
      // `revision` es un contador intencional para reintentar la carga en foco.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revision]),
  );
  const numero = (n: number) =>
    n.toLocaleString(preferencias.idioma, { maximumFractionDigits: 3 });
  const metricas = datos?.estadisticas
    ? [
        ["Partidas jugadas", datos.estadisticas.partidas],
        ["Victorias", datos.estadisticas.victorias],
        ["Podios", datos.estadisticas.podios],
        ["Win rate", `${numero(datos.estadisticas.win_rate)}%`],
        ["Posición promedio", datos.estadisticas.posicion_media],
        ["Mejor posición", datos.estadisticas.mejor_posicion],
        ["Peor posición", datos.estadisticas.peor_posicion],
        ["Mejor racha de victorias", datos.estadisticas.mejor_racha_victorias],
      ] as const
    : [];
  return (
    <Pantalla titulo={t("Mi puntuación")}>
      <Etiqueta>{t("SOLO VOS PODÉS VER TUS PUNTOS")}</Etiqueta>
      {!!error && (
        <Tarjeta>
          <Texto>{mensajeError(error)}</Texto>
          <Boton
            titulo={t("Reintentar")}
            onPress={() => setRevision((v) => v + 1)}
          />
        </Tarjeta>
      )}
      {!datos && !error && <Texto>{t("Cargando…")}</Texto>}
      {datos && (
        <>
          <Tarjeta>
            <Texto suave>{t("Puntos acumulados")}</Texto>
            <Texto
              style={{
                fontSize: 54,
                lineHeight: 62,
                fontWeight: "800",
                color: tema.acento,
              }}
            >
              {numero(datos.puntos)}
            </Texto>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Texto>
                {datos.rango === null
                  ? t("Sin rango")
                  : t("Rango global #{n}", { n: datos.rango })}
              </Texto>
              <Texto suave>{t("{n} partidas", { n: datos.partidas })}</Texto>
            </View>
            <Texto suave>
              {t(
                "Tus compañeros de mesa ven tu rango, nunca tus puntos ni tu historial.",
              )}
            </Texto>
          </Tarjeta>
          {!!datos.estadisticas && (
            <Seccion titulo={t("Métricas Plus")} inicial>
              <Tarjeta>
                {metricas.map(([etiqueta, valor]) => (
                  <View
                    key={etiqueta}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Texto suave>{t(etiqueta)}</Texto>
                    <Texto style={{ color: tema.acento, fontWeight: "700" }}>
                      {valor === null ? "—" : typeof valor === "number" ? numero(valor) : valor}
                    </Texto>
                  </View>
                ))}
              </Tarjeta>
              {datos.estadisticas.por_mes.length > 0 && (
                <Tarjeta>
                  <Texto style={{ fontWeight: "700" }}>{t("Rendimiento por mes")}</Texto>
                  {datos.estadisticas.por_mes.slice(-6).map((mes) => (
                    <View key={mes.mes} style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                      <Texto suave>{mes.mes}</Texto>
                      <Texto>{t("{n} partidas · {p} pts", { n: mes.partidas, p: numero(mes.puntos) })}</Texto>
                    </View>
                  ))}
                </Tarjeta>
              )}
              <Boton titulo={t("Comparar con amigos")} secundario onPress={() => router.push("/head-to-head" as Href)} />
            </Seccion>
          )}
          {!datos.estadisticas && (
            <Tarjeta>
              <Texto style={{ fontWeight: "700" }}>{t("Métricas Plus")}</Texto>
              <Texto suave>
                {t("Activá Blindly Plus para ver promedios, victorias, podios y tu mejor resultado.")}
              </Texto>
              <Boton
                titulo={t("Ver planes de Blindly Plus")}
                onPress={() => router.push("/plus")}
              />
            </Tarjeta>
          )}
          <Seccion titulo={t("Mis últimas partidas")} inicial>
            <Texto suave>
              {t(datos.historial_completo
                ? "Blindly Plus muestra tu historial completo."
                : "Blindly Free muestra tus últimas 10 partidas. Tu historial anterior sigue guardado.")}
            </Texto>
            {datos.historial.length === 0 ? (
              <Texto suave>
                {t(
                  "Terminá tu primera partida para sumar puntos y obtener un rango.",
                )}
              </Texto>
            ) : (
              datos.historial.map((h) => (
                <Tarjeta key={h.sala_id} style={{ padding: 14, gap: 6 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Texto style={{ fontWeight: "700" }}>
                      {t("Puesto {p} de {n}", { p: h.puesto, n: h.jugadores })}
                    </Texto>
                    <Texto style={{ fontWeight: "700", color: tema.acento }}>
                      +{numero(h.puntos)}{" "}
                      {t(h.puntos === 1 ? "punto" : "puntos")}
                    </Texto>
                  </View>
                  <Texto suave>
                    {new Date(h.finalizada_en).toLocaleDateString(
                      preferencias.idioma,
                    )}
                  </Texto>
                </Tarjeta>
              ))
            )}
          </Seccion>
        </>
      )}
      <Seccion titulo={t("Cómo se suman los puntos")} inicial>
        <Texto suave>
          {t(
            "Se quitan los puntajes más altos hasta quedar uno por jugador. Los puntos se acreditan una sola vez, al terminar la partida.",
          )}
        </Texto>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Boton
            titulo="−"
            accesibilidad={t("Menos jugadores")}
            compacto
            secundario
            disabled={cantidad === 2}
            onPress={() => setCantidad((n) => n - 1)}
          />
          <Texto>{t("{n} jugadores", { n: cantidad })}</Texto>
          <Boton
            titulo="+"
            accesibilidad={t("Más jugadores")}
            compacto
            secundario
            disabled={cantidad === 10}
            onPress={() => setCantidad((n) => n + 1)}
          />
        </View>
        {PUNTOS_F1.slice(10 - cantidad).map((p, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 9,
              borderBottomWidth: 1,
              borderColor: tema.borde,
            }}
          >
            <Texto>{i + 1}°</Texto>
            <Texto
              style={{
                color: i === 0 ? tema.acento : tema.textoFuerte,
                fontWeight: "700",
              }}
            >
              {p} {t(p === 1 ? "punto" : "puntos")}
            </Texto>
          </View>
        ))}
        <Texto suave>
          {t(
            "Si hay eliminados en la misma mano, queda mejor quien empezó con más fichas. Si empatan, comparten puesto y promedian los puntos de esos lugares.",
          )}
        </Texto>
        <Texto suave>
          {t(
            "En partidas con fichas físicas, registrá los stacks antes de cerrar cada mano. Las partidas iniciadas antes de esta función no suman puntos.",
          )}
        </Texto>
      </Seccion>
      <Texto suave>
        {t("Protegé tu historial vinculando un email en Mi cuenta.")}
      </Texto>
      <Boton
        titulo={t("Mi cuenta")}
        secundario
        onPress={() => router.push("/cuenta")}
      />
    </Pantalla>
  );
}
