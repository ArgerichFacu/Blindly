const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function cargar(file,require,otros={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require,...otros});return exports;}
const textos=cargar('supabase/functions/enviar-avisos/textos.ts',()=>{});
const aviso={id:'envio',token:'ExpoPushToken[abcdefghijklmnop]',idioma:'es',pique:false,tipo:'mvp',datos:{nombre:'Nico'},liga:'80000000-0000-4000-8000-000000000001',temporada:null};
for(const idioma of ['es','en','pt'])for(const tipo of ['mvp','fechas','temporadas','rivalidades','recordatorios']){
 const m=textos.mensajePush({...aviso,idioma,tipo,datos:{nombre:'Nico',dias:12,derrotas:2,compartidas:3}});assert.ok(m.body);assert.equal(m.to,aviso.token);assert.equal(m.sound,null);
}
assert.ok(!textos.mensajePush(aviso).body.includes('revancha'));assert.ok(textos.mensajePush({...aviso,pique:true}).body.includes('revancha'));
assert.equal(textos.mensajePush({...aviso,tipo:'rivalidades',datos:{compartidas:2,derrotas:1}}),null);
assert.equal(textos.mensajePush({...aviso,tipo:'recordatorios',datos:{dias:11}}),null);
assert.equal(textos.mensajePush({...aviso,tipo:'unknown'}),null);
let handler,confirmaciones=[],peticiones=[],modo='ok',calls=0,secretOk=true,vigente=true;
const client={rpc:async(nombre,p)=>{
 if(nombre==='reservar_avisos_push')return secretOk?{data:[aviso]}:{error:Error('auth')};
 if(nombre==='validar_entrega_push')return {data:vigente};
 if(nombre==='confirmar_aviso_push'){confirmaciones.push(p);return {};}
 if(nombre==='recibos_avisos_push')return {data:[]};throw Error(nombre);
}};
cargar('supabase/functions/enviar-avisos/index.ts',name=>name.startsWith('npm:')?{createClient:()=>client}:textos,{
 Deno:{env:{get:()=>''},serve:fn=>handler=fn},Response,AbortSignal,JSON,
 setTimeout:fn=>{fn();},fetch:async(url,params)=>{
  peticiones.push({url,body:JSON.parse(params.body)});calls++;
  if(modo==='red')throw Error('timeout');
  if(modo==='limite'&&calls<3)return new Response('',{status:429});
  return Response.json(modo==='malformado'?{}:{data:[{status:'ok',id:'ticket-1'}]});
 }
});
const req=(token='x'.repeat(72))=>new Request('http://localhost',{method:'POST',headers:{'x-blindly-dispatch':token},body:'{"token":"ataque"}'});
async function ejecutar(m='ok'){modo=m;confirmaciones=[];peticiones=[];calls=0;return handler(req());}
(async()=>{
 assert.equal((await handler(req('wrong'))).status,401);assert.equal(peticiones.length,0);
 secretOk=false;assert.equal((await ejecutar()).status,401);assert.equal(peticiones.length,0);secretOk=true;
 await ejecutar();assert.equal(peticiones[0].body[0].to,aviso.token,'Destinatario sólo desde servidor');assert.equal(confirmaciones[0].p_estado,'aceptada');
 await ejecutar('limite');assert.equal(calls,3,'Backoff acotado para HTTP 429');
 await ejecutar('red');assert.equal(calls,1);assert.equal(confirmaciones[0].p_estado,'incierta','No duplica envío con aceptación desconocida');
 await ejecutar('malformado');assert.equal(confirmaciones[0].p_estado,'incierta');
 vigente=false;await ejecutar();assert.equal(calls,0);assert.equal(confirmaciones[0].p_estado,'fallida','Revalida consentimiento antes del envío');
 console.log('Push worker: ES/EN/PT, datos reales, secreto, destinos servidor, revalidación, backoff y resultado incierto OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
