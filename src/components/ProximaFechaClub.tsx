import { useRef, useState } from "react";
import { Alert, View } from "react-native";
import { Boton, Campo, Tarjeta, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { cancelarFechaLiga, programarFechaLiga, responderFechaLiga, type ProximaFecha } from "../lib/ligas";
import { instanteFecha } from "../lib/fechasClub";
import { vibrarMomento } from "../lib/hapticos";

export function ProximaFechaClub({ liga, fecha, administrar, activa, alCambiar }: {
  liga: string; fecha?: ProximaFecha | null; administrar: boolean; activa: boolean; alCambiar: () => void;
}) {
  const { t, mensajeError, preferencias } = usePreferencias();
  const [editar, setEditar] = useState(false), [dia, setDia] = useState(""), [hora, setHora] = useState("");
  const [lugar, setLugar] = useState(""), [nota, setNota] = useState(""), [error, setError] = useState<unknown>(null), [ocupado, setOcupado] = useState(false);
  const enviando = useRef(false);
  async function ejecutar(accion: () => Promise<unknown>) {
    if (enviando.current || !activa) return;
    enviando.current = true; setOcupado(true); setError(null);
    try { await accion(); setEditar(false); alCambiar(); }
    catch (e) { setError(e); }
    finally { enviando.current = false; setOcupado(false); }
  }
  const instante = instanteFecha(dia, hora);
  return <Tarjeta>
    {fecha ? <>
      <Texto style={{ fontSize: 22, fontWeight: "800" }}>{new Date(fecha.cuando).toLocaleString(preferencias.idioma, { dateStyle: "full", timeStyle: "short" })}</Texto>
      <Texto suave>{t("Hora local de tu dispositivo")}</Texto>
      {!!fecha.lugar && <Texto>{fecha.lugar}</Texto>}
      {!!fecha.nota && <Texto suave>{fecha.nota}</Texto>}
      <Texto>{t("{n} confirmados", { n: fecha.confirmados })} · {t("{n} pendientes", { n: fecha.pendientes })} · {t("{n} no pueden", { n: fecha.no_pueden })}</Texto>
      <Texto suave>{t("Tu respuesta: {respuesta}", { respuesta: t(fecha.mi_respuesta === "voy" ? "Voy" : fecha.mi_respuesta === "no_puedo" ? "No puedo" : "Pendiente") })}</Texto>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["voy", "no_puedo", "pendiente"] as const).map(respuesta => <Boton key={respuesta} titulo={t(respuesta === "voy" ? "Voy" : respuesta === "no_puedo" ? "No puedo" : "Pendiente")} compacto secundario={fecha.mi_respuesta !== respuesta} disabled={ocupado || !activa} onPress={() => void ejecutar(() => responderFechaLiga(fecha.id, respuesta))} />)}
      </View>
    </> : <Texto suave>{t("Todavía no hay una próxima fecha. Organicen la siguiente noche de póker.")}</Texto>}
    {!!error && <><Texto>{mensajeError(error)}</Texto><Boton titulo={t("Actualizar club")} compacto secundario onPress={alCambiar} /></>}
    {administrar && activa && (!editar ? <>
      <Boton titulo={t(fecha ? "Reprogramar fecha" : "Programar fecha")} secundario disabled={ocupado} onPress={() => { setEditar(true); setDia(""); setHora(""); setLugar(fecha?.lugar ?? ""); setNota(fecha?.nota ?? ""); }} />
      {!!fecha && <Boton titulo={t("Cancelar fecha")} secundario disabled={ocupado} onPress={() => Alert.alert(t("Cancelar fecha"), t("Las respuestas anteriores se conservarán."), [{ text: t("Volver"), style: "cancel" }, { text: t("Cancelar fecha"), style: "destructive", onPress: () => void ejecutar(() => cancelarFechaLiga(fecha.id)) }])} />}
    </> : <>
      <Campo etiqueta={t("Día (DD/MM/AAAA)")} value={dia} onChangeText={setDia} placeholder="10/10/2026" maxLength={10} keyboardType="numbers-and-punctuation" />
      <Campo etiqueta={t("Hora (HH:MM)")} value={hora} onChangeText={setHora} placeholder="22:00" maxLength={5} keyboardType="numbers-and-punctuation" />
      <Texto suave>{t("Hora local de tu dispositivo")}</Texto>
      <Campo etiqueta={t("Lugar (opcional)")} value={lugar} onChangeText={setLugar} maxLength={100} />
      <Campo etiqueta={t("Nota (opcional)")} value={nota} onChangeText={setNota} maxLength={280} multiline />
      {!!fecha && <Texto suave>{t("Reprogramar pide confirmar asistencia de nuevo; las respuestas anteriores se conservan.")}</Texto>}
      <Boton titulo={t("Guardar fecha")} disabled={ocupado || !instante} onPress={() => { if (instante) void ejecutar(async () => {
        if (Date.parse(instante) <= Date.now()) throw new Error("FECHA_INVALIDA");
        const id = await programarFechaLiga(liga, instante, lugar, nota, fecha?.id ?? null);
        void vibrarMomento("fecha", preferencias.hapticos, `fecha:${id}`);
        return id;
      }); }} />
      <Boton titulo={t("Volver")} secundario disabled={ocupado} onPress={() => setEditar(false)} />
    </>)}
  </Tarjeta>;
}
