import { View } from "react-native";
import { Etiqueta,Tarjeta,Texto } from "./Controles";
import { useTema } from "../lib/TemaContext";
import { usePreferencias } from "../lib/Preferencias";
import { clasificacion } from "../lib/clasificacion";
import type { FilaRanking,TemporadaLiga } from "../lib/ligas";
import { TitulosJugador } from "./TitulosJugador";
import { velo } from "../lib/visual";
export function ClasificacionTemporada({ranking,temporada,movimientos}:{ranking:FilaRanking[];temporada:TemporadaLiga|null;movimientos?:Record<string,number>}) {
 const {t,preferencias}=usePreferencias(),{tema}=useTema();
 const datos=clasificacion(ranking,temporada?.estado);
 const numero=(n:number)=>Number(n).toLocaleString(preferencias.idioma,{maximumFractionDigits:3});
 const fecha=(s:string)=>new Date(`${s}T12:00:00`).toLocaleDateString(preferencias.idioma);
 const destacado=datos.mvp??datos.campeon;
 return <>
  {temporada && <Texto suave>{t(temporada.estado==="activa"?"Temporada en curso":"Temporada finalizada")} · {fecha(temporada.inicio)}{temporada.fin?` — ${fecha(temporada.fin)}`:""}</Texto>}
  {destacado && <Tarjeta variante="hero" style={{borderColor:tema.acento,gap:10}}>
   <Etiqueta>{t(datos.mvp?"MVP ACTUAL":"CAMPEÓN DE TEMPORADA")}</Etiqueta>
   <View style={{flexDirection:"row",alignItems:"center",gap:14}}>
    <View style={{width:54,height:54,borderRadius:27,borderWidth:1,borderColor:velo(tema.acento,"70"),backgroundColor:velo(tema.acento,"12"),alignItems:"center",justifyContent:"center"}}><Texto style={{fontSize:25,fontWeight:"800",color:tema.acento}}>{destacado.nombre.trim().slice(0,1).toUpperCase()}</Texto></View>
    <Texto style={{flex:1,fontSize:28,fontWeight:"800",color:tema.acento}}>{destacado.nombre}</Texto>
   </View>
   <Texto>{t("{n} puntos",{n:numero(destacado.puntos)})} · {t("{n} victorias",{n:destacado.victorias})}</Texto>
   <Texto suave>{t(datos.mvp?"El puesto 1 del ranking es el MVP. Cambia con los resultados.":"Esta temporada conserva sus partidas y su clasificación final.")}</Texto>
  </Tarjeta>}
  {datos.top.length>0 && <View style={{gap:8}}>{datos.top.map(f=> {
   const movimiento=movimientos?.[f.user_id];
   return <Tarjeta key={f.user_id} variante="suave" style={{padding:16,gap:8}}>
    <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
     <View style={{width:34,height:34,borderRadius:17,alignItems:"center",justifyContent:"center",backgroundColor:velo(tema.acento,Number(f.posicion)===1?"22":"0B"),borderWidth:1,borderColor:velo(tema.acento,Number(f.posicion)===1?"65":"25")}}><Texto style={{fontSize:16,fontWeight:"800",color:Number(f.posicion)===1?tema.acento:tema.textoFuerte}}>{f.posicion}</Texto></View>
     <Texto style={{flex:1,fontSize:20,fontWeight:"800"}}>{f.nombre}</Texto>
     <Texto style={{fontSize:22,fontWeight:"800",color:tema.acento}}>{numero(f.puntos)}</Texto>
    </View>
    <Texto suave>{t("{n} partidas",{n:f.partidas})} · {t("{n} victorias",{n:f.victorias})}</Texto>
    <TitulosJugador fila={f} esMvp={datos.mvp?.user_id===f.user_id} />
    {Number.isFinite(movimiento) && <Texto suave>{t(movimiento!>0?"Subió {n} posiciones":movimiento!<0?"Bajó {n} posiciones":"Mantiene su posición",{n:Math.abs(movimiento!)})}</Texto>}
   </Tarjeta>;
  })}</View>}
  {datos.mvp && datos.carrera.length>1 && <Tarjeta>
   <Etiqueta>{t("RACE FOR MVP")}</Etiqueta>
   {datos.carrera.map(({fila,proporcion,diferencia})=><View key={fila.user_id} style={{gap:5}}>
    <Texto style={{fontWeight:"700"}}>{fila.nombre} · {t("{n} puntos",{n:numero(fila.puntos)})}</Texto>
    <View accessibilityRole="progressbar" accessibilityLabel={fila.nombre} accessibilityValue={{min:0,max:100,now:Math.round(proporcion*100),text:t("{n} puntos",{n:numero(fila.puntos)})}} style={{height:8,backgroundColor:tema.borde,borderRadius:4,overflow:"hidden"}}><View style={{height:8,width:`${proporcion*100}%`,backgroundColor:tema.acento}} /></View>
    {Number(fila.posicion)!==1 && <Texto suave>{t("A {n} puntos del líder",{n:numero(diferencia)})}</Texto>}
   </View>)}
   <Texto suave>{t("Una partida puede cambiar el líder.")}</Texto>
  </Tarjeta>}
 </>;
}
