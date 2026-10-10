import { useRouter } from "expo-router";
import { PasosTutorial } from "./TutorialInteractivo";
import { useInicio } from "../lib/InicioContext";
import { usePreferencias } from "../lib/Preferencias";

import { Boton, Etiqueta, Pantalla, Tarjeta, Texto } from "./Controles";
import { LogoBlindly } from "./LogoBlindly";


export { PasosTutorial } from "./TutorialInteractivo";

export function Introduccion() {
  const inicio = useInicio(),
    { t } = usePreferencias(),
    router = useRouter();
  return (
    <Pantalla titulo="blindly." volver={false}>
      {!inicio.datos ? (
        <Tarjeta>
          <Texto>
            {t(
              inicio.error
                ? "No se pudo cargar tu inicio. Probá de nuevo."
                : "Cargando…",
            )}
          </Texto>
          {inicio.error && (
            <Boton
              titulo={t("Reintentar")}
              onPress={() => void inicio.cargar()}
            />
          )}
        </Tarjeta>
      ) : inicio.datos.fase === "tutorial" ? (
        <PasosTutorial
          paso={inicio.datos.paso}
          ocupado={inicio.ocupado}
          error={inicio.error}
          avanzar={() => void inicio.avanzar()}
          retroceder={() => void inicio.retroceder()}
          terminar={() => void inicio.terminar()}
        />
      ) : (
        <>
          <LogoBlindly ancho={200} />
          <Etiqueta>{t("POKER ENTRE AMIGOS")}</Etiqueta>
          <Texto
            style={{
              fontSize: 36,
              lineHeight: 42,
              fontWeight: "700",
              letterSpacing: -1,
            }}
          >
            {t("Tu mesa.\nTu liga.\nTus rivalidades.")}
          </Texto>
          <Texto suave>
            {t(
              "Jugá ahora como invitado o protegé tu identidad para llevar tu historia a otro celular.",
            )}
          </Texto>
          {inicio.error && (
            <Texto>
              {t("No se pudo guardar tu progreso. Probá otra vez.")}
            </Texto>
          )}
          <Boton
            titulo={t("Continuar como invitado")}
            disabled={inicio.ocupado}
            onPress={() => void inicio.elegir("invitado")}
          />
          <Boton
            titulo={t("Crear o recuperar cuenta")}
            secundario
            disabled={inicio.ocupado}
            onPress={() =>
              router.push({ pathname: "/cuenta", params: { inicio: "1" } })
            }
          />
          <Texto suave>
            {t(
              "Podés proteger tu cuenta más adelante desde Opciones → Mi cuenta.",
            )}
          </Texto>
        </>
      )}
    </Pantalla>
  );
}
