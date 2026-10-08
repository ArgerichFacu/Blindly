import { capacidadesPlus } from "../lib/capacidadesPlus";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View } from "react-native";
import {
  Boton,
  Etiqueta,
  Pantalla,
  Tarjeta,
  Texto,
} from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { usePlus } from "../lib/PlusContext";
import { miHeadToHead, type Comparacion } from "../lib/puntuacion";
import { ProtegerCuenta } from "../components/ProtegerCuenta";

function Dato({
  etiqueta,
  yo,
  rival,
}: {
  etiqueta: string;
  yo: number;
  rival: number;
}) {
  const { tema } = useTema();
  return (
    <View
      style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}
    >
      <Texto style={{ color: tema.acento, fontWeight: "800", width: 42 }}>
        {yo}
      </Texto>
      <Texto suave style={{ flex: 1, textAlign: "center" }}>
        {etiqueta}
      </Texto>
      <Texto style={{ fontWeight: "800", textAlign: "right", width: 42 }}>
        {rival}
      </Texto>
    </View>
  );
}

export default function HeadToHead() {
  const router = useRouter();
  const { t, mensajeError } = usePreferencias();
  const plus = usePlus();
  const premium = capacidadesPlus(plus).premium;
  const [datos, setDatos] = useState<Comparacion[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [cargando, setCargando] = useState(true);
  useFocusEffect(
    useCallback(() => {
      let viva = true;
      setDatos([]);
      setError(null);
      setCargando(true);
      if (!premium) {
        setCargando(false);
        return () => {
          viva = false;
        };
      }
      void miHeadToHead()
        .then((resultado) => {
          if (viva) setDatos(resultado);
        })
        .catch((e) => {
          if (viva) setError(e);
        })
        .finally(() => {
          if (viva) setCargando(false);
        });
      return () => {
        viva = false;
      };
    }, [premium]),
  );
  if (!capacidadesPlus(plus).premium)
    return (
      <Pantalla
        titulo={t("Entre amigos")}
        subtitulo={t("Compará resultados con quienes compartiste mesa.")}
      >
        <Tarjeta>
          <Etiqueta>{t("BLINDLY PLUS")}</Etiqueta>
          <Texto>
            {t(
              "Descubrí quién terminó más veces arriba, sus victorias y sus podios compartidos.",
            )}
          </Texto>
        </Tarjeta>
        <Boton
          titulo={t("Ver planes de Blindly Plus")}
          onPress={() => router.push("/plus")}
        />
      </Pantalla>
    );
  return (
    <Pantalla
      titulo={t("Entre amigos")}
      subtitulo={t(
        "Solo aparecen jugadores con los que compartiste partidas finalizadas.",
      )}
    >
      {cargando && <Texto>{t("Cargando…")}</Texto>}
      {!!error && <Texto>{mensajeError(error)}</Texto>}
      <ProtegerCuenta error={error} volver="head-to-head" />
      {!cargando && !error && datos.length === 0 && (
        <Texto suave>
          {t(
            "Jugá y finalizá una partida con amigos para comparar resultados.",
          )}
        </Texto>
      )}
      {datos.map((rival) => (
        <Tarjeta key={rival.user_id}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Texto style={{ fontWeight: "800" }}>{t("VOS")}</Texto>
            <Texto style={{ fontSize: 19, fontWeight: "800" }}>
              {rival.nombre}
            </Texto>
          </View>
          <Texto suave style={{ textAlign: "center" }}>
            {t("{n} partidas juntos", { n: rival.partidas_juntos })}
          </Texto>
          <Dato
            etiqueta={t("Terminó arriba")}
            yo={rival.yo_arriba}
            rival={rival.rival_arriba}
          />
          <Dato
            etiqueta={t("Victorias")}
            yo={rival.mis_victorias}
            rival={rival.sus_victorias}
          />
          <Dato
            etiqueta={t("Podios")}
            yo={rival.mis_podios}
            rival={rival.sus_podios}
          />
          {!!rival.empates && (
            <Texto suave style={{ textAlign: "center" }}>
              {t("{n} empates", { n: rival.empates })}
            </Texto>
          )}
        </Tarjeta>
      ))}
      <Texto suave>
        {t(
          "La comparación usa solo resultados de partidas que ambos compartieron. No muestra el historial privado de otra persona.",
        )}
      </Texto>
    </Pantalla>
  );
}
