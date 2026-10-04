import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Boton, Campo, Pantalla, Seccion, Tarjeta, Texto } from "../components/Controles";
import {
  actualizarLiga,
  crearTemporada,
  detalleLiga,
  finalizarTemporada,
  quitarMiembro,
  type DetalleLiga,
} from "../lib/ligas";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";

export default function Liga() {
  const { id, temporada: temporadaParam } = useLocalSearchParams<{
    id: string;
    temporada?: string;
  }>();
  const router = useRouter();
  const { t, mensajeError, preferencias } = usePreferencias();
  const { tema } = useTema();
  const [datos, setDatos] = useState<DetalleLiga | null>(null);
  const [temporadaId, setTemporadaId] = useState<string | null>(temporadaParam ?? null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const [ocupado, setOcupado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [nuevaTemporada, setNuevaTemporada] = useState("");

  useFocusEffect(
    useCallback(() => {
      void revision;
      let vivo = true;
      setError(null);
      if (!id) return;
      void detalleLiga(id, temporadaId)
        .then((resultado) => {
          if (!vivo) return;
          setDatos(resultado);
          setNombre(resultado.liga.nombre);
        })
        .catch((e) => vivo && setError(e));
      return () => {
        vivo = false;
      };
    }, [id, temporadaId, revision]),
  );

  async function ejecutar(accion: () => Promise<void>) {
    if (ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      await accion();
      setRevision((v) => v + 1);
    } catch (e) {
      setError(e);
    } finally {
      setOcupado(false);
    }
  }

  const numero = (valor: number) =>
    Number(valor).toLocaleString(preferencias.idioma, { maximumFractionDigits: 2 });

  return (
    <Pantalla
      titulo={datos?.liga.nombre ?? t("Liga")}
      subtitulo={datos?.temporada?.nombre ?? t("Sin temporada")}
    >
      {!!error && (
        <Tarjeta>
          <Texto>{mensajeError(error)}</Texto>
          <Boton titulo={t("Reintentar")} onPress={() => setRevision((v) => v + 1)} />
        </Tarjeta>
      )}
      {!datos && !error && <Texto>{t("Cargando…")}</Texto>}
      {datos && (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {datos.temporadas.map((temporada) => (
              <Boton
                key={temporada.id}
                titulo={temporada.nombre}
                compacto
                secundario={temporada.id !== datos.temporada?.id}
                onPress={() => setTemporadaId(temporada.id)}
              />
            ))}
          </View>

          <Seccion titulo={t("Ranking")} inicial>
            {datos.ranking.length === 0 ? (
              <Texto suave>{t("El ranking aparecerá al finalizar la primera partida de esta temporada.")}</Texto>
            ) : (
              <Tarjeta style={{ padding: 12, gap: 0 }}>
                <View style={{ flexDirection: "row", paddingBottom: 8 }}>
                  <Texto suave style={{ width: 34 }}>#</Texto>
                  <Texto suave style={{ flex: 1 }}>{t("Jugador")}</Texto>
                  <Texto suave style={{ width: 38, textAlign: "right" }}>{t("PJ")}</Texto>
                  <Texto suave style={{ width: 38, textAlign: "right" }}>{t("V")}</Texto>
                  <Texto suave style={{ width: 42, textAlign: "right" }}>{t("Podios")}</Texto>
                  <Texto suave style={{ width: 58, textAlign: "right" }}>{t("Pts")}</Texto>
                </View>
                {datos.ranking.map((fila) => (
                  <View
                    key={fila.user_id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderColor: tema.borde,
                    }}
                  >
                    <Texto style={{ width: 34, color: fila.posicion === 1 ? tema.acento : tema.textoFuerte }}>
                      {fila.posicion}°
                    </Texto>
                    <Texto numberOfLines={1} style={{ flex: 1, fontWeight: "700" }}>{fila.nombre}</Texto>
                    <Texto style={{ width: 38, textAlign: "right" }}>{fila.partidas}</Texto>
                    <Texto style={{ width: 38, textAlign: "right" }}>{fila.victorias}</Texto>
                    <Texto style={{ width: 42, textAlign: "right" }}>{fila.podios}</Texto>
                    <Texto style={{ width: 58, textAlign: "right", color: tema.acento, fontWeight: "700" }}>
                      {numero(fila.puntos)}
                    </Texto>
                  </View>
                ))}
              </Tarjeta>
            )}
          </Seccion>

          <Seccion titulo={t("Partidas")} inicial>
            {datos.partidas.length === 0 ? (
              <Texto suave>{t("Todavía no hay partidas finalizadas en esta temporada.")}</Texto>
            ) : (
              datos.partidas.map((partida) => (
                <Tarjeta key={partida.sala_id} style={{ padding: 14, gap: 5 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    <Texto style={{ fontWeight: "700" }}>{t("Ganó {nombre}", { nombre: partida.ganador })}</Texto>
                    <Texto style={{ color: tema.acento }}>{partida.codigo_sala}</Texto>
                  </View>
                  <Texto suave>
                    {t("{n} jugadores", { n: partida.jugadores })} · {new Date(partida.finalizada_en).toLocaleDateString(preferencias.idioma)}
                  </Texto>
                </Tarjeta>
              ))
            )}
          </Seccion>

          <Seccion titulo={t("Miembros")}>
            {datos.miembros.map((miembro) => (
              <View key={miembro.user_id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Texto style={{ flex: 1 }}>{miembro.nombre}{miembro.owner ? ` · ${t("Owner")}` : ""}</Texto>
                {datos.liga.puede_administrar && !miembro.owner && (
                  <Boton
                    titulo={t("Quitar")}
                    compacto
                    secundario
                    disabled={ocupado}
                    onPress={() =>
                      Alert.alert(
                        t("Quitar miembro"),
                        t("Dejará de ver la liga, pero sus resultados históricos se conservan."),
                        [
                          { text: t("Cancelar"), style: "cancel" },
                          {
                            text: t("Quitar"),
                            style: "destructive",
                            onPress: () => void ejecutar(() => quitarMiembro(datos.liga.id, miembro.user_id)),
                          },
                        ],
                      )
                    }
                  />
                )}
              </View>
            ))}
          </Seccion>

          {datos.liga.soy_owner && !datos.liga.puede_administrar && (
            <Tarjeta>
              <Texto style={{ fontWeight: "700" }}>{t("Liga en modo lectura")}</Texto>
              <Texto suave>{t("Tus datos siguen guardados. Restaurá Plus para crear temporadas o partidas asociadas y administrar miembros.")}</Texto>
              <Boton titulo={t("Restaurar Blindly Plus")} onPress={() => router.push("/plus")} />
            </Tarjeta>
          )}

          {datos.liga.puede_administrar && (
            <Seccion titulo={t("Administrar liga")}>
              {editando ? (
                <>
                  <Campo etiqueta={t("Nombre de la liga")} value={nombre} onChangeText={setNombre} maxLength={50} />
                  <Boton
                    titulo={t("Guardar")}
                    disabled={ocupado || nombre.trim().length < 2}
                    onPress={() => void ejecutar(async () => {
                      await actualizarLiga(datos.liga.id, nombre, datos.liga.estado === "archivada");
                      setEditando(false);
                    })}
                  />
                  <Boton titulo={t("Cancelar")} secundario onPress={() => setEditando(false)} />
                </>
              ) : (
                <Boton titulo={t("Editar nombre")} secundario onPress={() => setEditando(true)} />
              )}

              {datos.temporada?.estado === "activa" ? (
                <>
                  <Boton
                    titulo={t("Crear partida para esta temporada")}
                    disabled={ocupado || datos.liga.estado === "archivada"}
                    onPress={() =>
                      router.push({
                        pathname: "/crear-sala",
                        params: {
                          temporada: datos.temporada!.id,
                          liga: datos.liga.nombre,
                          temporadaNombre: datos.temporada!.nombre,
                        },
                      })
                    }
                  />
                  <Boton
                    titulo={t("Finalizar temporada")}
                    secundario
                    disabled={ocupado}
                    onPress={() =>
                      Alert.alert(
                        t("Finalizar temporada"),
                        t("El ranking quedará guardado y luego podrás crear una temporada nueva."),
                        [
                          { text: t("Cancelar"), style: "cancel" },
                          { text: t("Finalizar"), onPress: () => void ejecutar(() => finalizarTemporada(datos.temporada!.id)) },
                        ],
                      )
                    }
                  />
                </>
              ) : (
                <>
                  <Campo
                    etiqueta={t("Nombre de la nueva temporada")}
                    value={nuevaTemporada}
                    onChangeText={setNuevaTemporada}
                    maxLength={50}
                    placeholder={t("Temporada 2027")}
                  />
                  <Boton
                    titulo={t("Crear temporada")}
                    disabled={ocupado || nuevaTemporada.trim().length < 2 || datos.liga.estado === "archivada"}
                    onPress={() => void ejecutar(async () => {
                      const nueva = await crearTemporada(datos.liga.id, nuevaTemporada);
                      setNuevaTemporada("");
                      setTemporadaId(nueva);
                    })}
                  />
                </>
              )}

              <Boton
                titulo={t(datos.liga.estado === "archivada" ? "Reactivar liga" : "Archivar liga")}
                secundario
                disabled={ocupado}
                onPress={() => void ejecutar(() => actualizarLiga(
                  datos.liga.id,
                  datos.liga.nombre,
                  datos.liga.estado !== "archivada",
                ))}
              />
            </Seccion>
          )}
        </>
      )}
    </Pantalla>
  );
}
