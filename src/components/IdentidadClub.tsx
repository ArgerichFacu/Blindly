import { useRef, useState } from "react";
import { View } from "react-native";
import { Boton, Texto } from "./Controles";
import { guardarIdentidadClub } from "../lib/ligas";
import { coloresClub, emblemasClub, identidadClubSegura, type IdentidadClub as Identidad } from "../lib/identidadClub";
import { usePreferencias } from "../lib/Preferencias";

const nombres = { oro: "Oro", esmeralda: "Esmeralda", rubí: "Rubí", zafiro: "Zafiro", picas: "Picas", corazones: "Corazones", diamantes: "Diamantes", treboles: "Tréboles", liso: "Liso", rayas: "Rayas" } as const;
export function IdentidadClub({ ligaId, nombre, identidad, permitido, administrador, alGuardar }: {
  ligaId: string; nombre: string; identidad?: Identidad; permitido: boolean; administrador: boolean; alGuardar: () => void;
}) {
  const { t, mensajeError } = usePreferencias();
  const guardada = identidadClubSegura(identidad);
  const [borrador, setBorrador] = useState(guardada), [editando, setEditando] = useState(false);
  const [ocupado, setOcupado] = useState(false), [error, setError] = useState<unknown>(null);
  const enviando = useRef(false), vista = editando ? borrador : guardada;
  const color = coloresClub[vista.color];
  async function guardar() {
    if (!permitido || enviando.current) return;
    enviando.current = true; setOcupado(true); setError(null);
    try { await guardarIdentidadClub(ligaId, borrador); setEditando(false); alGuardar(); }
    catch (e) { setError(e); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return <View style={{ gap: 12 }}>
    <View accessible accessibilityLabel={`${nombre} · ${t(nombres[vista.emblema])} · ${t(nombres[vista.color])}`} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: color, backgroundColor: "#0A1713", flexDirection: "row", alignItems: "center", gap: 16, overflow: "hidden" }}>
      {vista.banner !== "liso" && <View pointerEvents="none" style={{ position: "absolute", right: -24, top: -42, width: 150, height: 150, borderWidth: vista.banner === "rayas" ? 18 : 2, borderColor: color + "33", transform: [{ rotate: "45deg" }], borderRadius: vista.banner === "rayas" ? 75 : 8 }} />}
      <Texto style={{ color, fontSize: 46, lineHeight: 54 }}>{emblemasClub[vista.emblema]}</Texto>
      <Texto style={{ color: "#F3F0E4", fontSize: 22, fontWeight: "900", flex: 1 }}>{nombre}</Texto>
    </View>
    {!!error && <Texto>{mensajeError(error)}</Texto>}
    {permitido && !editando && <Boton secundario compacto titulo={t("Personalizar club")} onPress={() => { setBorrador(guardada); setEditando(true); }} />}
    {administrador && !permitido && <Texto suave>{t("La identidad se conserva. Para editarla, el owner necesita Plus activo.")}</Texto>}
    {permitido && editando && <>
      <Texto>{t("Color del club")}</Texto>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(Object.keys(coloresClub) as (keyof typeof coloresClub)[]).map(color => <Boton key={color} compacto titulo={t(nombres[color])} secundario={borrador.color !== color} disabled={ocupado} onPress={() => setBorrador({ ...borrador, color })} />)}</View>
      <Texto>{t("Emblema")}</Texto>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(Object.keys(emblemasClub) as (keyof typeof emblemasClub)[]).map(emblema => <Boton key={emblema} compacto titulo={`${emblemasClub[emblema]} ${t(nombres[emblema])}`} secundario={borrador.emblema !== emblema} disabled={ocupado} onPress={() => setBorrador({ ...borrador, emblema })} />)}</View>
      <Texto>{t("Fondo del club")}</Texto>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(["liso", "rayas", "diamantes"] as const).map(banner => <Boton key={banner} compacto titulo={t(nombres[banner])} secundario={borrador.banner !== banner} disabled={ocupado} onPress={() => setBorrador({ ...borrador, banner })} />)}</View>
      <Boton titulo={t("Guardar identidad")} disabled={ocupado} onPress={() => void guardar()} />
      <Boton titulo={t("Cancelar")} secundario disabled={ocupado} onPress={() => setEditando(false)} />
    </>}
  </View>;
}
