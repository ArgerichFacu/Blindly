import { useState } from "react";
import { useRouter } from "expo-router";
import { Boton, Campo, Pantalla, Tarjeta, Texto } from "../components/Controles";
import { crearLiga } from "../lib/ligas";
import { usePlus } from "../lib/PlusContext";
import { usePreferencias } from "../lib/Preferencias";

export default function LigaNueva() {
  const router = useRouter();
  const plus = usePlus();
  const { t, mensajeError } = usePreferencias();
  const [nombre, setNombre] = useState("");
  const [temporada, setTemporada] = useState("");
  const [jugador, setJugador] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    if (ocupado) return;
    setOcupado(true);
    setError("");
    try {
      const creada = await crearLiga(nombre, temporada, jugador);
      router.replace({ pathname: "/liga", params: { id: creada.liga_id } });
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  if (!plus.activo)
    return (
      <Pantalla titulo={t("Crear liga")}>
        <Tarjeta>
          <Texto style={{ fontWeight: "700" }}>{t("Esta función requiere Blindly Plus.")}</Texto>
          <Texto suave>{t("Solo el owner necesita Plus. Todos sus invitados pueden participar gratis.")}</Texto>
          <Boton titulo={t("Ver planes de Blindly Plus")} onPress={() => router.replace("/plus")} />
        </Tarjeta>
      </Pantalla>
    );

  const valido = nombre.trim().length >= 2 && temporada.trim().length >= 2 && jugador.trim().length >= 1;
  return (
    <Pantalla
      titulo={t("Crear liga")}
      subtitulo={t("Dale una identidad a tu grupo y empezá su primera temporada.")}
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
      <Texto suave>{t("Los demás miembros se incorporan automáticamente al jugar su primera partida asociada.")}</Texto>
      {!!error && <Texto>{error}</Texto>}
      <Boton
        titulo={t(ocupado ? "Guardando…" : "Crear liga")}
        disabled={!valido || ocupado}
        onPress={() => void guardar()}
      />
    </Pantalla>
  );
}
