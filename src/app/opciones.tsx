import { capacidadesPlus } from "../lib/capacidadesPlus";
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}><Texto style={{ flex: 1 }}>{t("Vibraciones de momentos importantes")}</Texto><Switch accessibilityLabel={t("Vibraciones de momentos importantes")} value={preferencias.hapticos} onValueChange={hapticos => cambiar({ hapticos })} /></View>
        <Texto suave>{t("Una vibración breve al confirmar all-in, clubes, títulos y fechas. Podés desactivarla.")}</Texto>
      </Tarjeta>
      <Tarjeta>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Texto style={{ flex: 1 }}>{t("Modo principiante")}</Texto>
          <Switch
            accessibilityLabel={t("Modo principiante")}
            value={preferencias.principiante}
            onValueChange={(principiante) => cambiar({ principiante })}
          />
        </View>
        <Texto suave>
          {t(
            "Activa ayuda sobre las reglas durante tu turno. No cambia las apuestas ni recomienda estrategia.",
          )}
        </Texto>
      </Tarjeta>
      <Boton
        titulo={t("Sonidos y ambiente")}
        secundario
        onPress={() => router.push("/sonidos")}
      />
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
          const bloqueado = !!paleta.plus && !capacidadesPlus(plus).personalizar;
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
        titulo={t("Aprender póker")}
        secundario
        onPress={() => router.push("/instrucciones")}
      />
      <Boton
        titulo={t("Guía rápida")}
        secundario
        onPress={() => router.push("/tutorial")}
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
