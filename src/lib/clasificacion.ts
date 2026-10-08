import type { FilaRanking } from "./ligas";
// No ordena ni inventa puntajes: la RPC es la autoridad de posiciones/desempate.
export function clasificacion(ranking:FilaRanking[],estado:"activa"|"finalizada"|undefined) {
  const primeros=ranking.filter(f=>Number(f.posicion)===1);
  const lider=primeros.length===1 && Number.isFinite(Number(primeros[0].puntos)) && Number(primeros[0].puntos)>=0 ? primeros[0] : null;
  const orden=ranking.filter(f=>Number.isInteger(Number(f.posicion)) && Number(f.posicion)>0 && Number.isFinite(Number(f.puntos)) && Number(f.puntos)>=0).slice().sort((a,b)=>Number(a.posicion)-Number(b.posicion));
  const carrera=lider ? orden.slice(0,3).map(f=>({fila:f,diferencia:Math.max(0,Number(lider.puntos)-Number(f.puntos)),proporcion:Number(lider.puntos)>0 ? Math.min(1,Math.max(0,Number(f.puntos)/Number(lider.puntos))) : 0})) : [];
  return {mvp:estado==="activa" ? lider : null,campeon:estado==="finalizada" ? lider : null,top:orden.filter(f=>Number(f.posicion)<=3),carrera};
}
