import { useRef, useState } from "react";
import { Alert, Share, View } from "react-native";
import * as Linking from "expo-linking";
import QRCode from "react-native-qrcode-svg";
import { Boton, Texto, Tarjeta } from "./Controles";
import { obtenerInvitacionLiga } from "../lib/ligas";
import { usePreferencias } from "../lib/Preferencias";

export function InvitacionClub({ ligaId }: { ligaId: string }) {
  const { t, mensajeError, preferencias } = usePreferencias();
  const [invitacion, setInvitacion] = useState<{
    codigo: string;
    vence_en: string;
  } | null>(null);
  const [ocupado, setOcupado] = useState(false),
    [error, setError] = useState("");
  const bloqueo = useRef(false);
  const enlace = invitacion
    ? Linking.createURL("liga-unirse", {
        queryParams: { codigo: invitacion.codigo },
      })
    : "";
  async function obtener(renovar = false) {
    if (bloqueo.current) return;
    bloqueo.current = true;
    setOcupado(true);
    setError("");
    try {
      setInvitacion(await obtenerInvitacionLiga(ligaId, renovar));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  return (
    <Tarjeta>
      <Texto style={{ fontWeight: "800", fontSize: 20 }}>
        {t("Invitar al club")}
      </Texto>
      <Texto suave>
        {t(
          "Compartí el código o QR. Cada persona confirma su ingreso con una cuenta protegida.",
        )}
      </Texto>
      {!invitacion ? (
        <Boton
          titulo={t("Mostrar invitación")}
          disabled={ocupado}
          onPress={() => void obtener()}
        />
      ) : (
        <>
          <Texto
            selectable
            style={{ fontWeight: "800", fontSize: 22, letterSpacing: 1 }}
          >
            {invitacion.codigo}
          </Texto>
          <View
            accessible
            accessibilityLabel={t("Código de invitación: {codigo}", {
              codigo: invitacion.codigo,
            })}
            style={{
              alignSelf: "center",
              padding: 16,
              backgroundColor: "white",
              borderRadius: 16,
            }}
          >
            <QRCode value={enlace} size={180} />
          </View>
          <Texto suave>
            {t("Vence: {fecha}", {
              fecha: new Date(invitacion.vence_en).toLocaleDateString(
                preferencias.idioma,
              ),
            })}
          </Texto>
          <Boton
            titulo={t("Compartir invitación")}
            disabled={ocupado}
            onPress={() =>
              void Share.share({
                message: `${t("Invitación al club de Blindly")}\n${enlace}\n${invitacion.codigo}`,
              }).catch((e) => setError(mensajeError(e)))
            }
          />
          <Boton
            titulo={t("Renovar código")}
            secundario
            disabled={ocupado}
            onPress={() =>
              Alert.alert(
                t("Renovar código"),
                t(
                  "El código anterior dejará de funcionar. Los miembros actuales conservan su lugar.",
                ),
                [
                  { text: t("Cancelar"), style: "cancel" },
                  {
                    text: t("Renovar código"),
                    onPress: () => void obtener(true),
                  },
                ],
              )
            }
          />
        </>
      )}
      {!!error && <Texto>{error}</Texto>}
    </Tarjeta>
  );
}
