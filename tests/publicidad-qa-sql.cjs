const {PGlite}=require('@electric-sql/pglite'),assert=require('node:assert/strict'),fs=require('node:fs');
const db=new PGlite(),id=n=>`a6000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const q=async(s,p=[]) => (await db.query(s,p)).rows;
const own=async n=>{await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role authenticated')};
const state=async()=> (await q('select estado_publicidad() v'))[0].v;
(async()=>{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false,banned_until timestamptz,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}'::jsonb);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create publication supabase_realtime;");
  for(const f of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
  for(let n=1;n<=4;n++)await q('insert into auth.users(id,is_anonymous,email,email_confirmed_at) values($1,$2,$3,now())',[id(n),n===4,`qa${n}@example.org`]);
  await own(1);assert.deepEqual(await state(),{ads_unit_android:null,ads_qa_enabled:false,ads_qa_scenario:null,elegible_free:true});
  await db.exec('reset role');await q('insert into private.ads_qa_testers(user_id,enabled) values($1,true),($2,true)',[id(1),id(4)]);
  await own(1);assert.equal((await state()).ads_qa_enabled,false,'Allowlist sola no habilita QA');
  await db.exec('reset role');await q('update private.publicidad_config set ads_qa_enabled=true');
  await own(1);assert.deepEqual(await state(),{ads_unit_android:null,ads_qa_enabled:true,ads_qa_scenario:'normal',elegible_free:true});
  for(const scenario of ['no_load','show_error','show_timeout','normal']) {
    await db.exec('reset role');await q('update private.ads_qa_testers set scenario=$1 where user_id=$2',[scenario,id(1)]);
    await own(1);assert.equal((await state()).ads_qa_scenario,scenario);
  }
  await own(2);assert.equal((await state()).ads_qa_enabled,false,'Otros Free no reciben test ads');
  await own(4);assert.equal((await state()).ads_qa_enabled,false,'Invitado no recibe permiso QA');
  await db.exec('reset role');await q("update auth.users set raw_user_meta_data='{\"ads_qa_enabled\":true,\"plus\":true}'::jsonb where id=$1",[id(2)]);
  await own(2);assert.equal((await state()).ads_qa_enabled,false,'Metadata editable no autoriza');
  await own(1);await q('select iniciar_prueba_founder()');assert.equal((await state()).ads_qa_enabled,false,'Trial gana a QA');
  await db.exec('reset role');await q("update private.plus_founder_trials set started_at=now()-interval '73 hours',expires_at=now()-interval '1 hour' where user_id=$1",[id(1)]);
  await own(1);assert.equal((await state()).ads_qa_enabled,true,'Trial expirado permite futura oportunidad natural');
  await db.exec('reset role');await q('insert into accesos_plus(user_id,activo) values($1,true)',[id(1)]);
  await own(1);assert.equal((await state()).ads_qa_enabled,false,'RevenueCat gana a QA');
  await db.exec('reset role');await q('update accesos_plus set activo=false where user_id=$1',[id(1)]);await q('insert into private.accesos_revision_play(user_id) values($1)',[id(1)]);
  await own(1);assert.equal((await state()).ads_qa_enabled,false,'Reviewer gana a QA');
  await db.exec('reset role');await q('update private.accesos_revision_play set activo=false where user_id=$1',[id(1)]);await q("update private.ads_qa_testers set expires_at=now()-interval '1 second' where user_id=$1",[id(1)]);
  await own(1);assert.equal((await state()).ads_qa_enabled,false,'Grant QA caduca');
  for(const table of ['publicidad_config','ads_qa_testers']){
    await assert.rejects(()=>q('select * from private.'+table),/permission denied/);
    await assert.rejects(()=>q('update private.'+table+' set '+(table==='publicidad_config'?'ads_enabled':'enabled')+'=true'),/permission denied/);
  }
  await db.exec('reset role');assert.equal((await q('select ads_enabled from private.publicidad_config'))[0].ads_enabled,false);
  // Switch del titular: publica la unidad autorizada, nunca el campo viejo 'ads_enabled' que leían las builds 1.36–1.38.
  const unidad=(await q('select ads_unit_android u from private.publicidad_config'))[0].u;assert.match(unidad,/^ca-app-pub-\d{16}\/\d{10}$/);
  await q('update private.publicidad_config set ads_enabled=true');
  await own(2);const encendido=await state();assert.equal(encendido.ads_unit_android,unidad,'Con el switch encendido se publica la unidad autorizada');assert.equal('ads_enabled' in encendido,false,'Las builds viejas no reciben el switch');
  await db.exec('reset role');await assert.rejects(()=>q("update private.publicidad_config set ads_unit_android='ca-app-pub-123/1'"),/check/i,'Unidad mal formada rechazada');
  await q('update private.publicidad_config set ads_unit_android=null');await own(2);assert.equal((await state()).ads_unit_android,null,'Sin unidad autorizada no hay anuncios reales');
  await db.exec('reset role');await q('update private.publicidad_config set ads_enabled=false, ads_unit_android=$1',[unidad]);await own(2);assert.equal((await state()).ads_unit_android,null,'Switch apagado: no se publica la unidad');
  await own(0);await assert.rejects(state,/SESION_REQUERIDA/);
  await db.close();console.log('QA Ads SQL: flag privado+allowlist+caducidad, Free/Plus/Trial/Reviewer, metadata y permisos OK; ads públicos OFF');
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1});
