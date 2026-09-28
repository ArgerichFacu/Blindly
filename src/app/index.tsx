import { LogoBlindly } from "../components/LogoBlindly";
import { useRouter } from "expo-router";
import { View } from "react-native";
import {
  Pantalla,
  Texto,
  Acceso,
  Etiqueta,
  Boton,
} from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
export default function Menu() {
  const router = useRouter(),
    { t } = usePreferencias();
  return (
    <Pantalla titulo="blindly." volver={false}>
      <View style={{ paddingVertical: 18, gap: 20 }}>
        <Etiqueta>{t("POKER ENTRE AMIGOS")}</Etiqueta>
        <LogoBlindly />
        <View style={{ gap: 10 }}>
          <Texto
            style={{
              fontSize: 35,
              lineHeight: 40,
              fontWeight: "700",
              letterSpacing: -1.2,
            }}
          >
            {t("La mesa está lista.\nFaltan ustedes.")}
          </Texto>
          <Texto suave style={{ maxWidth: 360, fontSize: 15, lineHeight: 23 }}>
            {t(
              "Reuní a tus amigos. Blindly se ocupa de las ciegas, los turnos y las fichas.",
            )}
          </Texto>
        </View>
      </View>
      <Acceso
        titulo={t("Crear sala")}
        detalle={t("Organizá la partida e invitá a tu mesa.")}
        simbolo="+"
        onPress={() => router.push("/crear-sala")}
      />
      <Acceso
        titulo={t("Unirme")}
        detalle={t("Entrá con el código o escaneá el QR.")}
        simbolo="↗"
        onPress={() => router.push("/unirse")}
      />
      <Acceso
        titulo={t("Mi puntuación")}
        detalle={t("Tus puntos, tu progreso y tu rango.")}
        simbolo="♜"
        onPress={() => router.push("/puntuacion")}
      />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
        <Boton
          titulo={t("Cómo jugar")}
          secundario
          compacto
          style={{ flex: 1 }}
          onPress={() => router.push("/instrucciones")}
        />
        <Boton
          titulo={t("Opciones")}
          secundario
          compacto
          style={{ flex: 1 }}
          onPress={() => router.push("/opciones")}
        />
      </View>
      <Texto
        suave
        style={{
          textAlign: "center",
          fontSize: 11,
          letterSpacing: 1,
          marginTop: 8,
        }}
      >
        {t("EN LA MISMA MESA. EN CADA CELULAR.")}
      </Texto>
    </Pantalla>
  );
}
