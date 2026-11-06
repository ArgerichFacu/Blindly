// QA explícito: identidad protegida descartable; dos requests reales concurrentes.
// No usa ni modifica identidades comerciales/reviewer ni deja datos persistentes.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
if(!process.argv.includes('--ejecutar'))throw Error('Requiere --ejecutar para QA descartable.');
const env=readFileSync('.env','utf8');
const val=k=>env.match(new RegExp(`^${k}=(.*)$`,'m'))?.[1].trim().replace(/^['"]|['"]$/g,'');
const sb=createClient(val('EXPO_PUBLIC_SUPABASE_URL'),val('EXPO_PUBLIC_SUPABASE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
let creado,resultado;
try{
  const login=await sb.auth.signInAnonymously({options:{data:{display_name:'QA v35 descartable'}}});
  assert.ok(!login.error&&login.data.user);creado=login.data.user.id;
  const protection=await sb.functions.invoke('crear-recuperacion',{method:'POST'});
  assert.ok(!protection.error&&typeof protection.data?.clave==='string');
  const parts=protection.data.clave.split(':');assert.equal(parts[1],creado);
  const protectedLogin=await sb.auth.signInWithPassword({email:`${creado}@recovery.blindly.invalid`,password:parts[2]});
  assert.ok(!protectedLogin.error);assert.equal(protectedLogin.data.user?.id,creado);
  const before=await sb.rpc('mis_ligas');assert.deepEqual(before.data,[]);
  const solicitudes=await Promise.all([1,2].map(n=>sb.rpc('crear_liga',{p_nombre:`QA v35 simultánea ${n}`,p_temporada:'QA temporal',p_nombre_owner:'QA'})));
  assert.equal(solicitudes.filter(r=>!r.error).length,1,'Sólo una creación puede ganar');
  assert.equal(solicitudes.filter(r=>r.error?.message.includes('LIMITE_CLUBES_FREE')).length,1);
  const after=await sb.rpc('mis_ligas');assert.equal(after.data?.length,1,'No quedan clubes fantasma');
  const retry=await sb.rpc('crear_liga',{p_nombre:'QA v35 reintento',p_temporada:'QA',p_nombre_owner:'QA'});
  assert.ok(retry.error?.message.includes('LIMITE_CLUBES_FREE'));
  resultado={captured_at:new Date().toISOString(),concurrent_requests:2,created:1,blocked:1,retry_blocked:true,ghost_clubs:false};
}finally{
  if(creado){
    assert.equal((await sb.auth.getUser()).data.user?.id,creado);
    const deleted=await sb.functions.invoke('eliminar-cuenta',{method:'POST'});
    if(deleted.error)throw Error('Limpieza QA v35 falló; revisar identidad descartable de esta ejecución.');
    if(resultado)resultado.cleaned=true;
  }
  await sb.auth.signOut({scope:'local'});
}
if(resultado){writeFileSync('G:/Blindly/privado/v35-concurrencia-clubes.json',JSON.stringify(resultado,null,2));console.log(JSON.stringify(resultado));}
