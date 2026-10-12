// QA opt-in: OAuth oficial, sesiones sólo en memoria y limpieza de UUID propios.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
if (!process.argv.includes('--ejecutar')) throw new Error('Requiere --ejecutar.');
const env = readFileSync('.env', 'utf8');
const valor = key => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1].trim().replace(/^['"]|['"]$/g, '');
const url = valor('EXPO_PUBLIC_SUPABASE_URL'), key = valor('EXPO_PUBLIC_SUPABASE_KEY');
function cliente() {
  const storage = new Map();
  return createClient(url, key, {auth:{persistSession:true, autoRefreshToken:false, flowType:'pkce', detectSessionInUrl:false,
    storage:{getItem:k=>storage.get(k)??null, setItem:(k,v)=>storage.set(k,v), removeItem:k=>storage.delete(k)}}});
}
const propios = new Map();
let activo, fase = 'link', original, googleId, ocupado, procesando = false, finalizado = false;
const resultados = [];
function pagina(res, mensaje, siguiente) {
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store', 'Referrer-Policy':'no-referrer'});
  res.end(`<!doctype html><html lang="es"><title>Blindly · QA Google</title><body><h1>Blindly · QA Google</h1><p>${mensaje}</p>${siguiente?`<a href="/${siguiente}">Continuar prueba ${siguiente}</a>`:''}<ul>${resultados.map(r=>`<li>${r}</li>`).join('')}</ul><p>Prueba técnica aislada. No modifica cuentas existentes.</p></body></html>`);
}
async function invitado() {
  const sb = cliente();
  const r = await sb.auth.signInAnonymously({options:{data:{display_name:'QA Google descartable'}}});
  if (r.error || !r.data.user) throw new Error(`Crear QA: ${r.error?.code??'sin usuario'}`);
  assert.equal((await sb.rpc('mi_identidad_tiene_datos')).data, false);
  propios.set(r.data.user.id, sb);
  return {sb,id:r.data.user.id};
}
async function limpiar() {
  if (finalizado) return;
  finalizado = true;
  for (const [id,sb] of propios) {
    assert.equal((await sb.auth.getUser()).data.user?.id,id,'Sólo eliminar UUID creado por esta ejecución');
    const r=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});
    if(r.error) throw new Error('Limpieza QA rechazada; revisar identidad descartable antes de repetir.');
    await sb.auth.signOut({scope:'local'});
  }
  console.log('REAL: identidades Google QA propias eliminadas.');
}
const server = createServer(async(req,res)=>{
  // Puerto sólo de loopback. Evita que páginas ajenas disparen operaciones por fetch.
  if(req.headers.host!=='localhost:8090' && req.headers.host!=='127.0.0.1:8090'){res.writeHead(403);res.end();return;}
  if(req.headers['sec-fetch-site']==='cross-site' && req.url!=='/auth-callback' && !req.url.startsWith('/auth-callback?')){res.writeHead(403);res.end();return;}
  const ruta=new URL(req.url,'http://localhost:8090');
  try {
    if(ruta.pathname==='/'){pagina(res,'Vincular una cuenta Google de pruebas al invitado QA.','link');return;}
    if(['link','login','occupied'].includes(ruta.pathname.slice(1))){
      if(procesando){res.writeHead(409);res.end('Operación en curso');return;}
      const next=ruta.pathname.slice(1);
      assert.equal(next,fase,'Orden de prueba incorrecto');
      procesando=true;
      if(fase==='link'){const nuevo=await invitado();activo=nuevo.sb;original=nuevo.id;}
      else {
        const nuevo=await invitado();ocupado=nuevo.id;
        if(fase==='login'){
          // Mantener un cliente con la sesión original C para limpiar C después del login a A.
          activo=cliente();await activo.auth.setSession((await nuevo.sb.auth.getSession()).data.session);
        } else activo=nuevo.sb;
      }
      const options={redirectTo:'http://localhost:8090/auth-callback',skipBrowserRedirect:true,queryParams:{prompt:'select_account'}};
      const oauth=fase==='login'?await activo.auth.signInWithOAuth({provider:'google',options}):await activo.auth.linkIdentity({provider:'google',options});
      if(oauth.error || !oauth.data.url) throw new Error(`OAuth: ${oauth.error?.code??'sin URL'}`);
      res.writeHead(302,{'Location':oauth.data.url,'Cache-Control':'no-store'});res.end();return;
    }
    if(ruta.pathname==='/auth-callback'){
      assert.ok(procesando,'Callback sin solicitud');
      const error=ruta.searchParams.get('error_code')??ruta.searchParams.get('error');
      if(fase==='occupied'){
        assert.ok(['identity_already_exists','identity_already_linked'].includes(error),'Google ocupado debe rechazar el vínculo');
        assert.equal((await activo.auth.getUser()).data.user?.id,ocupado);
        resultados.push('Google ocupado rechazado; invitado conservado.');
        console.log('REAL: Google ocupado rechazado; UUID del invitado conservado.');
        pagina(res,'Pruebas OAuth completadas. Identidades QA limpiadas.');
        await limpiar();server.close();return;
      }
      if(error) throw new Error(`Callback OAuth: ${error}`);
      const code=ruta.searchParams.get('code');assert.ok(code,'Callback sin código');
      const flowId=ruta.searchParams.get('sb_flow_id');
      const canje=await activo.auth.exchangeCodeForSession(code,flowId?{flowId}:undefined);
      if(canje.error) throw new Error(`Canje OAuth: ${canje.error.code??'sin código'}`);
      assert.equal(canje.data.user?.id,original,'Conservar UUID A');
      const google=canje.data.user.identities?.find(i=>i.provider==='google');assert.ok(google);
      assert.equal(canje.data.user.is_anonymous,false);
      if(fase==='link'){
        googleId=google.id;resultados.push('Invitado → Google: mismo UUID A y cuenta permanente.');
        console.log('REAL: invitado vinculado a Google conserva UUID A.');fase='login';
      } else {
        assert.equal(google.id,googleId);resultados.push('Login Google existente: vuelve a A, sin fusionar C.');
        console.log('REAL: Google existente restaura A; no fusiona invitado C.');fase='occupied';
      }
      procesando=false;pagina(res,'Paso aprobado. Seleccioná la misma cuenta Google en el próximo paso.',fase);return;
    }
    res.writeHead(404);res.end();
  } catch(e) {
    console.error(e instanceof Error?e.message:'QA OAuth falló');
    pagina(res,'La prueba falló. Se limpiarán solamente sus identidades descartables.');
    process.exitCode=1;
    try{await limpiar();}catch{console.error('Limpieza incompleta; revisar QA antes de repetir.');}
    server.close();
  }
});
server.listen(8090,'127.0.0.1',()=>console.log('QA preparada en http://localhost:8090 (no se creó identidad todavía).'));
server.on('error',e=>{console.error(`Servidor QA: ${e.code??'error'}`);process.exitCode=1;});
const timeout=setTimeout(async()=>{try{await limpiar();}finally{server.close();}},15*60*1000);
server.on('close',()=>clearTimeout(timeout));
process.on('SIGINT',async()=>{try{await limpiar();}finally{server.close();}});
