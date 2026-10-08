import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Boton, Tarjeta, Texto } from "./Controles";
import { historialClub, type PartidaLiga } from "../lib/ligas";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
export function HistorialClub({ liga, temporada, inicial, hayMas }: { liga: string; temporada: string; inicial: PartidaLiga[]; hayMas: boolean }) {
  const { t, mensajeError, preferencias } = usePreferencias(), { tema } = useTema();
  const [pagina, setPagina] = useState({ partidas: inicial, hay_mas: hayMas }), [anteriores, setAnteriores] = useState(false);
  const [ocupado, setOcupado] = useState(false), [error, setError] = useState<unknown>(null);
  const enviando = useRef(false), vivo = useRef(true);
  useEffect(() => { vivo.current = true; return () => { vivo.current = false; }; }, []);
  // Desmontar al cambiar temporada/revisión impide mezclar páginas del club.
  // La promesa sólo conserva el estado de esta instancia; nunca escribe al padre.
  async function siguiente() {
    const cursor = pagina.partidas.at(-1);
    if (!cursor || enviando.current || !pagina.hay_mas) return;
    enviando.current = true; setOcupado(true); setError(null);
    try { const r = await historialClub(liga, temporada, cursor); if (vivo.current) { setPagina(r); setAnteriores(true); } }
    catch (e) { if (vivo.current) setError(e); }
    finally { enviando.current = false; if (vivo.current) setOcupado(false); }
  }
  return <View style={{ gap: 10 }}>
    {!pagina.partidas.length && <Texto suave>{t("Todavía no hay partidas finalizadas en esta temporada.")}</Texto>}
    {pagina.partidas.map(partida => <Tarjeta key={partida.sala_id} style={{ padding: 14, gap: 5 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}><Texto style={{ fontWeight: "700", flex: 1 }}>{t("Ganó {nombre}", { nombre: partida.ganador ?? "—" })}</Texto><Texto style={{ color: tema.acento }}>{partida.codigo_sala}</Texto></View>
      <Texto suave>{t("{n} jugadores", { n: partida.jugadores })} · {new Date(partida.finalizada_en).toLocaleDateString(preferencias.idioma)}</Texto>
    </Tarjeta>)}
    {!!error && <Texto>{mensajeError(error)}</Texto>}
    {pagina.hay_mas && <Boton titulo={t("Ver partidas anteriores")} secundario disabled={ocupado} onPress={() => void siguiente()} />}
    {anteriores && <Boton titulo={t("Volver a las más recientes")} secundario disabled={ocupado} onPress={() => { setPagina({ partidas: inicial, hay_mas: hayMas }); setAnteriores(false); setError(null); }} />}
  </View>;
}
