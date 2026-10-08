import { PantallaCarga } from "./PantallaCarga";
import { useRangosMesa } from "../lib/puntuacion";
import { useRouter, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Modal, ScrollView, View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  Pantalla,
  Texto,
  Boton,
  Campo,
  Tarjeta,
  Seccion,
  Pasos,
} from "./Controles";
import { PanelApuesta } from "./PanelApuesta";
import { AyudaTurno } from "./AyudaTurno";
import { MesaAsientos } from "./MesaAsientos";
import { Botonera } from "./Botonera";
import { AudioMesa } from "./AudioMesa";
import { useSala } from "../lib/useSala";
import { useAccionMesa } from "../lib/useAccionMesa";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { estadoActual, numeroDeNivel } from "../lib/niveles";
import { ahoraServidor } from "../lib/tiempoServidor";
import { protegerSalidaMesa, useSalidaMesa } from "../lib/useSalidaMesa";
import {
  entero,
  calcularPozos,
  ordenarJugadores,
  rolesMesa,
  repartirFisicas,
} from "../lib/mesa";

export function Mesa({ codigo }: { codigo: string }) {
  const router = useRouter(),
    { t, mensajeError, preferencias } = usePreferencias(),
    { tema } = useTema();
  const mesa = useSala(codigo),
    { sala, jugadores, usuario } = mesa,
    accion = useAccionMesa(sala, mesa.aplicar, mesa.refrescar);
  const [ahora, setAhora] = useState(ahoraServidor()),
    [enfocada, setEnfocada] = useState(true),
    [monto, setMonto] = useState(""),
    [aviso, setAviso] = useState("");
  const [reparto, setReparto] = useState<{
    mano: number;
    pozo: number;
    pozos: { tope: number; monto: number; premios: Record<string, string> }[];
  } | null>(null);
  const [editando, setEditando] = useState<{
    id: string;
    nombre: string;
    monto: string;
  } | null>(null);
  const { rangos, error: errorRangos } = useRangosMesa(
    sala?.id,
    sala?.mano,
    sala?.estado,
    jugadores.length,
  );
  const corriendo = sala?.estado === "jugando";
  const volver = useSalidaMesa(protegerSalidaMesa(sala?.estado, !!mesa.error));
  useFocusEffect(
    useCallback(() => {
      setEnfocada(true);
      return () => setEnfocada(false);
    }, []),
  );
  useEffect(() => {
    if (!corriendo || !enfocada) return;
    const reloj = setInterval(() => setAhora(ahoraServidor()), 250);
    void activateKeepAwakeAsync("mesa-blindly").catch(() => {});
    return () => {
      clearInterval(reloj);
      void deactivateKeepAwake("mesa-blindly");
    };
  }, [corriendo, enfocada]);
  const transcurrido = sala
    ? sala.acumulado_ms +
      (sala.inicio_en
        ? Math.max(0, ahora - new Date(sala.inicio_en).getTime())
        : 0)
    : 0;
  const estado = sala?.niveles.length
    ? estadoActual(sala.niveles, transcurrido)
    : null;
  if ((!sala || !estado) && !mesa.error) return <PantallaCarga />;
  if (!sala || !estado)
    return (
      <Pantalla titulo="Blindly" onVolver={volver}>
        <Texto>{mesa.error ? mensajeError(mesa.error) : t("Cargando…")}</Texto>
        {!!mesa.error && (
          <Boton titulo={t("Reintentar")} onPress={mesa.reconectar} />
        )}
      </Pantalla>
    );
  const host = sala.host_id === usuario,
    yo = jugadores.find((j) => j.user_id === usuario),
    dealer = yo?.id === sala.dealer_id;
  const esperando = sala.estado === "esperando",
    finalizada = sala.estado === "finalizada",
    virtual = sala.configuracion.fichas?.tipo === "virtuales";
  const orden = ordenarJugadores(jugadores, sala.orden),
    roles = rolesMesa(
      jugadores,
      sala.orden,
      sala.dealer_id,
      sala.boton_id ?? sala.dealer_id,
      sala,
    );
  const nivel = sala.niveles[estado.indice];
  const segundos = Math.ceil(estado.msRestantes / 1000),
    tiempo =
      String(Math.floor(segundos / 60)).padStart(2, "0") +
      ":" +
      String(segundos % 60).padStart(2, "0");
  const miTurno = yo?.id === sala.turno_id;
  const faltan = Math.max(0, sala.apuesta_actual - (yo?.aporte_calle ?? 0));
  const puedeSubir =
    !!yo &&
    (yo.apuesta_al_actuar == null ||
      sala.apuesta_actual - yo.apuesta_al_actuar >= sala.subida_minima) &&
    jugadores.some(
      (j) => j.id !== yo.id && !j.retirado && !j.eliminado_en && j.fichas > 0,
    );
  const datosTurno = {
    mano: sala.mano,
    calle: sala.calle,
    revision: sala.revision,
  };
  function apostar(tipo: string) {
    try {
      const cantidad =
        tipo === "subir" || tipo === "igualar"
          ? entero(monto, 1, (yo?.fichas ?? 0) + (yo?.aporte_calle ?? 0))
          : undefined;
      setAviso("");
      accion.ejecutar(
        "apostar",
        {
          ...datosTurno,
          tipo,
          ...(cantidad === undefined ? {} : { monto: cantidad }),
        },
        () => setMonto(""),
      );
    } catch (e) {
      setAviso(mensajeError(e));
    }
  }
  function abrirReparto() {
    setAviso("");
    setReparto({
      mano: sala!.mano,
      pozo: sala!.pozo,
      pozos: calcularPozos(jugadores).map((p) => ({
        ...p,
        premios: Object.fromEntries(
          p.elegibles.map((id) => [
            id,
            p.elegibles.length === 1 ? String(p.monto) : "0",
          ]),
        ),
      })),
    });
  }
  function confirmarReparto() {
    if (!reparto) return;
    try {
      const pozos = reparto.pozos.map((p) => {
        const premios = Object.entries(p.premios).map(([jugador, valor]) => ({
          jugador,
          monto: entero(valor),
        }));
        if (premios.reduce((s, p) => s + p.monto, 0) !== p.monto)
          throw new Error("REPARTO_INVALIDO");
        return { tope: p.tope, premios };
      });
      setAviso("");
      accion.ejecutar(
        "cerrar_mano",
        { mano: reparto.mano, pozo: reparto.pozo, pozos },
        () => setReparto(null),
      );
    } catch (e) {
      setAviso(mensajeError(e));
    }
  }
  let entrega: ReturnType<typeof repartirFisicas> | null = null;
  if (sala.configuracion.fichas?.tipo === "fisicas")
    try {
      entrega = repartirFisicas(
        sala.configuracion.fichas.denominaciones,
        jugadores.length,
      );
    } catch {}
  const errores = (
    <>
      {!!(aviso || accion.error) && <Texto>{aviso || accion.error}</Texto>}
      {accion.incierto && (
        <Boton titulo={t("Reintentar")} onPress={accion.reintentar} />
      )}
    </>
  );
  return (
    <Pantalla
      onVolver={volver}
      titulo={t(
        esperando
          ? "Sala de espera"
          : finalizada
            ? "Partida finalizada"
            : "Tu mesa",
      )}
      pie={
        !esperando && !finalizada ? (
          <>
            <View
              accessibilityLiveRegion="polite"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Texto
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color:
                      miTurno && corriendo ? tema.acento : tema.textoFuerte,
                  }}
                >
                  {!corriendo
                    ? t("Partida pausada")
                    : t(
                        sala.calle === "reparto"
                          ? "Listo para repartir"
                          : miTurno
                            ? "Tu turno"
                            : "Turno de {nombre}",
                        {
                          nombre:
                            jugadores.find((j) => j.id === sala.turno_id)
                              ?.nombre ?? "…",
                        },
                      )}
                </Texto>
                <Texto suave style={{ fontSize: 11 }}>
                  {t(sala.calle).toUpperCase()} ·{" "}
                  {t("Mano {n}", { n: sala.mano })}
                </Texto>
              </View>
              {virtual && yo && (
                <View style={{ alignItems: "flex-end" }}>
                  <Texto suave style={{ fontSize: 10 }}>
                    {t("Tu stack")}
                  </Texto>
                  <Texto style={{ fontWeight: "700", fontSize: 19 }}>
                    {yo.fichas.toLocaleString()}
                  </Texto>
                </View>
              )}
            </View>
            {virtual &&
              miTurno &&
              corriendo &&
              yo &&
              !yo.retirado &&
              !yo.eliminado_en && (
                <PanelApuesta
                  key={sala.mano + "-" + sala.calle}
                  faltan={faltan}
                  stack={yo.fichas}
                  aporte={yo.aporte_calle}
                  actual={sala.apuesta_actual}
                  minima={sala.subida_minima}
                  puedeSubir={puedeSubir}
                  ocupado={accion.ocupado}
                  monto={monto}
                  cambiar={setMonto}
                  actuar={apostar}
                />
              )}
            {!virtual &&
              preferencias.principiante &&
              miTurno &&
              corriendo &&
              yo &&
              !yo.retirado &&
              !yo.eliminado_en && <AyudaTurno />}
            {!virtual &&
              miTurno &&
              corriendo &&
              yo &&
              !yo.retirado &&
              !yo.eliminado_en &&
              (["pasar", "igualar", "subir", "retirarse"] as const).map(
                (tipo) => (
                  <Boton
                    key={tipo}
                    titulo={t(
                      tipo === "subir"
                        ? "Apostar / subir"
                        : tipo === "retirarse"
                          ? "Retirarse"
                          : tipo === "igualar"
                            ? "Igualar"
                            : "Pasar",
                    )}
                    disabled={accion.ocupado}
                    onPress={() =>
                      accion.ejecutar("turno_fisico", {
                        ...datosTurno,
                        tipo,
                      })
                    }
                  />
                ),
              )}
            {virtual && dealer && sala.calle === "reparto" && (
              <Boton
                titulo={t("Repartir pozo")}
                disabled={accion.ocupado}
                onPress={abrirReparto}
              />
            )}
            {!virtual && dealer && sala.calle === "reparto" && (
              <Boton
                titulo={t("Cerrar mano y rotar ciegas")}
                disabled={accion.ocupado}
                onPress={() =>
                  accion.ejecutar("cerrar_mano", {
                    mano: sala.mano,
                    pozo: sala.pozo,
                    premios: [],
                  })
                }
              />
            )}
            {host && !corriendo && (
              <Boton
                titulo={t("Reanudar")}
                compacto
                onPress={() => accion.ejecutar("comenzar")}
                disabled={accion.ocupado}
              />
            )}
            {errores}
          </>
        ) : undefined
      }
    >
      <Texto suave>
        {t("Código de sala")}: {sala.codigo} ·{" "}
        {t(mesa.conectado ? "Conectado" : "Reconectando…")}
      </Texto>
      {!!mesa.error && (
        <>
          <Texto>{mensajeError(mesa.error)}</Texto>
          <Boton
            titulo={t("Reintentar")}
            secundario
            onPress={mesa.reconectar}
          />
        </>
      )}
      {esperando ? (
        <>
          <Pasos actual={0} />
          <Texto
            selectable
            style={{
              textAlign: "center",
              fontSize: 38,
              lineHeight: 46,
              fontWeight: "700",
              letterSpacing: 5,
              color: tema.acento,
            }}
          >
            {sala.codigo}
          </Texto>
          <Texto suave style={{ textAlign: "center" }}>
            {t("Compartí este código o el QR con tus amigos.")}
          </Texto>
          <View
            style={{
              alignSelf: "center",
              backgroundColor: "white",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <QRCode value={`BLINDLY:${sala.codigo}`} size={150} />
          </View>
          <Texto>{t("Máximo 10 jugadores, incluido el dealer.")}</Texto>
          {host ? (
            <Boton
              titulo={t("Ordenar sala")}
              disabled={jugadores.length < 2}
              onPress={() =>
                router.push({ pathname: "/ordenar", params: { codigo } })
              }
            />
          ) : (
            <Texto>{t("Esperando al host")}</Texto>
          )}
        </>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Tarjeta style={{ flex: 1, gap: 4, padding: 14 }}>
              <Texto suave style={{ fontSize: 10, letterSpacing: 1 }}>
                {estado.terminado
                  ? t("Fin de niveles")
                  : nivel.esBreak
                    ? t("Descanso")
                    : t("Nivel {n}", {
                        n: numeroDeNivel(sala.niveles, estado.indice),
                      })}
              </Texto>
              <Texto
                style={{
                  fontSize: 30,
                  lineHeight: 36,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {tiempo}
              </Texto>
            </Tarjeta>
            <Tarjeta style={{ flex: 1, gap: 4, padding: 14 }}>
              <Texto suave style={{ fontSize: 10, letterSpacing: 1 }}>
                {t("Ciegas")}
              </Texto>
              <Texto
                style={{ fontSize: 25, lineHeight: 36, fontWeight: "600" }}
              >
                {nivel.esBreak
                  ? "—"
                  : nivel.smallBlind + " / " + nivel.bigBlind}
              </Texto>
            </Tarjeta>
          </View>
          <Texto>
            {t("Mano {n}", { n: sala.mano })}
            {virtual ? ` · ${t("Pozo")}: ${sala.pozo}` : ""}
          </Texto>
        </>
      )}
      {!!sala.orden.length && (
        <MesaAsientos
          jugadores={jugadores}
          jugadorActual={yo?.id}
          orden={sala.orden}
          dealer={sala.dealer_id}
          boton={sala.boton_id ?? sala.dealer_id}
          turno={sala.turno_id}
          posiciones={sala}
          pozo={!esperando && virtual ? sala.pozo : undefined}
          calle={!esperando ? sala.calle : undefined}
        />
      )}
      {!esperando && !finalizada && (
        <>
          {virtual ? null : (
            <>
              <Texto suave>
                {t(
                  "Cada jugador registra su propia acción desde el celular. El dealer solo cierra la mano y entrega el pozo.",
                )}
              </Texto>
            </>
          )}
          {entrega && (
            <Tarjeta>
              <Texto>{t("Reparto por jugador")}</Texto>
              {entrega.reparto.map((d) => (
                <Texto key={d.valor}>
                  {t("{n} fichas de {valor}", {
                    n: d.porJugador,
                    valor: d.valor,
                  })}{" "}
                  · {t("Reserva")}: {d.reserva}
                </Texto>
              ))}
            </Tarjeta>
          )}
        </>
      )}
      {finalizada && (
        <>
          <Boton
            titulo={t("Ver resumen de la partida")}
            onPress={() =>
              router.push(`/recap?sala=${encodeURIComponent(sala.id)}` as Href)
            }
          />
          <Boton
            titulo={t("Ver mis puntos")}
            secundario
            onPress={() => router.push("/puntuacion")}
          />
        </>
      )}
      <Seccion
        titulo={t("Jugadores") + " · " + jugadores.length + "/10"}
        inicial={esperando}
      >
        <Texto>
          {t("Jugadores")} ({jugadores.length}/10)
        </Texto>
        {errorRangos && (
          <Texto suave>{t("No se pudieron cargar los rangos.")}</Texto>
        )}
        {orden.map((j) => (
          <Tarjeta key={j.id} style={{ padding: 12, gap: 4 }}>
            <Texto style={{ fontWeight: "700" }}>
              {sala.orden.includes(j.id)
                ? `${sala.orden.indexOf(j.id) + 1}. `
                : ""}
              {j.nombre} {j.user_id === sala.host_id ? "(host)" : ""}{" "}
              {roles[j.id] ?? ""}
              {j.id === sala.turno_id ? " ◀ " + t("En turno") : ""}
              {j.retirado ? " · " + t("Retirado") : ""}
              {!j.eliminado_en && j.fichas === 0 && virtual ? " · All-in" : ""}
            </Texto>
            <Texto suave style={{ fontSize: 12 }}>
              {rangos[j.id] === undefined
                ? t("Rango no disponible")
                : rangos[j.id] === null
                  ? t("Sin rango")
                  : t("Rango global #{n}", { n: rangos[j.id]! })}
            </Texto>
            {!esperando && (
              <>
                <Texto>
                  {j.fichas.toLocaleString()}{" "}
                  {j.eliminado_en ? `· ${t("Eliminado")}` : ""}
                </Texto>
                {virtual && (
                  <Texto suave>
                    {t("Apuesta de esta mano")}: {j.apuesta_mano}
                  </Texto>
                )}
                {dealer && !virtual && !finalizada && (
                  <Boton
                    titulo={t("Actualizar stack físico")}
                    secundario
                    onPress={() =>
                      setEditando({
                        id: j.id,
                        nombre: j.nombre,
                        monto: String(j.fichas),
                      })
                    }
                  />
                )}
              </>
            )}
          </Tarjeta>
        ))}
      </Seccion>
      {!esperando && (
        <Seccion titulo={t("Control de partida")}>
          {host && !finalizada && (
            <>
              <Boton
                titulo={t(corriendo ? "Pausar" : "Reanudar")}
                disabled={accion.ocupado}
                onPress={() =>
                  accion.ejecutar(corriendo ? "pausar" : "comenzar")
                }
              />
              <View style={estilos.fila}>
                <Boton
                  titulo={t("Anterior")}
                  secundario
                  disabled={accion.ocupado || transcurrido === 0}
                  onPress={() =>
                    accion.ejecutar("saltar", {
                      indice: Math.max(0, estado.indice - 1),
                    })
                  }
                />
                <Boton
                  titulo={t("Siguiente")}
                  secundario
                  disabled={
                    accion.ocupado || estado.indice >= sala.niveles.length - 1
                  }
                  onPress={() =>
                    accion.ejecutar("saltar", { indice: estado.indice + 1 })
                  }
                />
              </View>
            </>
          )}
          <AudioMesa
            indice={estado.indice}
            corriendo={!!corriendo && enfocada}
            musica={!!sala.configuracion.musica}
          />
          <Texto suave>
            {t("Dealer fijo")}:{" "}
            {jugadores.find((j) => j.id === sala.dealer_id)?.nombre}
          </Texto>
          <Texto suave>
            {t(
              virtual
                ? "Las ciegas virtuales se descuentan al comenzar cada mano."
                : "Las apuestas y el reparto se realizan con las fichas de la mesa.",
            )}
          </Texto>
        </Seccion>
      )}
      {!esperando && !finalizada && (
        <Seccion titulo={t("Botonera")}>
          <Botonera corriendo={!!corriendo && enfocada} />
          <Boton
            titulo={t("Sonidos y ambiente")}
            secundario
            onPress={() => router.push("/sonidos")}
          />
        </Seccion>
      )}
      {(!virtual || esperando || finalizada) && errores}
      <Boton
        titulo={t("Combinaciones de poker")}
        secundario
        onPress={() => router.push("/combinaciones")}
      />
      <Boton
        titulo={t("Opciones")}
        secundario
        onPress={() => router.push("/opciones")}
      />
      <Modal
        visible={!!reparto}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!accion.ocupado) setReparto(null);
        }}
      >
        <View style={estilos.fondo}>
          <ScrollView
            contentContainerStyle={[
              estilos.modal,
              { backgroundColor: tema.fondo },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Texto>
              {t("Repartí exactamente {n} fichas entre los ganadores.", {
                n: reparto?.pozo ?? 0,
              })}
            </Texto>
            <Texto suave>
              {t(
                "El dealer elige los ganadores. Cada pozo muestra solo los jugadores elegibles.",
              )}
            </Texto>
            {reparto?.pozos.map((pozo, indice) => (
              <Tarjeta key={pozo.tope}>
                <Texto>
                  {t(indice === 0 ? "Pozo principal" : "Pozo secundario")}{" "}
                  {indice || ""}: {pozo.monto}
                </Texto>
                <Texto suave style={{ fontSize: 12 }}>
                  {t("Elegí al ganador o editá los importes para un empate.")}
                </Texto>
                <View style={{ gap: 8 }}>
                  {Object.keys(pozo.premios).map((id) => (
                    <Boton
                      key={id}
                      titulo={t("Gana {nombre}", {
                        nombre:
                          jugadores.find((j) => j.id === id)?.nombre ?? "",
                      })}
                      compacto
                      secundario={Number(pozo.premios[id]) !== pozo.monto}
                      disabled={accion.ocupado}
                      onPress={() =>
                        setReparto((prev) =>
                          prev
                            ? {
                                ...prev,
                                pozos: prev.pozos.map((p, i) =>
                                  i === indice
                                    ? {
                                        ...p,
                                        premios: Object.fromEntries(
                                          Object.keys(p.premios).map((j) => [
                                            j,
                                            j === id ? String(p.monto) : "0",
                                          ]),
                                        ),
                                      }
                                    : p,
                                ),
                              }
                            : prev,
                        )
                      }
                    />
                  ))}
                </View>
                {Object.entries(pozo.premios).map(([id, valor]) => (
                  <Campo
                    key={id}
                    etiqueta={jugadores.find((j) => j.id === id)?.nombre ?? id}
                    keyboardType="number-pad"
                    value={valor}
                    onChangeText={(texto) =>
                      setReparto((prev) =>
                        prev
                          ? {
                              ...prev,
                              pozos: prev.pozos.map((p, i) =>
                                i === indice
                                  ? {
                                      ...p,
                                      premios: { ...p.premios, [id]: texto },
                                    }
                                  : p,
                              ),
                            }
                          : prev,
                      )
                    }
                  />
                ))}
                <Texto>
                  {t("Por repartir: {n}", {
                    n:
                      pozo.monto -
                      Object.values(pozo.premios).reduce(
                        (s, v) => s + (Number(v) || 0),
                        0,
                      ),
                  })}
                </Texto>
              </Tarjeta>
            ))}
            {errores}
            <Boton
              titulo={t("Confirmar reparto")}
              disabled={accion.ocupado}
              onPress={confirmarReparto}
            />
            <Boton
              titulo={t("Cancelar")}
              secundario
              disabled={accion.ocupado}
              onPress={() => setReparto(null)}
            />
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={!!editando}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
      >
        <View style={estilos.fondo}>
          <View style={[estilos.modal, { backgroundColor: tema.fondo }]}>
            <Campo
              etiqueta={editando?.nombre ?? ""}
              keyboardType="number-pad"
              value={editando?.monto ?? ""}
              onChangeText={(monto) =>
                setEditando((prev) => (prev ? { ...prev, monto } : null))
              }
            />
            {errores}
            <Boton
              titulo={t("Guardar")}
              disabled={accion.ocupado}
              onPress={() => {
                try {
                  if (editando)
                    accion.ejecutar(
                      "fichas",
                      { jugador: editando.id, monto: entero(editando.monto) },
                      () => setEditando(null),
                    );
                } catch (e) {
                  setAviso(mensajeError(e));
                }
              }}
            />
            <Boton
              titulo={t("Cancelar")}
              secundario
              disabled={accion.ocupado}
              onPress={() => setEditando(null)}
            />
          </View>
        </View>
      </Modal>
    </Pantalla>
  );
}
const estilos = StyleSheet.create({
  fila: { flexDirection: "row", gap: 12, justifyContent: "center" },
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    padding: 20,
    gap: 14,
    borderRadius: 18,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
});
