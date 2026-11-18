import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import {
  Pantalla,
  Boton,
  Texto,
  Campo,
  Tarjeta,
} from "../components/Controles";
import { useSala } from "../lib/useSala";
import { useAccionMesa } from "../lib/useAccionMesa";
import { usePreferencias } from "../lib/Preferencias";
import { entero, repartirFisicas, type Fichas } from "../lib/mesa";
import { useTema } from "../lib/TemaContext";
import { FICHAS, RADIOS, TINTA_FICHA, type ColorFicha } from "../lib/temas";
import { formatoFicha, formatoNumero } from "../lib/numeros";
import { estiloFuente } from "../lib/tipografia";

// Color de cada fila de fichas, en el orden habitual de un maletín (de menor a mayor valor).
const ORDEN_COLORES: ColorFicha[] = [
  "blanca",
  "roja",
  "verde",
  "azul",
  "negra",
];
function Ficha({
  indice,
  valor,
  idioma,
}: {
  indice: number;
  valor: string;
  idioma: Parameters<typeof formatoFicha>[1];
}) {
  const color = ORDEN_COLORES[indice % ORDEN_COLORES.length];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: FICHAS[color],
        borderWidth: 3,
        borderStyle: "dashed",
        borderColor: TINTA_FICHA[color] + "66",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Texto
        style={{ fontSize: 12, fontWeight: "700", color: TINTA_FICHA[color] }}
        condensada
      >
        {Number.isFinite(Number(valor)) && valor !== ""
          ? formatoFicha(Number(valor), idioma)
          : valor}
      </Texto>
    </View>
  );
}
export default function ValorFichas() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>(),
    router = useRouter(),
    { t, mensajeError, preferencias } = usePreferencias(),
    { tema } = useTema();
  const n = (x: number) => formatoNumero(x, preferencias.idioma);
  const campoNumero = {
    ...estiloFuente({ fontSize: 18, fontWeight: "600" }, true),
    fontSize: 18,
    color: tema.texto,
    backgroundColor: tema.superficie,
    borderWidth: 1,
    borderColor: tema.bordeControl,
    borderRadius: RADIOS.control,
    minHeight: 48,
    paddingHorizontal: 12,
    textAlign: "right" as const,
  };
  const mesa = useSala(codigo),
    { sala, jugadores } = mesa,
    accion = useAccionMesa(sala, mesa.aplicar);
  const [tipoElegido, setTipoElegido] = useState<
      "fisicas" | "virtuales" | null
    >(null),
    [stackEditado, setStackEditado] = useState<string | null>(null),
    [error, setError] = useState("");
  const [filasEditadas, setFilasEditadas] = useState<
    { valor: string; cantidad: string }[] | null
  >(null);
  const fichasGuardadas = sala?.configuracion.fichas;
  const tipo = tipoElegido ?? fichasGuardadas?.tipo ?? "fisicas";
  const stack =
    stackEditado ??
    (fichasGuardadas?.tipo === "virtuales"
      ? String(fichasGuardadas.stack)
      : "5000");
  const filas =
    filasEditadas ??
    (fichasGuardadas?.tipo === "fisicas"
      ? fichasGuardadas.denominaciones.map((d) => ({
          valor: String(d.valor),
          cantidad: String(d.cantidad),
        }))
      : [25, 50, 100, 500, 1000].map((valor) => ({
          valor: String(valor),
          cantidad: "0",
        })));
  function leer(): Fichas {
    return tipo === "virtuales"
      ? { tipo, stack: entero(stack, 1) }
      : {
          tipo,
          denominaciones: filas.map((f) => ({
            valor: entero(f.valor, 1, 1000000),
            cantidad: entero(f.cantidad, 0, 1000000),
          })),
        };
  }
  let reparto: ReturnType<typeof repartirFisicas> | null = null;
  try {
    const fichas = leer();
    if (fichas.tipo === "fisicas")
      reparto = repartirFisicas(fichas.denominaciones, jugadores.length);
  } catch {}
  function guardar() {
    try {
      const valor = leer();
      if (valor.tipo === "fisicas")
        repartirFisicas(valor.denominaciones, jugadores.length);
      setError("");
      accion.ejecutar("configurar", { seccion: "fichas", valor }, () =>
        router.back(),
      );
    } catch (e) {
      setError(mensajeError(e));
    }
  }
  const editable =
    !!sala && sala.host_id === mesa.usuario && sala.estado === "esperando";
  return (
    <Pantalla titulo={t("Valor de fichas")}>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {(["fisicas", "virtuales"] as const).map((valor) => (
          <Boton
            key={valor}
            titulo={t(
              valor === "fisicas" ? "Fichas físicas" : "Fichas virtuales",
            )}
            secundario={tipo !== valor}
            onPress={() => setTipoElegido(valor)}
          />
        ))}
      </View>
      {tipo === "virtuales" ? (
        <>
          <Texto>
            {t(
              "Sin fichas físicas: cada jugador apuesta desde su celular. Solo el dealer reparte el pozo.",
            )}
          </Texto>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1000, 5000, 10000].map((valorStack) => (
              <Boton
                key={valorStack}
                titulo={n(valorStack)}
                compacto
                secundario={Number(stack) !== valorStack}
                style={{ flex: 1 }}
                onPress={() => setStackEditado(String(valorStack))}
              />
            ))}
          </View>
          <Campo
            etiqueta={t("Stack inicial por jugador")}
            value={stack}
            onChangeText={setStackEditado}
            keyboardType="number-pad"
          />
        </>
      ) : (
        <>
          <Texto suave>
            {t(
              "Las cantidades corresponden al total disponible en la mesa. El sobrante queda en reserva.",
            )}
          </Texto>
          <View
            accessibilityRole="list"
            style={{ borderTopWidth: 1, borderColor: tema.borde }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 8,
              }}
            >
              <Texto suave style={{ width: 36, fontSize: 13 }}>
                {t("Ficha")}
              </Texto>
              <Texto
                suave
                style={{ flex: 1, fontSize: 13, textAlign: "right" }}
              >
                {t("Valor")}
              </Texto>
              <Texto
                suave
                style={{ flex: 1, fontSize: 13, textAlign: "right" }}
              >
                {t("Cantidad total")}
              </Texto>
            </View>
            {filas.map((f, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 6,
                  borderTopWidth: 1,
                  borderColor: tema.borde,
                }}
              >
                <Ficha
                  indice={i}
                  valor={f.valor}
                  idioma={preferencias.idioma}
                />
                <TextInput
                  accessibilityLabel={`${t("Valor")} ${i + 1}`}
                  value={f.valor}
                  keyboardType="number-pad"
                  selectionColor={tema.acento}
                  style={[campoNumero, { flex: 1 }]}
                  onChangeText={(valor) =>
                    setFilasEditadas(
                      filas.map((fila, k) =>
                        k === i ? { ...fila, valor } : fila,
                      ),
                    )
                  }
                />
                <TextInput
                  accessibilityLabel={`${t("Cantidad total")} ${i + 1}`}
                  value={f.cantidad}
                  keyboardType="number-pad"
                  selectionColor={tema.acento}
                  style={[campoNumero, { flex: 1 }]}
                  onChangeText={(cantidad) =>
                    setFilasEditadas(
                      filas.map((fila, k) =>
                        k === i ? { ...fila, cantidad } : fila,
                      ),
                    )
                  }
                />
              </View>
            ))}
          </View>
        </>
      )}
      {reparto && (
        <Tarjeta style={{ gap: 0 }}>
          <Texto style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            {t("Reparto por jugador")}
          </Texto>
          <View style={{ flexDirection: "row", gap: 12, paddingVertical: 6 }}>
            <Texto suave style={{ width: 36, fontSize: 13 }}>
              {t("Ficha")}
            </Texto>
            <Texto suave style={{ flex: 1, fontSize: 13, textAlign: "right" }}>
              {t("Por jugador")}
            </Texto>
            <Texto suave style={{ flex: 1, fontSize: 13, textAlign: "right" }}>
              {t("Reserva")}
            </Texto>
          </View>
          {reparto.reparto.map((d) => {
            const i = filas.findIndex((f) => Number(f.valor) === d.valor);
            return (
              <View
                key={d.valor}
                accessible
                accessibilityLabel={`${t("{n} fichas de {valor}", { n: d.porJugador, valor: n(d.valor) })}. ${t("Reserva")}: ${n(d.reserva)}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 48,
                  borderTopWidth: 1,
                  borderColor: tema.borde,
                }}
              >
                <Ficha
                  indice={Math.max(0, i)}
                  valor={String(d.valor)}
                  idioma={preferencias.idioma}
                />
                <Texto
                  style={{
                    flex: 1,
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "right",
                  }}
                  condensada
                >
                  {n(d.porJugador)}
                </Texto>
                <Texto
                  suave
                  style={{ flex: 1, fontSize: 16, textAlign: "right" }}
                >
                  {n(d.reserva)}
                </Texto>
              </View>
            );
          })}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderTopWidth: 1,
              borderColor: tema.borde,
              paddingTop: 10,
              marginTop: 2,
            }}
          >
            <Texto style={{ fontSize: 16, fontWeight: "600" }}>
              {t("Stack por jugador")}
            </Texto>
            <Texto style={{ fontSize: 28, fontWeight: "700" }}>
              {n(reparto.stack)}
            </Texto>
          </View>
        </Tarjeta>
      )}
      {!!(error || accion.error || mesa.error) && (
        <Texto>{error || accion.error || mensajeError(mesa.error)}</Texto>
      )}
      {accion.incierto && (
        <Boton titulo={t("Reintentar")} onPress={accion.reintentar} />
      )}
      <Boton
        titulo={t("Guardar")}
        disabled={!editable || accion.ocupado}
        onPress={guardar}
      />
    </Pantalla>
  );
}
