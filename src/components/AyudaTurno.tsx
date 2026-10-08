import { useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import { Boton, Texto } from "./Controles";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
type TurnoVirtual = {
  actual: number;
  aporte: number;
  igualar: number;
  totalIgualar: number;
  puedePasar: boolean;
  puedeSubir: boolean;
  min: number;
  max: number;
};
export function AyudaTurno({ virtual }: { virtual?: TurnoVirtual }) {
  const [abierta, setAbierta] = useState(false);
  const { t } = usePreferencias(),
    { tema } = useTema();
  return (
    <>
      <Boton
        titulo={t("? Ayuda de este turno")}
        secundario
        compacto
        onPress={() => setAbierta(true)}
      />
      <Modal
        visible={abierta}
        transparent
        animationType="none"
        onRequestClose={() => setAbierta(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: "85%",
              width: "100%",
              maxWidth: 540,
              alignSelf: "center",
              backgroundColor: tema.fondoTarjeta,
              borderRadius: 20,
              padding: 18,
              gap: 12,
            }}
          >
            <Texto style={{ fontSize: 22, lineHeight: 28, fontWeight: "700" }}>
              {t("Reglas de tu turno")}
            </Texto>
            <ScrollView contentContainerStyle={{ gap: 12 }}>
              {virtual ? (
                <>
                  <Texto>
                    {t("Apuesta actual: {actual}. Tu aporte: {aporte}.", {
                      actual: virtual.actual,
                      aporte: virtual.aporte,
                    })}
                  </Texto>
                  <Texto>
                    {t(
                      virtual.puedePasar
                        ? "Pasar (check): seguís sin agregar fichas, solo cuando no tenés una apuesta pendiente."
                        : "No podés pasar: hay una apuesta pendiente que igualar.",
                    )}
                  </Texto>
                  {!virtual.puedePasar && (
                    <>
                      <Texto>
                        {t(
                          "Igualar agrega {n} fichas; tu total en esta ronda queda en {total}.",
                          { n: virtual.igualar, total: virtual.totalIgualar },
                        )}
                      </Texto>
                      {virtual.totalIgualar < virtual.actual && (
                        <Texto>
                          {t(
                            "Tu stack no alcanza para igualar todo: la igualada será all-in por tus fichas restantes.",
                          )}
                        </Texto>
                      )}
                    </>
                  )}
                  {virtual.puedeSubir ? (
                    <>
                      <Texto>
                        {t(
                          "Subir (raise): aumentás el total de tu apuesta. La mesa indica el mínimo permitido.",
                        )}
                      </Texto>
                      <Texto>
                        {t(
                          virtual.max < virtual.min
                            ? "Solo podés subir all-in a {max}, por debajo del mínimo de una subida completa."
                            : "Mínimo para subir: total {min}. Máximo: total {max}.",
                          { min: virtual.min, max: virtual.max },
                        )}
                      </Texto>
                    </>
                  ) : (
                    <Texto>
                      {t(
                        "Subir no está disponible en este turno. Puede faltar stack, otro jugador capaz de apostar o una subida que reabra la acción.",
                      )}
                    </Texto>
                  )}
                </>
              ) : (
                <>
                  <Texto>
                    {t(
                      "Con fichas físicas, verificá en la mesa la apuesta pendiente y el mínimo antes de registrar tu acción.",
                    )}
                  </Texto>
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
                </>
              )}
              <Texto>
                {t(
                  "Retirarse (fold): dejás de participar en esa mano. Las fichas ya apostadas quedan en el pozo.",
                )}
              </Texto>
              <Texto suave>
                {t(
                  "Estas ayudas explican reglas, no recomiendan qué acción jugar.",
                )}
              </Texto>
            </ScrollView>
            <Boton
              titulo={t("Cerrar ayuda")}
              onPress={() => setAbierta(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
