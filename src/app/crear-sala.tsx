import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pantalla, Boton, Texto, Campo, Tarjeta, Etiqueta } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { crearSala, type Sala } from "../lib/salas";
import { unirseASala } from "../lib/jugadores";
import { NIVELES_REGULAR } from "../lib/niveles";
import { crearSalaDesdeMesa } from "../lib/mesasHabituales";
export default function CrearSala() {
  const router = useRouter(),
    { t, mensajeError } = usePreferencias();
  const { temporada, liga, temporadaNombre, mesa, mesaNombre } = useLocalSearchParams<{
    temporada?: string;
    liga?: string;
    temporadaNombre?: string;
    mesa?: string;
    mesaNombre?: string;
  }>();
  const [nombre, setNombre] = useState(""),
    [ocupado, setOcupado] = useState(false),
    [error, setError] = useState("");
  const creada = useRef<Sala | null>(null),
    bloqueo = useRef(false);
  async function crear() {
    if (bloqueo.current) return;
    if (!nombre.trim()) {
      setError(t("Completá tu nombre."));
      return;
    }
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    try {
      const sala =
        creada.current ??
        (mesa
          ? await crearSalaDesdeMesa(mesa)
          : await crearSala(NIVELES_REGULAR, temporada?.trim() || null));
      creada.current = sala;
      await unirseASala(sala.codigo, nombre);
      router.replace({ pathname: "/sala", params: { codigo: sala.codigo } });
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  return (
    <Pantalla
      titulo={t("Crear sala")}
      subtitulo={t("Vos organizás. Tus amigos se suman.")}
    >
      <Texto suave>
        {t(
          "Primero, ¿cómo te llamás? Después podrás invitar a tu mesa y elegir cómo jugar.",
        )}
      </Texto>
      {!!temporada && (
        <Tarjeta>
          <Etiqueta>{t("PARTIDA DE LIGA")}</Etiqueta>
          <Texto style={{ fontWeight: "700", fontSize: 17 }}>
            {liga ?? t("Liga")}
          </Texto>
          <Texto suave>{temporadaNombre ?? t("Temporada activa")}</Texto>
          <Texto suave>
            {t("Al finalizar, los puntos se sumarán automáticamente al ranking de esta temporada.")}
          </Texto>
        </Tarjeta>
      )}
      {!!mesa && (
        <Tarjeta>
          <Etiqueta>{t("MESA HABITUAL")}</Etiqueta>
          <Texto style={{ fontWeight: "700", fontSize: 17 }}>{mesaNombre ?? t("Mesa habitual")}</Texto>
          <Texto suave>{t("La sala se creará con la configuración guardada. Podrás ajustarla antes de iniciar.")}</Texto>
        </Tarjeta>
      )}
      <Campo
        etiqueta={t("Tu nombre")}
        value={nombre}
        onChangeText={setNombre}
        maxLength={30}
        autoComplete="name"
      />
      {!!error && <Texto>{error}</Texto>}
      <Boton
        titulo={t(ocupado ? "Guardando…" : "Crear sala")}
        disabled={ocupado || !nombre.trim()}
        onPress={crear}
      />
    </Pantalla>
  );
}
