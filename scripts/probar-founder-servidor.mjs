// QA opt-in: crea únicamente un invitado descartable y lo elimina al finalizar.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
if(!process.argv.includes('--ejecutar'))throw Error('Usar --ejecutar para QA descartable.');
const env=readFileSync('.env','utf8');
const val=k=>env.match(new RegExp(`^${k}=(.*)$`,'m'))?.[1].trim().replace(/^['"]|['"]$/g,'');
const sb=createClient(val('EXPO_PUBLIC_SUPABASE_URL'),val('EXPO_PUBLIC_SUPABASE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
let creado;
const rpc=async(name,args)=>{const r=await sb.rpc(name,args);if(r.error)throw Error(`${name}: ${r.error.code}`);return r.data};
try{
 const login=await sb.auth.signInAnonymously({options:{data:{display_name:'QA Founder descartable'}}});
 if(login.error||!login.data.user)throw Error('No se pudo crear QA');creado=login.data.user.id;
 let s=await rpc('estado_founder_trial');assert.equal(s.used,false);assert.equal(s.eligible,true);assert.equal(s.real_payments_enabled,false);
 await rpc('registrar_vista_plus');assert.equal((await rpc('estado_founder_trial')).used,false);
 const results=await Promise.all([rpc('iniciar_prueba_founder'),rpc('iniciar_prueba_founder'),rpc('iniciar_prueba_founder')]);
 s=results[0];assert.equal(s.access_source,'FOUNDER_TRIAL');assert.equal(s.active,true);
 assert.equal(Date.parse(s.expires_at)-Date.parse(s.started_at),72*3600000);
 for(const item of results)assert.equal(item.started_at,s.started_at);
 const refresh=await sb.auth.refreshSession();assert.equal(refresh.data.user?.id,creado);assert.equal((await rpc('estado_founder_trial')).started_at,s.started_at);
 s=await rpc('registrar_interes_plus',{p_plan:'annual'});assert.equal(s.interest_plan,'annual');
 s=await rpc('registrar_waitlist_plus');assert.equal(s.waitlist,true);assert.equal(s.contactable,false);
 assert.equal((await rpc('registrar_waitlist_plus')).waitlist,true);
 const denied=await sb.schema('private').from('plus_founder_trials').select('*');assert.ok(denied.error,'No acceso directo a tablas privadas');
 const invalid=await sb.rpc('registrar_interes_plus',{p_plan:'invalid'});assert.ok(invalid.error);
 const anonymous=createClient(val('EXPO_PUBLIC_SUPABASE_URL'),val('EXPO_PUBLIC_SUPABASE_KEY'),{auth:{persistSession:false}});
 assert.ok((await anonymous.rpc('iniciar_prueba_founder')).error,'Clave pública sin sesión no activa trials');
 assert.equal((await rpc('estado_lanzamiento_plus')).real_payments_enabled,false);
 console.log('REAL: 72h exactas, activación concurrente única, refresh UUID, plan, waitlist invitado y permisos aprobados.');
}finally{
 if(creado){assert.equal((await sb.auth.getUser()).data.user?.id,creado);const deleted=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});if(deleted.error)throw Error('QA Founder requiere limpieza: eliminar-cuenta falló');console.log('REAL: identidad descartable eliminada; filas Founder borradas por cascada.');}
}
