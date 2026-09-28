import { Pantalla, Texto, Tarjeta } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
export default function Instrucciones() {
  const { t } = usePreferencias();
  return (
    <Pantalla titulo={t("Instrucciones")}>
      <Tarjeta>
        <Texto>
          {t(
            "DR es el dealer fijo y reparte los pozos. BTN es el botón que rota con las ciegas. Con dos jugadores, BTN también es SB.",
          )}
        </Texto>
      </Tarjeta>
      <Tarjeta>
        <Texto>
          {t(
            "Ejemplo: con 100 fichas, apostar 20 deja 80 en tu stack y suma 20 al pozo. Al terminar la mano, el dealer entrega el pozo a quien corresponda.",
          )}
        </Texto>
        <Texto>
          {t("Las ciegas virtuales se descuentan al comenzar cada mano.")}
        </Texto>
        <Texto>
          {t(
            "El dealer elige los ganadores. Cada pozo muestra solo los jugadores elegibles.",
          )}
        </Texto>
      </Tarjeta>
      <Tarjeta>
        <Texto>
          {t(
            "Las apuestas y el reparto se realizan con las fichas de la mesa.",
          )}
        </Texto>
        <Texto>
          {t(
            "Las cantidades corresponden al total disponible en la mesa. El sobrante queda en reserva.",
          )}
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}
