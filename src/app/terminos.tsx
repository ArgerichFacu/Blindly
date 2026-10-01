import { useRouter } from "expo-router";
import { Boton, Pantalla, Texto } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";

export default function Terminos() {
  const { t } = usePreferencias();
  const router = useRouter();
  return (
    <Pantalla titulo={t("Términos y condiciones")}>
      <Texto>
        {t(
          "Blindly organiza partidas presenciales entre amigos. No procesa apuestas con dinero real ni premios. Los jugadores acuerdan las reglas y el dealer valida los resultados.",
        )}
      </Texto>
      <Texto>
        {t(
          "Blindly Plus podrá ofrecer funciones digitales opcionales mediante las tiendas oficiales. La partida esencial seguirá disponible sin una suscripción.",
        )}
      </Texto>
      <Boton
        titulo={t("Política de privacidad")}
        secundario
        onPress={() => router.push("/privacidad")}
      />
      <Boton
        titulo={t("Eliminar mi cuenta")}
        secundario
        onPress={() => router.push("/cuenta")}
      />
    </Pantalla>
  );
}
