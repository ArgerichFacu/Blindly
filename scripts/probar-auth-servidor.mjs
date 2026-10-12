// Prueba opt-in: crea un invitado descartable y elimina sólo ese UUID al terminar.
// No usa service_role, cuentas existentes ni credenciales de Gmail/Google.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
if (!process.argv.includes('--ejecutar')) throw new Error('Usar --ejecutar para crear y limpiar la identidad QA aislada.');
const env = readFileSync('.env','utf8');
const valor = key => env.match(new RegExp(`^${key}=(.*)$`,'m'))?.[1].trim().replace(/^['"]|['"]$/g,'');
const url=valor('EXPO_PUBLIC_SUPABASE_URL'), key=valor('EXPO_PUBLIC_SUPABASE_KEY');
if (!url || !key) throw new Error('Falta configuración pública Supabase.');
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,flowType:'pkce'}});
let creado;
try {
  const r=await sb.auth.signInAnonymously();
  if(r.error || !r.data.user) throw new Error(`No se creó QA: ${r.error?.code??'sin usuario'}`);
  creado=r.data.user.id;
  assert.equal(r.data.user.is_anonymous,true);
  const datos=await sb.rpc('mi_identidad_tiene_datos');
  assert.equal(datos.error,null);assert.equal(datos.data,false);
  console.log('REAL: invitado aislado creado; RPC propia sin datos.');
  const factor=await sb.functions.invoke('confirmar-correo-interno',{body:{email:'administracionblindly+playreview@gmail.com'}});
  assert.ok(factor.error,'Un invitado no puede confirmar factor legacy');
  const rechazado=await factor.error.context.json();
  assert.equal(rechazado.code,'SESION_REQUERIDA');
  assert.equal((await sb.auth.getUser()).data.user?.id,creado);
  console.log('REAL: función rechaza invitado y conserva su UUID; no emite credenciales.');
  const settings=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key}}).then(r=>r.json());
  console.log(`REAL: email=${settings.external?.email}; Google=${settings.external?.google}; autoconfirm=${settings.mailer_autoconfirm}.`);
  if(settings.external?.google===false){
    const google=await sb.auth.linkIdentity({provider:'google',options:{redirectTo:'blindly://auth-callback',skipBrowserRedirect:true}});
    if(google.error) console.log(`REAL: Google no habilitado, error ${google.error.code??'sin código'}.`);
    else console.log('REAL: OAuth URL emitida; inicio Google pendiente de configuración externa.');
    assert.equal((await sb.auth.getUser()).data.user?.id,creado);
  }
} finally {
  if(creado){
    assert.equal((await sb.auth.getUser()).data.user?.id,creado,'Limpiar sólo la identidad creada por esta ejecución');
    const eliminado=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});
    if(eliminado.error) throw new Error('No se pudo limpiar la identidad QA aislada; revisar registro Auth.');
    await sb.auth.signOut({scope:'local'});
    console.log('REAL: identidad QA aislada eliminada, sin tocar cuentas existentes.');
  }
}
