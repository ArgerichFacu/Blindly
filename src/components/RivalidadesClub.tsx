import { Etiqueta, Tarjeta, Texto } from "./Controles";
import { usePreferencias } from "../lib/Preferencias";
import { useTema } from "../lib/TemaContext";
import type { DetalleLiga } from "../lib/ligas";

export function RivalidadesClub({ datos, pique = false }: { datos?: DetalleLiga["rivalidades"]; pique?: boolean }) {
  const { t } = usePreferencias(), { tema } = useTema();
  const rivales = datos?.rivales ?? [];
  return <>
    <Texto suave>{t("Compara posiciones finales de torneos de esta temporada. Requiere al menos 3 compartidos.")}</Texto>
    {datos?.nemesis && <Tarjeta style={{ borderColor: tema.acento }}>
      <Etiqueta>{t("TU NÉMESIS")}</Etiqueta>
      <Texto style={{ fontSize: 24, fontWeight: "800" }}>{datos.nemesis.nombre}</Texto>
      <Texto>{t("{n} torneos juntos", { n: datos.nemesis.compartidas })}</Texto>
      <Texto>{t("Vos {vos} · Rival {rival} · Empates {empates}", { vos: datos.nemesis.victorias, rival: datos.nemesis.derrotas, empates: datos.nemesis.empates })}</Texto>
      <Texto suave>{t("Entre tus balances desfavorables, es quien más veces terminó por encima de vos.")}</Texto>
      <Texto suave>{t(pique ? "La revancha se juega en la mesa. ¿Organizan otra noche?" : "Pueden organizar otra fecha para seguir jugando juntos.")}</Texto>
    </Tarjeta>}
    {rivales.length === 0 ? <Texto suave>{t("Todavía faltan torneos compartidos para mostrar rivalidades.")}</Texto> : <>
      {!datos?.nemesis && <Texto suave>{t("Por ahora no tenés una némesis con balance desfavorable.")}</Texto>}
      {rivales.map(rival => <Tarjeta key={rival.user_id}>
        <Texto style={{ fontSize: 20, fontWeight: "700" }}>{rival.nombre}</Texto>
        {!!rival.titulo_personalizado && <Etiqueta>{rival.titulo_personalizado}</Etiqueta>}
        <Texto suave>{t("{n} torneos juntos", { n: rival.compartidas })}</Texto>
        <Texto>{t("Vos {vos} · Rival {rival} · Empates {empates}", { vos: rival.victorias, rival: rival.derrotas, empates: rival.empates })}</Texto>
        {rival.recientes === 4 && <Texto suave>{t("Terminó por encima de vos en {n} de los últimos 4 torneos compartidos.", { n: rival.derrotas_recientes })}</Texto>}
      </Tarjeta>)}
    </>}
  </>;
}
