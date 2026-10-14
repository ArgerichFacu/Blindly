// QA opt-in: sólo identidad y liga descartables, sin correos ni grants comerciales.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
if (!process.argv.includes('--ejecutar')) throw Error('Usar --ejecutar para QA descartable.');
const env = readFileSync('.env', 'utf8');
const val = k => env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1].trim().replace(/^['"]|['"]$/g, '');
const sb = createClient(val('EXPO_PUBLIC_SUPABASE_URL'), val('EXPO_PUBLIC_SUPABASE_KEY'), { auth: { persistSession:false, autoRefreshToken:false } });
let id;
const rpc = async (n,p) => { const r=await sb.rpc(n,p);if(r.error)throw Error(`${n}: ${r.error.code}`);return r.data; };
try {
  const login = await sb.auth.signInAnonymously({options:{data:{full_name:'QA Nombre descartable',legacy:'preservar'}}});
  if(login.error||!login.data.user)throw Error('QA no pudo crear invitado');id=login.data.user.id;
  let result=await sb.auth.updateUser({data:{display_name:'QA Ñandú 🃏'}});assert.equal(result.error,null);assert.equal(result.data.user.id,id);
  assert.equal(result.data.user.user_metadata.full_name,'QA Nombre descartable');assert.equal(result.data.user.user_metadata.legacy,'preservar');
  assert.equal((await sb.auth.refreshSession()).data.user.user_metadata.display_name,'QA Ñandú 🃏');
  const invalid=await sb.auth.updateUser({data:{display_name:'Bad\nName'}});assert.ok(invalid.error);
  assert.equal((await sb.auth.getUser()).data.user.user_metadata.display_name,'QA Ñandú 🃏');
  await rpc('actualizar_mi_nombre_visible',{p_nombre:'QA Ñandú 🃏'});
  assert.ok((await sb.rpc('actualizar_mi_nombre_visible',{p_nombre:'Otro'})).error);
  const protectedResult=await sb.functions.invoke('crear-recuperacion',{method:'POST'});
  if(protectedResult.error||!protectedResult.data?.clave)throw Error('Protección QA falló');
  const parts=protectedResult.data.clave.split(':');
  const entered=await sb.auth.signInWithPassword({email:`${id}@recovery.blindly.invalid`,password:parts[2]});assert.equal(entered.data.user?.id,id);
  assert.equal(entered.data.user.user_metadata.display_name,'QA Ñandú 🃏');
  const league=await rpc('crear_liga',{p_nombre:'QA Nombre descartable',p_temporada:'QA Temporada',p_nombre_owner:'Alias distinto'});
  result=await sb.auth.updateUser({data:{display_name:'QA Facu'}});assert.equal(result.error,null);
  const detail=await rpc('detalle_liga',{p_liga:league.liga_id,p_temporada:league.temporada_id});
  assert.equal(detail.miembros.find(m=>m.user_id===id).nombre,'QA Facu');
  const owner=await sb.from('ligas').select('owner_id').eq('id',league.liga_id).single();assert.equal(owner.data?.owner_id,id);
  console.log('REAL: invitado, Unicode, persistencia, metadata/UUID, rechazo atómico, RPC propio, protección legacy y liga sincronizada OK.');
} finally {
  if(id){assert.equal((await sb.auth.getUser()).data.user?.id,id);const r=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});if(r.error)throw Error('QA requiere limpieza');console.log('REAL: identidad y liga descartables eliminadas por su propia función.');}
}
