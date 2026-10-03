import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
  const [ordenElegido, setOrdenElegido] = useState<string[]>([]),
    [dealerElegido, setDealerElegido] = useState("");
  const ordenVigente = ordenElegido.length ? ordenElegido : (sala?.orden ?? []);
  const orden = [
    ...ordenVigente.filter((id) => jugadores.some((j) => j.id === id)),
    ...jugadores.map((j) => j.id).filter((id) => !ordenVigente.includes(id)),
  ];
  const dealer = jugadores.some((j) => j.id === dealerElegido)
    ? dealerElegido
    : (sala?.dealer_id ?? jugadores[0]?.id ?? "");
  const accion = useAccionMesa(sala, mesa.aplicar);
  function mover(indice: number, direccion: number) {
    const copia = [...orden];
    [copia[indice], copia[indice + direccion]] = [
      copia[indice + direccion],
      copia[indice],
    ];
    setOrdenElegido(copia);
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
                    onPress={() => setDealerElegido(id)}
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
