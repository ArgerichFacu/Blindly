import { Pantalla, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
export default function Terminos() {
  const { t } = usePreferencias();
  return (
    <Pantalla titulo={t("Términos y condiciones")}>
      <Texto>
        {t(
          "Blindly organiza partidas presenciales entre amigos. No procesa dinero real, pagos ni premios. Los jugadores acuerdan las reglas y el dealer valida los resultados. La identidad anónima puede perderse al borrar los datos de la app.",
        )}
      </Texto>
    </Pantalla>
  );
}
