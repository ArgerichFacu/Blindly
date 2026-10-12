// Crea únicamente la nueva identidad de revisión aprobada. No concede Plus.
// Credenciales fuera de Git; Supabase Auth sigue siendo la autoridad.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const archivo='G:/Blindly/privado/google-play-reviewer-email.json';
if(!process.argv.includes('--ejecutar') || !process.stdin.isTTY)throw new Error('Requiere --ejecutar y terminal interactiva.');
if(existsSync(archivo))throw new Error('La credencial ya existe. No crear otra identidad ni sobrescribirla.');
const email='administracionblindly+playreview@gmail.com';
const env=readFileSync('.env','utf8');
const valor=key=>env.match(new RegExp(`^${key}=(.*)$`,'m'))?.[1].trim().replace(/^['"]|['"]$/g,'');
const sb=createClient(valor('EXPO_PUBLIC_SUPABASE_URL'),valor('EXPO_PUBLIC_SUPABASE_KEY'),{auth:{persistSession:false,autoRefreshToken:false,flowType:'pkce'}});
let creado,completado=false;
let lines;
try {
  const anon=await sb.auth.signInAnonymously({options:{data:{display_name:'Google Play Reviewer'}}});
  if(anon.error || !anon.data.user)throw new Error(`Crear reviewer: ${anon.error?.code??'sin usuario'}`);
  creado=anon.data.user.id;
  assert.equal(anon.data.user.is_anonymous,true);
  const update=await sb.auth.updateUser({email},{emailRedirectTo:'blindly://auth-callback'});
  if(update.error)throw new Error(`Vincular email reviewer: ${update.error.code??'sin código'}`);
  assert.equal(update.data.user?.id,creado);
  console.log('Correo enviado a la dirección de revisión aprobada; esperando codigo:XXXXXXXX.');
  lines=createInterface({input:process.stdin});
  for await(const line of lines){
    if(line.trim()==='cancelar')break;
    if(!/^codigo:\d{8}$/.test(line.trim()))continue;
    const verified=await sb.auth.verifyOtp({email,token:line.trim().slice(7),type:'email_change'});
    if(verified.error){console.log(`Verificación rechazada: ${verified.error.code??'sin código'}`);continue}
    assert.equal(verified.data.user?.id,creado);assert.equal(verified.data.user.email,email);assert.ok(verified.data.user.email_confirmed_at);
    const password=randomBytes(24).toString('base64url');
    const saved=await sb.auth.updateUser({password});
    if(saved.error)throw new Error(`Password reviewer: ${saved.error.code??'sin código'}`);
    assert.equal(saved.data.user?.id,creado);assert.equal(saved.data.user.is_anonymous,false);
    await sb.auth.signOut({scope:'local'});
    const login=await sb.auth.signInWithPassword({email,password});
    if(login.error)throw new Error(`Login reviewer: ${login.error.code??'sin código'}`);
    assert.equal(login.data.user?.id,creado);
    mkdirSync('G:/Blindly/privado',{recursive:true});
    writeFileSync(archivo,JSON.stringify({nombre:'Google Play Reviewer',email,password,userId:creado,creadoEn:new Date().toISOString(),plusVerificado:false},null,2)+'\n',{encoding:'utf8',flag:'wx'});
    completado=true;
    console.log(`REVIEWER_UUID=${creado}`);
    console.log('Email verificado y login permanente comprobado. Credencial guardada fuera de Git; Plus pendiente de grant.');
    break;
  }
} finally {
  if(creado && !completado){
    assert.equal((await sb.auth.getUser()).data.user?.id,creado,'Limpiar únicamente la identidad nueva');
    const borrado=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});
    if(borrado.error)throw new Error('No se pudo limpiar el intento nuevo de review.');
    console.log('Intento de review cancelado y limpiado.');
  }
  await sb.auth.signOut({scope:'local'});lines?.close();
}
