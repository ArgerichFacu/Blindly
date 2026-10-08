import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Boton,
  Campo,
  Pantalla,
  Tarjeta,
  Texto,
} from "../components/Controles";
import { crearLiga } from "../lib/ligas";
import { useIdentidad } from "../lib/useIdentidad";
import { usePreferencias } from "../lib/Preferencias";
import { vibrarMomento } from "../lib/hapticos";

export default function LigaNueva() {
  const router = useRouter();
  const identidad = useIdentidad();
  const { t, mensajeError, preferencias } = usePreferencias();
  const enviando = useRef(false);
  const [nombre, setNombre] = useState("");
  const [temporada, setTemporada] = useState("");
  const [jugador, setJugador] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setError("");
    try {
      const creada = await crearLiga(nombre, temporada, jugador);
      void vibrarMomento("club", preferencias.hapticos, `club:${creada.liga_id}`);
      router.replace({ pathname: "/liga", params: { id: creada.liga_id } });
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }

  if (identidad.cargando)
    return (
      <Pantalla titulo={t("Crear liga")}>
        <Texto>{t("Cargando…")}</Texto>
      </Pantalla>
    );
  if (!identidad.recuperable)
    return (
      <Pantalla titulo={t("Crear liga")}>
        <Tarjeta>
          <Texto style={{ fontWeight: "700" }}>
            {t("Protegé tu cuenta para crear tu club")}
          </Texto>
          <Texto suave>
            {t(
              "Las ligas son Free. Una clave de recuperación conserva tu identidad, tus puntos y tus temporadas.",
            )}
          </Texto>
          {!!identidad.error && <Texto>{mensajeError(identidad.error)}</Texto>}
          <Boton
            titulo={t("Proteger mi cuenta")}
            onPress={() =>
              router.push({
                pathname: "/cuenta",
                params: { volver: "liga-nueva" },
              })
            }
          />
        </Tarjeta>
      </Pantalla>
    );

  const valido =
    nombre.trim().length >= 2 &&
    temporada.trim().length >= 2 &&
    jugador.trim().length >= 1;
  return (
    <Pantalla
      titulo={t("Crear liga")}
      subtitulo={t(
        "Dale una identidad a tu grupo y empezá su primera temporada.",
      )}
    >
      <Campo
        etiqueta={t("Nombre de la liga")}
        placeholder={t("Los Pibes Poker League")}
        value={nombre}
        onChangeText={setNombre}
        maxLength={50}
      />
      <Campo
        etiqueta={t("Nombre de la temporada")}
        placeholder={t("Temporada 2026")}
        value={temporada}
        onChangeText={setTemporada}
        maxLength={50}
      />
      <Campo
        etiqueta={t("Tu nombre en la liga")}
        placeholder={t("Nombre de jugador")}
        value={jugador}
        onChangeText={setJugador}
        maxLength={30}
      />
      <Texto suave>
        {t(
          "Los demás miembros se incorporan automáticamente al jugar su primera partida asociada.",
        )}
      </Texto>
      {!!error && <Texto>{error}</Texto>}
      <Boton
        titulo={t(ocupado ? "Guardando…" : "Crear liga")}
        disabled={!valido || ocupado}
        onPress={() => void guardar()}
      />
    </Pantalla>
  );
}
