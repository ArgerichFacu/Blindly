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
              "Entrá con Google o email, o jugá como invitado sin registrarte.",
            )}
          </Texto>
          {inicio.error && (
            <Texto>
              {t("No se pudo guardar tu progreso. Probá otra vez.")}
            </Texto>
          )}
          <Boton titulo={t("Continuar con Google")} disabled={inicio.ocupado}
            onPress={() => router.push({ pathname: "/cuenta", params: { inicio: "1", accion: "google" } })}/>
          <Boton titulo={t("Crear cuenta / Iniciar sesión")} secundario disabled={inicio.ocupado}
            onPress={() => router.push({ pathname: "/cuenta", params: { inicio: "1" } })}/>
          <Boton titulo={t("Jugar como invitado")} secundario disabled={inicio.ocupado}
            onPress={() => void inicio.elegir("invitado")}/>
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
