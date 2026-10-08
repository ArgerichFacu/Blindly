type Idioma = "es" | "en" | "pt";
export type AvisoPush = { id: string; token: string; idioma: Idioma; pique: boolean; tipo: string; datos: Record<string, unknown>; liga: string; temporada: string | null };
export function mensajePush(aviso: AvisoPush) {
  const nombre = String(aviso.datos.nombre ?? "").replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").slice(0,50);
  const n = Number(aviso.datos.dias), perdidas = Number(aviso.datos.derrotas), total = Number(aviso.datos.compartidas);
  const es = aviso.idioma === "es", pt = aviso.idioma === "pt";
  let body: string, seccion: "ranking" | "fecha" | "rivalidades" = "ranking";
  switch(aviso.tipo) {
    case "mvp": body = es ? `${nombre} tomó el MVP.` : pt ? `${nombre} assumiu o MVP.` : `${nombre} took the MVP.`; break;
    case "fechas": seccion="fecha"; body=es?"Hay una nueva fecha para juntarse. Revisá el horario y confirmá tu asistencia.":pt?"Temos um novo encontro. Veja o horário e confirme sua presença.":"A new game night is scheduled. Check the time and RSVP."; break;
    case "temporadas": body=es?`Terminó ${nombre}. Mirá el ranking final.`:pt?`${nombre} terminou. Veja a classificação final.`:`${nombre} finished. See the final standings.`;break;
    case "rivalidades":
      if(!Number.isInteger(perdidas)||!Number.isInteger(total)||total<3||perdidas<1||perdidas>total) return null;
      seccion="rivalidades";
      body=es?`${nombre} terminó por encima de vos en ${perdidas} de ${total} torneos compartidos.`:pt?`${nombre} terminou à sua frente em ${perdidas} de ${total} torneios compartilhados.`:`${nombre} finished ahead of you in ${perdidas} of ${total} shared tournaments.`;break;
    case "recordatorios":
      if(!Number.isInteger(n)||n<12) return null;
      seccion="fecha";body=es?`Pasaron ${n} días desde el último torneo del club. ¿Organizan otra fecha?`:pt?`Já faz ${n} dias desde o último torneio do clube. Vamos marcar outro encontro?`:`It's been ${n} days since the club's last tournament. Another game night?`;break;
    default:return null;
  }
  if(aviso.pique && (aviso.tipo==="mvp"||aviso.tipo==="rivalidades")) body+=es?" La revancha se juega en la mesa.":pt?" A revanche acontece na mesa.":" The rematch happens at the table.";
  return {to:aviso.token,title:"Blindly",body,data:{liga:aviso.liga,temporada:aviso.temporada,seccion},channelId:"club",sound:null,ttl:3600};
}
