import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Pantalla,
  Boton,
  Texto,
  Tarjeta,
  Pasos,
} from "../components/Controles";
import { MesaAsientos } from "../components/MesaAsientos";
import { useSala } from "../lib/useSala";
import { useAccionMesa } from "../lib/useAccionMesa";
import { usePreferencias } from "../lib/Preferencias";
export default function Ordenar() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>(),
    router = useRouter(),
    { t, mensajeError } = usePreferencias();
  const mesa = useSala(codigo),
    { sala, jugadores, usuario } = mesa;
  const [orden, setOrden] = useState<string[]>([]),
    [dealer, setDealer] = useState("");
  const firma = jugadores
    .map((j) => j.id)
    .sort()
    .join(",");
  useEffect(() => {
    if (!jugadores.length) return;
    setOrden((actual) => {
      const vigente = actual.length ? actual : (sala?.orden ?? []);
      return [
        ...vigente.filter((id) => jugadores.some((j) => j.id === id)),
        ...jugadores.map((j) => j.id).filter((id) => !vigente.includes(id)),
      ];
    });
    setDealer((actual) =>
      jugadores.some((j) => j.id === actual)
        ? actual
        : (sala?.dealer_id ?? jugadores[0].id),
    );
  }, [firma]);
  const accion = useAccionMesa(sala, mesa.aplicar);
  function mover(indice: number, direccion: number) {
    setOrden((prev) => {
      const copia = [...prev];
      [copia[indice], copia[indice + direccion]] = [
        copia[indice + direccion],
        copia[indice],
      ];
      return copia;
    });
  }
  return (
    <Pantalla titulo={t("Ordenar sala")}>
      <Pasos actual={1} />
      <Texto>
        {t("Ordená los jugadores como están sentados, en sentido horario.")}
      </Texto>
      {mesa.error ? (
        <Texto>{mensajeError(mesa.error)}</Texto>
      ) : !sala ? (
        <Texto>{t("Cargando…")}</Texto>
      ) : sala.host_id !== usuario ? (
        <Texto>{t("Solo el host puede hacer esto.")}</Texto>
      ) : (
        <>
          <MesaAsientos jugadores={jugadores} orden={orden} dealer={dealer} />
          {orden.map((id, i) => {
            const j = jugadores.find((j) => j.id === id);
            return (
              <Tarjeta key={id}>
                <Texto>
                  {i + 1}. {j?.nombre} {id === dealer ? "DR" : ""}
                </Texto>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  <Boton
                    titulo={t("Subir")}
                    secundario
                    disabled={i === 0 || accion.ocupado}
                    onPress={() => mover(i, -1)}
                  />
                  <Boton
                    titulo={t("Bajar")}
                    secundario
                    disabled={i === orden.length - 1 || accion.ocupado}
                    onPress={() => mover(i, 1)}
                  />
                  <Boton
                    titulo={t(
                      id === dealer ? "Dealer elegido" : "Elegir dealer",
                    )}
                    secundario
                    disabled={accion.ocupado}
                    onPress={() => setDealer(id)}
                  />
                </View>
              </Tarjeta>
            );
          })}
          {!!accion.error && <Texto>{accion.error}</Texto>}
          {accion.incierto && (
            <Boton titulo={t("Reintentar")} onPress={accion.reintentar} />
          )}
          <Boton
            titulo={t("Continuar")}
            disabled={
              accion.ocupado ||
              jugadores.length < 2 ||
              sala.estado !== "esperando"
            }
            onPress={() =>
              accion.ejecutar("ordenar", { orden, dealer }, () =>
                router.push({ pathname: "/configurar", params: { codigo } }),
              )
            }
          />
        </>
      )}
    </Pantalla>
  );
}
