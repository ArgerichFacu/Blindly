import { useRef, useState } from "react";
import { View } from "react-native";
import { Boton, Campo, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { asignarTituloLiga } from "../lib/ligas";

export function TituloPersonalizado({ ligaId, usuarioId, titulo, permitido, alGuardar }: {
  ligaId: string; usuarioId: string; titulo?: string | null; permitido: boolean; alGuardar: () => void;
}) {
  const { t, mensajeError } = usePreferencias();
  const [editando, setEditando] = useState(false), [valor, setValor] = useState(titulo ?? "");
  const [ocupado, setOcupado] = useState(false), [error, setError] = useState<unknown>(null);
  const enviando = useRef(false);
  async function guardar(nuevo: string | null) {
    if (enviando.current || !permitido) return;
    enviando.current = true;
    setOcupado(true); setError(null);
    try { await asignarTituloLiga(ligaId, usuarioId, nuevo); setEditando(false); alGuardar(); }
    catch (e) { setError(e); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return <View style={{ width: "100%", gap: 8 }}>
    {!!titulo && <Texto style={{ fontWeight: "700" }}>{titulo}</Texto>}
    {!!error && <Texto>{mensajeError(error)}</Texto>}
    {permitido && (editando ? <>
      <Campo etiqueta={t("Título personalizado")} value={valor} onChangeText={setValor} maxLength={24} autoCapitalize="characters" />
      <Texto suave>{t("De 2 a 24 caracteres. Sólo en este club; no se traduce.")}</Texto>
      <Boton titulo={t("Guardar título")} compacto disabled={ocupado || valor.trim().length < 2} onPress={() => void guardar(valor)} />
      {!!titulo && <Boton titulo={t("Quitar título")} compacto secundario disabled={ocupado} onPress={() => void guardar(null)} />}
      <Boton titulo={t("Cancelar")} compacto secundario disabled={ocupado} onPress={() => setEditando(false)} />
    </> : <Boton titulo={t(titulo ? "Editar título" : "Asignar título")} compacto secundario onPress={() => { setValor(titulo ?? ""); setEditando(true); }} />)}
  </View>;
}
