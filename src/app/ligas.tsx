import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { View } from "react-native";
import {
  Acceso,
  Boton,
  Etiqueta,
  Pantalla,
  Tarjeta,
  Texto,
} from "../components/Controles";
import { misLigas, type ResumenLiga } from "../lib/ligas";
import { usePreferencias } from "../lib/Preferencias";

export default function Ligas() {
  const router = useRouter();
  const { t, mensajeError, preferencias } = usePreferencias();
  const [ligas, setLigas] = useState<ResumenLiga[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [revision, setRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void revision;
      let vivo = true;
      setError(null);
      void misLigas()
        .then((resultado) => vivo && setLigas(resultado))
        .catch((e) => vivo && setError(e));
      return () => {
        vivo = false;
      };
    }, [revision]),
  );

  return (
    <Pantalla
      titulo={t("Mis ligas")}
      subtitulo={t("Tus temporadas de poker entre amigos.")}
    >
      <Etiqueta>{t("BLINDLY LEAGUES")}</Etiqueta>
      <Tarjeta>
        <Texto style={{ fontSize: 22, lineHeight: 28, fontWeight: "800" }}>
          {t("Convertí tus partidas en una temporada.")}
        </Texto>
        <Texto suave>
          {t(
            "Ranking, puntos y resultados compartidos para tu grupo. Los invitados juegan gratis.",
          )}
        </Texto>
        <Boton
          titulo={t("+ Crear liga")}
          onPress={() => router.push("/liga-nueva")}
        />
        <Boton
          titulo={t("Unirme a un club")}
          secundario
          onPress={() => router.push("/liga-unirse")}
        />
      </Tarjeta>

      {!!error && (
        <Tarjeta>
          <Texto>{mensajeError(error)}</Texto>
          <Boton
            titulo={t("Reintentar")}
            onPress={() => setRevision((v) => v + 1)}
          />
        </Tarjeta>
      )}
      {!ligas && !error && <Texto>{t("Cargando…")}</Texto>}
      {ligas?.length === 0 && (
        <Texto suave>{t("Todavía no participás en ninguna liga.")}</Texto>
      )}
      <View style={{ gap: 10 }}>
        {ligas?.map((liga) => (
          <Acceso
            key={liga.id}
            titulo={liga.nombre}
            simbolo="🏆"
            detalle={[
              liga.temporada?.nombre ?? t("Sin temporada"),
              t("{n} miembros", { n: liga.miembros }),
              liga.ultima_partida
                ? t("Última partida: {fecha}", {
                    fecha: new Date(liga.ultima_partida).toLocaleDateString(
                      preferencias.idioma,
                    ),
                  })
                : t("Sin partidas finalizadas"),
            ].join(" · ")}
            onPress={() =>
              router.push({ pathname: "/liga", params: { id: liga.id } })
            }
          />
        ))}
      </View>
      <Texto suave>
        {t(
          "Tu club y sus temporadas son Free. Protegé tu cuenta para conservar tu lugar al cambiar de celular.",
        )}
      </Texto>
    </Pantalla>
  );
}
