import { useRouter } from "expo-router";
import { Switch, View } from "react-native";
import {
  Acceso,
  Boton,
  Etiqueta,
  Pantalla,
  Seccion,
  Tarjeta,
  Texto,
} from "../components/Controles";
import { CartaPoker } from "../components/CartaPoker";
import { usePreferencias } from "../lib/Preferencias";
export default function Instrucciones() {
  const { t, preferencias, cambiar } = usePreferencias(),
    router = useRouter();
  return (
    <Pantalla
      titulo={t("Aprender póker")}
      subtitulo={t("Reglas claras. Cartas reales.")}
    >
      <Acceso
        titulo={t("Combinaciones de poker")}
        detalle={t("Probá tus cartas y encontrá las cinco mejores.")}
        simbolo="♠"
        onPress={() => router.push("/combinaciones")}
      />
      <Tarjeta>
        <Etiqueta>{t("CÓMO SE JUEGA")}</Etiqueta>
        <Texto>
          {t(
            "Recibís dos cartas privadas. La mesa puede mostrar hasta cinco cartas compartidas. Gana la mejor mano de cinco, o el último jugador que no se retiró.",
          )}
        </Texto>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            paddingVertical: 8,
          }}
        >
          <CartaPoker valor="A" palo="♠" />
          <CartaPoker valor="K" palo="♥" />
        </View>
        <Seccion titulo={t("Las cuatro rondas")} inicial>
          <Texto>
            {t("Preflop: dos cartas por jugador y primera ronda de apuestas.")}
          </Texto>
          <Texto>
            {t(
              "Flop: se muestran tres cartas de la mesa y se apuesta otra vez.",
            )}
          </Texto>
          <Texto>
            {t(
              "Turn: se agrega la cuarta carta. River: se agrega la quinta. Cada etapa tiene su ronda de apuestas.",
            )}
          </Texto>
          <Texto suave>
            {t(
              "Si queda más de un jugador, se comparan las manos. Si todos menos uno se retiran, ese jugador gana sin mostrar cartas.",
            )}
          </Texto>
        </Seccion>
      </Tarjeta>
      <Tarjeta>
        <Seccion titulo={t("Acciones de tu turno")}>
          <Texto>
            {t(
              "Pasar (check): seguís sin agregar fichas, solo cuando no tenés una apuesta pendiente.",
            )}
          </Texto>
          <Texto>
            {t(
              "Igualar (call): agregás la diferencia hasta la apuesta actual, o tu stack restante si no te alcanza.",
            )}
          </Texto>
          <Texto>
            {t(
              "Subir (raise): aumentás el total de tu apuesta. La mesa indica el mínimo permitido.",
            )}
          </Texto>
          <Texto>
            {t(
              "Retirarse (fold): dejás de participar en esa mano. Las fichas ya apostadas quedan en el pozo.",
            )}
          </Texto>
          <Etiqueta>{t("EJEMPLO DE IGUALADA")}</Etiqueta>
          <Texto>
            {t(
              "La apuesta actual es 500 y ya pusiste 200. Igualar agrega 300; tu total en esa ronda queda en 500.",
            )}
          </Texto>
          <Texto suave>
            {t(
              "Estas ayudas explican reglas, no recomiendan qué acción jugar.",
            )}
          </Texto>
        </Seccion>
      </Tarjeta>
      <Tarjeta>
        <Seccion titulo={t("Ciegas y botón")}>
          <Texto>
            {t(
              "SB es la ciega pequeña y BB la grande: apuestas obligatorias al inicio. BTN marca el botón que rota con las ciegas.",
            )}
          </Texto>
          <Texto>
            {t(
              "DR es el dealer fijo y reparte los pozos. BTN es el botón que rota con las ciegas. Con dos jugadores, BTN también es SB.",
            )}
          </Texto>
          <Texto>
            {t(
              "Antes del flop empieza quien sigue a BB. Después del flop empieza el primer jugador activo a la izquierda de BTN. En heads-up, BTN/SB empieza preflop y BB después del flop.",
            )}
          </Texto>
          <Texto suave>
            {t("Las ciegas virtuales se descuentan al comenzar cada mano.")}
          </Texto>
        </Seccion>
        <Seccion titulo={t("All-in")}>
          <Texto>
            {t(
              "All-in significa apostar todas tus fichas restantes. Seguís en la mano, pero solo podés ganar la parte del pozo cubierta por tu aporte.",
            )}
          </Texto>
          <Texto suave>
            {t(
              "Un all-in corto puede no reabrir la posibilidad de subir para quienes ya actuaron. Blindly muestra las acciones legales.",
            )}
          </Texto>
        </Seccion>
        <Seccion titulo={t("Pozos secundarios (side pots)")}>
          <Texto>
            {t(
              "Ejemplo: A aporta 100, B 300 y C 300. El pozo principal tiene 300 y pueden ganarlo A, B o C. El pozo secundario tiene 400 y solo pueden ganarlo B o C.",
            )}
          </Texto>
          <Texto>
            {t(
              "Si A gana la mejor mano, recibe el principal. B y C comparan sus manos para el secundario. La suma sigue siendo 700.",
            )}
          </Texto>
          <Texto suave>
            {t(
              "El dealer elige los ganadores. Cada pozo muestra solo los jugadores elegibles.",
            )}
          </Texto>
        </Seccion>
      </Tarjeta>
      <Tarjeta>
        <Seccion titulo={t("Blindly en la mesa")}>
          <Texto>
            {t(
              "Con fichas virtuales, cada jugador pasa, iguala, sube o se retira desde su celular. El dealer indica al ganador y reparte el pozo.",
            )}
          </Texto>
          <Texto>
            {t(
              "Ejemplo: con 100 fichas, apostar 20 deja 80 en tu stack y suma 20 al pozo. Al terminar la mano, el dealer entrega el pozo a quien corresponda.",
            )}
          </Texto>
          <Texto>
            {t(
              "Con fichas físicas, las apuestas y el reparto se hacen en la mesa. Blindly organiza las ciegas y los turnos que correspondan al modo.",
            )}
          </Texto>
          <Texto suave>
            {t(
              "Las cantidades corresponden al total disponible en la mesa. El sobrante queda en reserva.",
            )}
          </Texto>
        </Seccion>
      </Tarjeta>
      <Boton
        titulo={t("Guía rápida")}
        secundario
        onPress={() => router.push("/tutorial")}
      />
      <Tarjeta>
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
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
    </Pantalla>
  );
}
