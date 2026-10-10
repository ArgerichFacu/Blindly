import { useRef, useState } from "react";
import { Alert, Modal, Pressable, Share, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { Boton, Texto } from "./Controles";
import { Acabado } from "./Superficie";
import { RELIEVE, velo } from "../lib/visual";
import { Icono } from "./Icono";
import { obtenerInvitacionLiga } from "../lib/ligas";
import { enlaceInvitacion } from "../lib/invitaciones";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
export function InvitacionClub({ ligaId, nombre }: {
    ligaId: string;
    nombre?: string;
}) {
    const { t, mensajeError, preferencias } = usePreferencias(), { tema } = useTema();
    const [visible, setVisible] = useState(false), [qr, setQr] = useState(false), [copiado, setCopiado] = useState(false);
    const [invitacion, setInvitacion] = useState<{
        codigo: string;
        vence_en: string;
    } | null>(null);
    const [ocupado, setOcupado] = useState(false), [error, setError] = useState("");
    const bloqueo = useRef(false), enlace = invitacion ? enlaceInvitacion(invitacion.codigo) : "";
    async function obtener(renovar = false) {
        if (bloqueo.current)
            return;
        bloqueo.current = true;
        setOcupado(true);
        setError("");
        setCopiado(false);
        try {
            setInvitacion(await obtenerInvitacionLiga(ligaId, renovar));
        }
        catch (e) {
            setError(mensajeError(e));
        }
        finally {
            bloqueo.current = false;
            setOcupado(false);
        }
    }
    return <>
    <Pressable accessibilityRole="button" accessibilityLabel={t("Invitar al club")} onPress={() => { setVisible(true); setQr(false); void obtener(); }} style={({ pressed }) => ({ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 8, padding: 12, minHeight: 44, borderRadius: 24, borderWidth: 1, backgroundColor: tema.fondoTarjeta, ...RELIEVE.bajo, borderColor: velo(tema.acento, "40"), opacity: pressed ? .6 : 1 })}><Icono nombre="compartir" color={tema.acento} size={18}/><Texto style={{ fontSize: 13, color: tema.acento }}>{t("Invitar al club")}</Texto></Pressable>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.65)" }}>
        <SafeAreaView edges={["bottom", "left", "right"]} style={{ maxHeight: "90%", backgroundColor: tema.fondoTarjeta, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: velo(tema.acento, "50"), ...RELIEVE.modal }}><Acabado />
          <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: tema.borde, alignSelf: "center" }}/>
            <Texto suave style={{ fontSize: 11, letterSpacing: 1.5 }}>{t("Invitar al club")}</Texto>
            <Texto style={{ fontSize: 27, fontWeight: "800" }}>{nombre ?? t("Nuestro club de póker")}</Texto>
            <Texto suave>{t("Sumalos a la liga. La próxima noche empieza acá.")}</Texto>
            {ocupado && <Texto>{t("Cargando…")}</Texto>}
            {invitacion && <>
              <Boton titulo={t("Compartir invitación")} disabled={ocupado} onPress={() => void Share.share({ message: t("Te invitaron a {nombre}. Unite a la liga en Blindly y peleá por el MVP.\n{enlace}", { nombre: nombre ?? t("Nuestro club de póker"), enlace }) }).catch(e => setError(mensajeError(e)))}/>
              <Boton titulo={t(copiado ? "Enlace copiado" : "Copiar enlace")} secundario disabled={ocupado} onPress={() => void Clipboard.setStringAsync(enlace).then(() => setCopiado(true)).catch(e => setError(mensajeError(e)))}/>
              <Boton titulo={t(qr ? "Ocultar QR" : "Mostrar QR")} compacto secundario disabled={ocupado} onPress={() => setQr(v => !v)}/>
              {qr && <View accessible accessibilityLabel={t("Código de invitación: {codigo}", { codigo: invitacion.codigo })} style={{ alignSelf: "center", padding: 16, backgroundColor: "white", borderRadius: 20, ...RELIEVE.panel }}><QRCode value={enlace} size={180}/></View>}
              <Texto suave>{t("Código o enlace de invitación")}</Texto><Texto selectable style={{ fontSize: 16, fontWeight: "700", letterSpacing: .5 }}>{invitacion.codigo}</Texto>
              <Texto suave style={{ fontSize: 12 }}>{t("Vence: {fecha}", { fecha: new Date(invitacion.vence_en).toLocaleDateString(preferencias.idioma) })}</Texto>
              <Boton titulo={t("Renovar código")} compacto secundario disabled={ocupado} onPress={() => Alert.alert(t("Renovar código"), t("El código anterior dejará de funcionar. Los miembros actuales conservan su lugar."), [{ text: t("Cancelar"), style: "cancel" }, { text: t("Renovar código"), onPress: () => void obtener(true) }])}/>
            </>}
            {!!error && <><Texto>{error}</Texto><Boton titulo={t("Reintentar")} compacto secundario disabled={ocupado} onPress={() => void obtener()}/></>}
            <Boton titulo={t("Cerrar")} compacto secundario onPress={() => setVisible(false)}/>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </>;
}
