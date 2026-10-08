import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import { mensajePush, type AvisoPush } from "./textos.ts";

// Autenticación propia para el cron: secreto privado generado dentro de Postgres.
// Nunca acepta tokens, destinatarios ni mensajes del body de una petición.
Deno.serve(async (request: Request) => {
  if(request.method!=="POST")return new Response(null,{status:405});
  const secreto=request.headers.get("x-blindly-dispatch");
  if(!secreto||secreto.length!==72)return new Response(null,{status:401});
  const admin=createClient(Deno.env.get("SUPABASE_URL")??"",Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"",{auth:{persistSession:false}});
  const {data:lote,error}=await admin.rpc("reservar_avisos_push",{p_secreto:secreto});
  if(error)return new Response(null,{status:401});
  const confirmar=async(id:string,estado:string,ticket:string|null=null,codigo:string|null=null)=>{
    const {error:e}=await admin.rpc("confirmar_aviso_push",{p_secreto:secreto,p_id:id,p_estado:estado,p_ticket:ticket,p_error:codigo});
    if(e)throw new Error("No se pudo registrar el resultado del envío");
  };
  const avisos=(lote??[]) as AvisoPush[], listos=[];
  for(const aviso of avisos){
    const {data:vigente,error:e}=await admin.rpc("validar_entrega_push",{p_secreto:secreto,p_id:aviso.id});
    listos.push({aviso,mensaje:!e&&vigente ? mensajePush(aviso) : null});
  }
  let aceptados=0;
  for(const a of listos.filter(a=>!a.mensaje))await confirmar(a.aviso.id,"fallida");
  const enviar=listos.filter(a=>a.mensaje);
  if(enviar.length){
    try{
      let respuesta:Response|undefined;
      for(let intento=0;intento<3;intento++){
        respuesta=await fetch("https://exp.host/--/api/v2/push/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(enviar.map(a=>a.mensaje)),signal:AbortSignal.timeout(15000)});
        if(respuesta.status!==429)break;
        await new Promise(r=>setTimeout(r,1000*(intento+1)));
      }
      if(!respuesta?.ok){for(const a of enviar)await confirmar(a.aviso.id,"fallida");}
      else{
        const resultado=await respuesta.json();
        if(!Array.isArray(resultado.data)||resultado.data.length!==enviar.length)throw new Error("Respuesta de proveedor incompleta");
        for(let i=0;i<enviar.length;i++){
          const ticket=resultado.data[i];
          if(ticket.status==="ok"&&typeof ticket.id==="string"){await confirmar(enviar[i].aviso.id,"aceptada",ticket.id);aceptados++;}
          else await confirmar(enviar[i].aviso.id,"fallida",null,ticket.details?.error??null);
        }
      }
    }catch{
      // Resultado de red desconocido: no repetir automáticamente y duplicar el aviso.
      for(const a of enviar)await confirmar(a.aviso.id,"incierta");
    }
  }
  const {data:recibos,error:errorRecibos}=await admin.rpc("recibos_avisos_push",{p_secreto:secreto});
  if(!errorRecibos&&recibos?.length){
    try{
      const r=await fetch("https://exp.host/--/api/v2/push/getReceipts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:recibos.map((r:{ticket:string})=>r.ticket)}),signal:AbortSignal.timeout(15000)});
      if(r.ok){const cuerpo=await r.json();for(const x of recibos){const recibo=cuerpo.data?.[x.ticket];if(recibo)await confirmar(x.id,recibo.status==="ok"?"confirmada":"fallida",null,recibo.details?.error??null);}}
    }catch{/* El cron consultará los recibos pendientes de nuevo; no reenvía mensajes. */}
  }
  return Response.json({reservados:avisos.length,aceptados});
});
