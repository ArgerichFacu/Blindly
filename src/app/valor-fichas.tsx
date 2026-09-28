import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
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
export default function ValorFichas() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>(),
    router = useRouter(),
    { t, mensajeError } = usePreferencias();
  const mesa = useSala(codigo),
    { sala, jugadores } = mesa,
    accion = useAccionMesa(sala, mesa.aplicar);
  const [tipo, setTipo] = useState<"fisicas" | "virtuales">("fisicas"),
    [stack, setStack] = useState("5000"),
    [error, setError] = useState("");
  const [filas, setFilas] = useState(
    [25, 50, 100, 500, 1000].map((valor) => ({
      valor: String(valor),
      cantidad: "0",
    })),
  );
  const [cargado, setCargado] = useState(false);
  useEffect(() => {
    if (!sala || cargado) return;
    const f = sala.configuracion.fichas;
    if (f) {
      setTipo(f.tipo);
      if (f.tipo === "virtuales") setStack(String(f.stack));
      else
        setFilas(
          f.denominaciones.map((d) => ({
            valor: String(d.valor),
            cantidad: String(d.cantidad),
          })),
        );
    }
    setCargado(true);
  }, [sala, cargado]);
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
            onPress={() => setTipo(valor)}
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
            {[1000, 5000, 10000].map((n) => (
              <Boton
                key={n}
                titulo={n.toLocaleString()}
                compacto
                secundario={Number(stack) !== n}
                style={{ flex: 1 }}
                onPress={() => setStack(String(n))}
              />
            ))}
          </View>
          <Campo
            etiqueta={t("Stack inicial por jugador")}
            value={stack}
            onChangeText={setStack}
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
          {filas.map((f, i) => (
            <Tarjeta key={i}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Campo
                  etiqueta={`${t("Valor")} ${i + 1}`}
                  value={f.valor}
                  keyboardType="number-pad"
                  onChangeText={(valor) =>
                    setFilas((prev) =>
                      prev.map((fila, n) =>
                        n === i ? { ...fila, valor } : fila,
                      ),
                    )
                  }
                />
                <Campo
                  etiqueta={`${t("Cantidad total")} ${i + 1}`}
                  value={f.cantidad}
                  keyboardType="number-pad"
                  onChangeText={(cantidad) =>
                    setFilas((prev) =>
                      prev.map((fila, n) =>
                        n === i ? { ...fila, cantidad } : fila,
                      ),
                    )
                  }
                />
              </View>
            </Tarjeta>
          ))}
        </>
      )}
      {reparto && (
        <Tarjeta>
          <Texto>{t("Reparto por jugador")}</Texto>
          {reparto.reparto.map((d) => (
            <Texto key={d.valor}>
              {t("{n} fichas de {valor}", { n: d.porJugador, valor: d.valor })}{" "}
              · {t("Reserva")}: {d.reserva}
            </Texto>
          ))}
          <Texto>{t("Stack: {n}", { n: reparto.stack })}</Texto>
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
