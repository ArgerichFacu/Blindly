import { AudioMesa } from "../components/AudioMesa";
import { Linking } from "react-native";
import { Pantalla, Texto, Tarjeta, Boton } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
export default function Creditos() {
  const { t } = usePreferencias();
  return (
    <Pantalla titulo={t("Créditos de música")}>
      <Tarjeta>
        <Texto style={{ fontSize: 24, fontWeight: "700" }}>Lobby Time</Texto>
        <Texto>Kevin MacLeod · incompetech.com</Texto>
        <AudioMesa indice={0} corriendo musica />
        <Texto suave>{t("Jazz de salón para acompañar la mesa.")}</Texto>
        <Texto suave>
          {t(
            "Licencia Creative Commons Atribución 4.0. Pista original sin modificaciones, reproducida en bucle.",
          )}
        </Texto>
        <Boton
          titulo={t("Escuchar y conocer al autor")}
          secundario
          onPress={() => {
            void Linking.openURL(
              "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600054",
            );
          }}
        />
        <Boton
          titulo={t("Ver licencia")}
          secundario
          onPress={() => {
            void Linking.openURL(
              "https://creativecommons.org/licenses/by/4.0/",
            );
          }}
        />
      </Tarjeta>
    </Pantalla>
  );
}
