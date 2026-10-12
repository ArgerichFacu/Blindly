// QA opt-in de correo real. Conserva sesión y password sólo en memoria.
// El código llega al buzón controlado; stdin permite confirmar o limpiar.
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
if (!process.argv.includes('--ejecutar')) throw new Error('Usar --ejecutar para QA aislada.');
const email=process.argv.find(arg=>arg.startsWith('--email='))?.slice(8);
const esperado=process.argv.find(arg=>arg.startsWith('--usuario='))?.slice(10);
const otpInicial=process.env.BLINDLY_QA_OTP;
const legacy=process.argv.includes('--legacy');
const probarReset=process.argv.includes('--reset');
if(!esperado && !process.stdin.isTTY) throw new Error('La prueba interactiva requiere terminal TTY; no se crea identidad con stdin cerrado.');
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Falta --email de pruebas controlado.');
const env=readFileSync('.env','utf8');
const valor=key=>env.match(new RegExp(`^${key}=(.*)$`,'m'))?.[1].trim().replace(/^['"]|['"]$/g,'');
const url=valor('EXPO_PUBLIC_SUPABASE_URL'),key=valor('EXPO_PUBLIC_SUPABASE_KEY');
const storage=new Map();
const opciones={auth:{persistSession:true,autoRefreshToken:false,flowType:'pkce',storage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}}};
const sb=createClient(url,key,opciones);
let creado,terminado=false;
let lines;
let passwordAnterior,esperandoReset=false;
async function limpiar(){
  if(terminado)return;
  terminado=true;
  if(creado){
    assert.equal((await sb.auth.getUser()).data.user?.id,creado,'Sólo borrar la cuenta creada por este proceso');
    const r=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});
    if(r.error)throw new Error('QA no se pudo limpiar; revisar Auth antes de reiniciar.');
    await sb.auth.signOut({scope:'local'});
    storage.clear();
    console.log('REAL: identidad QA aislada eliminada.');
  }
  lines?.close();
}
try {
  if(!esperado){
  const anon=await sb.auth.signInAnonymously({options:{data:{display_name:'QA email descartable'}}});
  if(anon.error||!anon.data.user)throw new Error(`Crear QA: ${anon.error?.code??'sin usuario'}`);
  creado=anon.data.user.id;
  assert.equal(anon.data.user.is_anonymous,true);
  if(legacy){
    const protegida=await sb.functions.invoke('crear-recuperacion',{method:'POST'});
    if(protegida.error || typeof protegida.data?.clave !== 'string')throw new Error('QA legacy no se pudo crear');
    const partes=protegida.data.clave.split(':');
    assert.equal(partes[1],creado);
    const login=await sb.auth.signInWithPassword({email:`${creado}@recovery.blindly.invalid`,password:partes[2]});
    if(login.error)throw new Error('QA legacy no pudo recuperar sesión');
    assert.equal(login.data.user?.id,creado);
    console.log('REAL: clave legacy creó/protegió el mismo UUID QA.');
  }
  const update=await sb.auth.updateUser({email},{emailRedirectTo:'http://localhost:8090/auth-callback'});
  if(update.error)throw new Error(`Enviar correo: ${update.error.code??'sin código'}`);
  assert.equal(update.data.user?.id,creado);
  if(legacy){
    const factor=await sb.functions.invoke('confirmar-correo-interno',{body:{email}});
    if(factor.error || factor.data?.code!=='OK')throw new Error('QA legacy: factor interno rechazado');
    console.log('REAL: factor interno confirmado; nuevo email todavía requiere el código.');
  }
  console.log('REAL: Supabase aceptó el envío por SMTP; UUID del invitado conservado. Entrega pendiente de verificar.');
  console.log('Esperando stdin: codigo:XXXXXXXX o limpiar. No imprimir tokens ni password.');
  }
  lines=esperado?null:createInterface({input:process.stdin});
  const comandos=esperado?[`codigo:${otpInicial??''}`]:lines;
  for await (const line of comandos){
    if(line.trim()==='limpiar'){await limpiar();break}
    if(esperandoReset && line.startsWith('enlace:')){
      const link=new URL(line.trim().slice(7));
      assert.equal(link.origin,new URL(url).origin);assert.equal(link.pathname,'/auth/v1/verify');assert.equal(link.searchParams.get('type'),'recovery');
      const respuesta=await fetch(link,{redirect:'manual'});
      const callback=new URL(respuesta.headers.get('location'));
      assert.equal(callback.protocol,'blindly:');assert.equal(callback.host,'auth-callback');
      const code=callback.searchParams.get('code');assert.ok(code,'Callback PKCE sin código');
      const flowId=callback.searchParams.get('sb_flow_id');
      const recovery=await sb.auth.exchangeCodeForSession(code,flowId?{flowId}:undefined);
      if(recovery.error)throw new Error(`Reset PKCE: ${recovery.error.code??'sin código'}`);
      assert.equal(recovery.data.user?.id,creado);
      const nueva=randomBytes(24).toString('base64url');
      const actualizada=await sb.auth.updateUser({password:nueva});
      if(actualizada.error)throw new Error(`Reset password: ${actualizada.error.code??'sin código'}`);
      await sb.auth.signOut({scope:'local'});
      assert.equal((await sb.auth.signInWithPassword({email,password:passwordAnterior})).error?.code,'invalid_credentials');
      const login=await sb.auth.signInWithPassword({email,password:nueva});
      if(login.error)throw new Error('Login después de reset rechazado');
      assert.equal(login.data.user?.id,creado);
      console.log('REAL: reset por enlace PKCE y callback nativo, password anterior rechazada y nueva válida; mismo UUID.');
      await limpiar();break;
    }
    if(!/^codigo:\d{6,8}$/.test(line.trim())){console.log('Comando inválido.');continue}
    const verify=await sb.auth.verifyOtp({email,token:line.trim().slice(7),type:'email_change'});
    if(verify.error){console.log(`Código rechazado: ${verify.error.code??'sin código'}`);continue}
    assert.equal(verify.data.user?.id,esperado??creado);
    assert.equal(verify.data.user.user_metadata?.display_name,'QA email descartable','Nunca operar una identidad real');
    creado=verify.data.user.id;
    assert.equal(verify.data.user.email,email);
    assert.ok(verify.data.user.email_confirmed_at);
    const password=randomBytes(24).toString('base64url');
    const saved=await sb.auth.updateUser({password});
    if(saved.error)throw new Error(`Password QA: ${saved.error.code??'sin código'}`);
    assert.equal(saved.data.user?.id,creado);assert.equal(saved.data.user.is_anonymous,false);
    const reinicio=createClient(url,key,opciones);
    assert.equal((await reinicio.auth.getUser()).data.user?.id,creado,'Sesión conservada al reinstanciar SDK con mismo storage');
    await sb.auth.signOut({scope:'local'});
    const login=await sb.auth.signInWithPassword({email,password});
    if(login.error)throw new Error(`Login QA: ${login.error.code??'sin código'}`);
    assert.equal(login.data.user?.id,creado);
    const wrong=await sb.auth.signInWithPassword({email,password:'incorrecta-de-prueba'});
    assert.equal(wrong.error?.code,'invalid_credentials');
    assert.equal((await sb.auth.getUser()).data.user?.id,creado);
    console.log('REAL: email verificado → password → sesión persistida → logout/login → password errónea; UUID original conservado.');
    if(probarReset){
      passwordAnterior=password;
      const solicitud=await sb.auth.resetPasswordForEmail(email,{redirectTo:'blindly://auth-callback'});
      if(solicitud.error)throw new Error(`Solicitar reset: ${solicitud.error.code??'sin código'}`);
      esperandoReset=true;console.log('REAL: reset solicitado. Esperando stdin enlace:URL-del-correo (sin imprimir credenciales).');continue;
    }
    await limpiar();break;
  }
} catch(e){
  console.error(e instanceof Error?e.message:'QA falló');
  process.exitCode=1;
} finally {await limpiar()}
