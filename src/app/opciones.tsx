import { useRouter } from "expo-router";
import { Switch, View } from "react-native";
import { Pantalla, Boton, Texto, Tarjeta } from "../components/Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { TEMAS } from "../lib/temas";
import { usePlus } from "../lib/PlusContext";
export default function Opciones() {
  const router = useRouter(),
    { t, preferencias, cambiar } = usePreferencias(),
    { tema, elegirTema } = useTema(),
    plus = usePlus();
  return (
    <Pantalla titulo={t("Opciones")}>
      <Tarjeta>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Texto>{t("Sonido de ronda")}</Texto>
          <Switch
            accessibilityLabel={t("Sonido de ronda")}
            value={preferencias.sonido}
            onValueChange={(sonido) => cambiar({ sonido })}
          />
        </View>
        {(["volumenRonda", "volumenMusica"] as const).map((clave) => (
          <View key={clave} style={{ gap: 8 }}>
            <Texto>
              {t(
                clave === "volumenRonda"
                  ? "Volumen de ronda"
                  : "Volumen de música",
              )}
              : {Math.round(preferencias[clave] * 100)}%
            </Texto>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Boton
                titulo="−"
                secundario
                disabled={preferencias[clave] <= 0}
                onPress={() =>
                  cambiar({
                    [clave]: Math.max(
                      0,
                      Math.round((preferencias[clave] - 0.1) * 10) / 10,
                    ),
                  })
                }
              />
              <Boton
                titulo="+"
                secundario
                disabled={preferencias[clave] >= 1}
                onPress={() =>
                  cambiar({
                    [clave]: Math.min(
                      1,
                      Math.round((preferencias[clave] + 0.1) * 10) / 10,
                    ),
                  })
                }
              />
            </View>
          </View>
        ))}
      </Tarjeta>
      <Tarjeta>
        <Texto>{t("Idioma")}</Texto>
        {(["es", "en", "pt"] as const).map((idioma) => (
          <Boton
            key={idioma}
            titulo={
              idioma === "es"
                ? "Español"
                : idioma === "en"
                  ? "English"
                  : "Português"
            }
            secundario={preferencias.idioma !== idioma}
            onPress={() => cambiar({ idioma })}
          />
        ))}
      </Tarjeta>
      <Tarjeta>
        <Texto>{t("Tema")}</Texto>
        {TEMAS.map((paleta) => {
          const bloqueado = !!paleta.plus && plus.disponible && !plus.activo;
          return (
            <Boton
              key={paleta.id}
              titulo={`${t(paleta.nombre)}${paleta.plus ? " · Plus" : ""}`}
              secundario={tema.id !== paleta.id}
              onPress={() =>
                bloqueado ? router.push("/plus") : elegirTema(paleta.id)
              }
            />
          );
        })}
      </Tarjeta>
      <Boton
        titulo={t("Instrucciones")}
        secundario
        onPress={() => router.push("/instrucciones")}
      />
      <Boton
        titulo={t("Combinaciones de poker")}
        secundario
        onPress={() => router.push("/combinaciones")}
      />
      <Boton
        titulo={t("Créditos de música")}
        secundario
        onPress={() => router.push("/creditos")}
      />
      <Boton
        titulo={t("Política de privacidad")}
        secundario
        onPress={() => router.push("/privacidad")}
      />
      <Boton
        titulo={t("Términos y condiciones")}
        secundario
        onPress={() => router.push("/terminos")}
      />
      <Boton
        titulo={t("Blindly Plus")}
        secundario
        onPress={() => router.push("/plus")}
      />
      <Boton
        titulo={t("Mi cuenta")}
        secundario
        onPress={() => router.push("/cuenta")}
      />
    </Pantalla>
  );
}
