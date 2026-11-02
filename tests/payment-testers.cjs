const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');
const {helper}=require('./founder-fixture.cjs');
const uid=n=>`91000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const db=new PGlite();
const q=async(sql,p=[]) => (await db.query(sql,p)).rows;
const own=async n=>{await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[n?uid(n):'']);await db.exec('set role authenticated')};
(async()=>{
 await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false,banned_until timestamptz,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}'::jsonb);create table auth.identities(user_id uuid references auth.users(id),provider text);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create publication supabase_realtime;");
 for(const f of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
 for(let i=1;i<=4;i++)await q("insert into auth.users(id,is_anonymous,email,email_confirmed_at)values($1,$2,$3,now())",[uid(i),i===3,`qa${i}@example.org`]);
 await q("insert into auth.identities(user_id,provider)values($1,'google')",[uid(1)]);
 const allowed=async()=> (await q('select mi_permiso_pago_tester() allowed'))[0].allowed;
 await own(1);assert.equal(await allowed(),false);
 await assert.rejects(()=>q('select * from private.plus_payment_testers'),/permission denied/);
 await assert.rejects(()=>q('insert into private.plus_payment_testers(user_id)values($1)',[uid(1)]),/permission denied/);
 await assert.rejects(()=>q('select mi_permiso_pago_tester($1)',[uid(2)]),/does not exist/);
 await db.exec('reset role');await q('insert into private.plus_payment_testers(user_id)values($1),($2),($3)',[uid(1),uid(3),uid(4)]);
 await own(1);assert.equal(await allowed(),true);
 assert.equal((await q('select estado_founder_trial() s'))[0].s.access_source,'FREE','Autorizar flujo NO concede Plus');
 await db.exec('reset role');assert.equal((await q('select count(*)::int n from accesos_plus'))[0].n,0);
 await own(2);assert.equal(await allowed(),false,'Otra identidad no hereda permiso');
 await own(3);assert.equal(await allowed(),false,'Anónimo no puede comprar aunque tenga una fila');
 await db.exec('reset role');await q('insert into private.accesos_revision_play(user_id)values($1)',[uid(4)]);await own(4);assert.equal(await allowed(),false,'Reviewer nunca sirve como tester comercial');
 await db.exec('reset role');await q('update private.plus_payment_testers set enabled=false where user_id=$1',[uid(1)]);await own(1);assert.equal(await allowed(),false);
 await db.exec('reset role');await q('update private.plus_payment_testers set enabled=true where user_id=$1',[uid(1)]);await q("update auth.users set banned_until=now()+interval '1 day' where id=$1",[uid(1)]);await own(1);await assert.rejects(allowed,/SESION_REQUERIDA/);
 await own(null);await assert.rejects(allowed,/SESION_REQUERIDA/);
 await db.exec('reset role');assert.equal((await q('select real_payments_enabled from private.plus_lanzamiento'))[0].real_payments_enabled,false);
 for(const role of ['anon','authenticated'])assert.equal((await q("select has_table_privilege($1,'private.plus_payment_testers','SELECT,INSERT,UPDATE,DELETE') p",[role]))[0].p,false);
 assert.equal((await q("select has_function_privilege('anon','mi_permiso_pago_tester()','EXECUTE') p"))[0].p,false);
 for(const [global,tester,accepted]of [[false,false,false],[false,true,true],[true,false,true],[false,'true',false]]){
  const client=helper(async name=>({data:name==='estado_lanzamiento_plus'?{real_payments_enabled:global}:tester,error:null}));
  if(accepted)await client.exigirPagosReales();else await assert.rejects(client.exigirPagosReales(),/PLUS_PAGOS_NO_DISPONIBLES/);
 }
 const offline=helper(async name=>{if(name==='estado_lanzamiento_plus')return{data:{real_payments_enabled:false}};throw Error('offline')});
 assert.equal(await offline.consultarPermisoPagoTester(),false);await assert.rejects(offline.exigirPagosReales(),/PLUS_PAGOS_NO_DISPONIBLES/);
 console.log('QA pagos: allowlist privada/RLS, UUID propio, protección/baneo/revocación, Reviewer excluido, cero grants y global OFF intacto OK');
 await db.close();
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1});
