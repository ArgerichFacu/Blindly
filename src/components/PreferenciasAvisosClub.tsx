import { useRef, useState } from "react";
import { Switch, View } from "react-native";
import { Boton, Tarjeta, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import { guardarPreferenciasAvisos } from "../lib/ligas";
import { AVISOS_INICIALES, type PreferenciasAvisos } from "../lib/avisosClub";

export function PreferenciasAvisosClub({ liga, preferencias, alGuardar, actualizar }: {
  liga: string; preferencias?: PreferenciasAvisos;
  alGuardar: (p: PreferenciasAvisos) => void; actualizar: () => void;
}) {
  const { t, mensajeError } = usePreferencias();
  const { tema } = useTema();
  const [borrador, setBorrador] = useState(preferencias ?? AVISOS_INICIALES);
  const [ocupado, setOcupado] = useState(false), [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const enviando = useRef(false);
  const campos = [
    ["activos", "Recibir avisos del club"], ["pique", "Modo pique"],
    ["mvp", "Cambios de MVP"], ["rivalidades", "Avisos de rivalidades"],
    ["fechas", "Próximas fechas"], ["temporadas", "Cierre de temporadas"],
    ["recordatorios", "Recordatorios para juntarse"],
  ] as const;
  function cambiar(cambios: Partial<PreferenciasAvisos>) {
    setBorrador(p => ({ ...p, ...cambios })); setGuardado(false);
  }
  async function guardar() {
    if (enviando.current || !preferencias) return;
    enviando.current = true; setOcupado(true); setError(null); setGuardado(false);
    try {
      const resultado = await guardarPreferenciasAvisos(liga, borrador);
      setBorrador(resultado); alGuardar(resultado); setGuardado(true);
    } catch (e) { setError(e); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return <Tarjeta>
    <Texto suave>{t("Estas preferencias son tuyas y se conservan al recuperar tu cuenta.")}</Texto>
    <Texto suave>{t("El envío push todavía no está habilitado en esta versión.")}</Texto>
    {campos.map(([clave, etiqueta]) => <View key={clave} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
      <Texto style={{ flex: 1 }}>{t(etiqueta)}</Texto>
      <Switch accessibilityLabel={t(etiqueta)} value={borrador[clave]} disabled={ocupado || !preferencias}
        onValueChange={valor => cambiar({ [clave]: valor })} trackColor={{ true: tema.acento }} />
    </View>)}
    <Texto suave>{t("Modo pique cambia el tono, nunca los resultados. Desactivado, los mensajes son neutrales.")}</Texto>
    <Texto>{t("Avisos sociales por semana en este club")}</Texto>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {([0, 1, 2] as const).map(n => <Boton key={n} titulo={String(n)} compacto secundario={borrador.limite_social !== n}
        accesibilidad={t("Máximo {n} avisos sociales por semana", { n })}
        disabled={ocupado || !preferencias} onPress={() => cambiar({ limite_social: n })} />)}
    </View>
    <Texto suave>{t("MVP, fechas y cierres respetan su interruptor y no consumen el cupo social.")}</Texto>
    {!!error && <><Texto>{mensajeError(error)}</Texto><Boton titulo={t("Actualizar club")} secundario onPress={actualizar} disabled={ocupado} /></>}
    {guardado && <Texto>{t("Preferencias del club guardadas.")}</Texto>}
    <Boton titulo={t("Guardar preferencias")} disabled={ocupado || !preferencias} onPress={() => void guardar()} />
  </Tarjeta>;
}
