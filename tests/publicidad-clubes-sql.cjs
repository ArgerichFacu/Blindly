const {PGlite}=require('@electric-sql/pglite'), assert=require('node:assert/strict'),fs=require('node:fs');
const db=new PGlite(),uid=n=>`a5000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const q=async(s,p=[]) => (await db.query(s,p)).rows;
const como=async n=>{await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[n?uid(n):'']);await db.exec('set role authenticated')};
const crear=async()=> (await q("select crear_liga('Club','2026','Owner') v"))[0].v;
(async()=>{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false,banned_until timestamptz,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}'::jsonb);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create publication supabase_realtime;");
  const migracion='20261106022529_publicidad_discreta_cupo_clubes.sql';
  for(const f of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')&&f<migracion).sort())await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
  for(let n=1;n<=7;n++)await q('insert into auth.users(id,is_anonymous,email,email_confirmed_at) values($1,$2,$3,now())',[uid(n),n===7,`user${n}@example.org`]);
  await como(1);const legacy=[await crear(),await crear()];
  const invitados=[...legacy];await como(6);for(let n=0;n<18;n++)invitados.push(await crear());
  await db.exec('reset role');const antes=await q('select * from ligas order by id');
  await db.exec(fs.readFileSync('supabase/migrations/'+migracion,'utf8'));
  for(const f of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')&&f>migracion).sort())await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
  assert.deepEqual(await q('select * from ligas order by id'),antes,'Legacy no se toca');
  await como(1);await assert.rejects(crear,/LIMITE_CLUBES_FREE/);assert.equal((await q('select mis_ligas() v'))[0].v.length,2);
  await como(7);await assert.rejects(crear,/CUENTA_REQUERIDA/);
  await como(2);const propio=await crear();await assert.rejects(crear,/LIMITE_CLUBES_FREE/);
  await q("select actualizar_liga($1,'Archivado',true)",[propio.liga_id]);await assert.rejects(crear,/LIMITE_CLUBES_FREE/);
  // Ser admin/member ajeno no consume cupo, incluso con varios clubes invitados.
  await db.exec('reset role');for(const [n,l] of invitados.entries())await q("insert into liga_miembros(liga_id,user_id,nombre,rol) values($1,$2,'Invitado',$3)",[l.liga_id,uid(3),n<2?'admin':'member']);
  await como(3);assert.equal((await q('select mis_ligas() v'))[0].v.length,20,'20 clubes ajenos no consumen cupo propio');
  await como(3);await crear();await assert.rejects(crear,/LIMITE_CLUBES_FREE/);
  // Trial y cada compra verificada son Plus: ilimitados, sin publicidad.
  await como(4);await q('select iniciar_prueba_founder()');await crear();await crear();
  assert.equal((await q('select estado_publicidad() v'))[0].v.elegible_free,false);
  for(const producto of ['monthly','annual','lifetime']){
    await db.exec('reset role');await q("insert into accesos_plus(user_id,activo,vence_en,entorno) values($1,true,null,'sandbox') on conflict(user_id) do update set activo=true,verificado_en=now(),vence_en=null",[uid(5)]);
    await como(5);await crear();await crear();assert.equal((await q('select estado_publicidad() v'))[0].v.elegible_free,false,producto);
  }
  await db.exec('reset role');await q('update accesos_plus set activo=false where user_id=$1',[uid(5)]);
  await como(5);await assert.rejects(crear,/LIMITE_CLUBES_FREE/);assert.equal((await q('select mis_ligas() v'))[0].v.length,6);
  await db.exec('reset role');await q("update private.plus_founder_trials set started_at=now()-interval '73 hours',expires_at=now()-interval '1 hour' where user_id=$1",[uid(4)]);
  await como(4);await assert.rejects(crear,/LIMITE_CLUBES_FREE/);
  await como(6);const config=(await q('select estado_publicidad() v'))[0].v;assert.deepEqual(config,{ads_enabled:false,ads_qa_enabled:false,ads_qa_scenario:null,elegible_free:true});
  await assert.rejects(()=>q('update private.publicidad_config set ads_enabled=true'),/permission denied/);
  await assert.rejects(()=>q('select * from private.publicidad_config'),/permission denied/);
  await db.exec('reset role');await q('insert into private.accesos_revision_play(user_id) values($1)',[uid(6)]);
  await como(6);await crear();await crear();assert.equal((await q('select estado_publicidad() v'))[0].v.elegible_free,false,'Reviewer sin publicidad y con clubes ilimitados');
  // El servidor distingue incorporación de reconexión, sin confiar en el cliente.
  const sala=(await q("select to_jsonb(crear_sala('[]'::jsonb)) v"))[0].v;
  let ingreso=(await q("select unirse_mesa($1,'Host') v",[sala.codigo]))[0].v;assert.equal(ingreso.ingresoNuevo,true);
  ingreso=(await q("select unirse_mesa($1,'Host') v",[sala.codigo]))[0].v;assert.equal(ingreso.ingresoNuevo,false);
  await como(7);ingreso=(await q("select unirse_mesa($1,'Guest') v",[sala.codigo]))[0].v;assert.equal(ingreso.ingresoNuevo,true);
  await db.exec('reset role');await q("update salas set estado='jugando' where id=$1",[sala.id]);
  await como(7);assert.equal((await q("select unirse_mesa($1,'Guest') v",[sala.codigo]))[0].v.ingresoNuevo,false);
  await como(3);await assert.rejects(()=>q("select unirse_mesa($1,'Nuevo')",[sala.codigo]),/PARTIDA_INICIADA/);
  await db.exec('reset role');
  for(const role of ['anon','authenticated'])assert.equal((await q("select has_function_privilege($1,'private.unirse_mesa_sin_publicidad(text,text)','EXECUTE') p",[role]))[0].p,false);
  await db.close();console.log('SQL comercial: Free 1/Plus ilimitados, invitados, archivados, legacy, expiración, RLS, flag OFF e incorporación/reconexión OK');
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1});
