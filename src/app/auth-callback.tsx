import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pantalla, Tarjeta, Texto, Boton } from "../components/Controles";
import { procesarRetornoAuth, retornoAuth } from "../lib/autenticacion";
import { usePreferencias } from "../lib/Preferencias";
export default function RetornoAuth() {
  const { code, error_code, sb_flow_id } = useLocalSearchParams<{ code?: string; error_code?: string; sb_flow_id?: string }>();
  const router = useRouter(), { t, mensajeError } = usePreferencias(), [error,setError]=useState<unknown>(null);
  useEffect(()=>{
    let activo=true;
    const u=new URL(retornoAuth());
    if(code)u.searchParams.set("code",code);
    if(error_code)u.searchParams.set("error_code",error_code);
    if(sb_flow_id)u.searchParams.set("sb_flow_id",sb_flow_id);
    void procesarRetornoAuth(u.toString()).then(r=>{if(activo)router.replace({pathname:"/cuenta",params:{...r.contexto,...(r.reset?{accion:"password"}:{})}});}).catch(e=>{if(activo)setError(e);});
    return()=>{activo=false};
  },[code,error_code,sb_flow_id,router]);
  return <Pantalla titulo={t("Mi cuenta")}><Tarjeta>{error?<><Texto accessibilityLiveRegion="assertive">{mensajeError(error)}</Texto><Boton titulo={t("Volver a mi cuenta")} onPress={()=>router.replace("/cuenta")}/></>:<Texto accessibilityLiveRegion="polite">{t("Comprobando tu acceso…")}</Texto>}</Tarjeta></Pantalla>;
}
