import { Etiqueta, Tarjeta, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import type { EventoClub } from "../lib/ligas";

export function FeedClub({ eventos }: { eventos?: EventoClub[] }) {
  const { t, preferencias } = usePreferencias();
  const lista = eventos ?? [];
  return <>
    <Texto suave>{t("Lo que pasó en esta temporada y la próxima fecha del club.")}</Texto>
    {lista.length === 0 && <Texto suave>{t("La historia del club empieza con su primera partida terminada.")}</Texto>}
    {lista.map(evento => <Tarjeta key={evento.id} style={{ padding: 14, gap: 6 }}>
      <Etiqueta>{t(evento.tipo === "partida" ? "TORNEO TERMINADO" : evento.tipo === "temporada" ? "TEMPORADA CERRADA" : evento.tipo === "mvp" ? "NUEVO MVP" : "PRÓXIMA FECHA PROGRAMADA")}</Etiqueta>
      <Texto suave>{evento.precision === "dia"
        ? new Date(`${evento.fecha}T12:00:00`).toLocaleDateString(preferencias.idioma)
        : new Date(evento.fecha).toLocaleString(preferencias.idioma, { dateStyle: "medium", timeStyle: "short" })}</Texto>
      <Texto style={{ fontSize: 18, fontWeight: "700" }}>{evento.tipo === "partida"
        ? t("Terminó la partida {codigo}", { codigo: evento.codigo })
        : evento.tipo === "temporada" ? t("Terminó {nombre}", { nombre: evento.nombre })
        : evento.tipo === "mvp" ? t("{nombre} tomó el MVP", { nombre: evento.nombre })
        : new Date(evento.cuando).toLocaleString(preferencias.idioma, { dateStyle: "full", timeStyle: "short" })}</Texto>
      {evento.tipo === "partida" && evento.jugadores != null && <Texto suave>{t("{n} jugadores", { n: evento.jugadores })}</Texto>}
    </Tarjeta>)}
    {lista.length === 20 && <Texto suave>{t("Mostrando los 20 eventos más recientes.")}</Texto>}
  </>;
}
