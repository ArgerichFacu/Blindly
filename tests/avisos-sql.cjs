const {PGlite}=require('@electric-sql/pglite'),assert=require('node:assert/strict'),fs=require('node:fs');
const db=new PGlite(),uid=n=>`70000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const q=async(sql,args=[])=> (await db.query(sql,args)).rows;
async function como(n){await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[uid(n)]);await db.exec('set role authenticated');}
(async()=>{
 await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean not null default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;");
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8'));
 for(let n=1;n<=4;n++)await q('insert into auth.users values($1,$2)',[uid(n),n===4]);
 await como(1);const club=(await q("select crear_liga('Avisos','Octubre','Facu') v"))[0].v.liga_id;
 await db.exec('reset role');await q("insert into liga_miembros(liga_id,user_id,nombre) values($1,$2,'Nico')",[club,uid(2)]);
 await como(2);
 const leer=async()=> (await q('select detalle_liga($1,null) v',[club]))[0].v.preferencias_avisos;
 const inicial=await leer();assert.equal(inicial.activos,false);assert.equal(inicial.pique,false);assert.equal(inicial.revision,0);assert.equal(inicial.limite_social,2);
 const {revision,...config}=inicial;
 const guardar=async(p=config,r=0)=> (await q('select guardar_preferencias_avisos($1,$2,$3) v',[club,JSON.stringify(p),r]))[0].v;
 const elegidas={...config,activos:true,pique:true,mvp:false,limite_social:1};
 let resultado=await guardar(elegidas);assert.equal(resultado.revision,1);assert.deepEqual(await leer(),resultado);
 await assert.rejects(guardar(elegidas),/AVISOS_CAMBIARON/,'Un cliente atrasado no sobrescribe cambios');
 for(const p of [null,[],{}, {...config,user_id:uid(1)},{...config,pique:'true'}, {...config,mvp:null},{...config,limite_social:3},{...config,limite_social:-1},{...config,limite_social:1.5},{...config,limite_social:'1'}])
  await assert.rejects(guardar(p,1),/DATOS_INVALIDOS/);
 await assert.rejects(guardar(config,-1),/DATOS_INVALIDOS/);await assert.rejects(guardar(config,null),/DATOS_INVALIDOS/);
 assert.equal((await leer()).revision,1,'Errores no mutan preferencias');
 await como(1);assert.deepEqual(await leer(),inicial,'Owner no ve preferencias del miembro');
 await guardar({...config,limite_social:0});await como(2);assert.equal((await leer()).limite_social,1,'Cada UUID tiene preferencias independientes');
 resultado=await guardar({...elegidas,activos:false},1);assert.equal(resultado.revision,2);assert.equal(resultado.pique,true,'Silenciar no pierde el tono elegido');
 await como(3);await assert.rejects(leer(),/LIGA_NO_DISPONIBLE/);await assert.rejects(guardar(),/LIGA_NO_DISPONIBLE/);
 await como(4);await assert.rejects(guardar(),/CUENTA_REQUERIDA/);
 await como(2);await assert.rejects(q('select * from private.preferencias_avisos_club'),/permission denied/);
 await assert.rejects(q('select private.mis_preferencias_avisos($1)',[club]),/permission denied/);
 await db.exec('reset role');await q('update liga_miembros set activo=false where liga_id=$1 and user_id=$2',[club,uid(2)]);
 await como(2);await assert.rejects(guardar(config,2),/LIGA_NO_DISPONIBLE/);
 await db.exec('reset role');await q('update liga_miembros set activo=true where liga_id=$1 and user_id=$2',[club,uid(2)]);
 await como(2);assert.equal((await leer()).revision,2,'Salir y volver conserva preferencias');
 console.log('Avisos SQL: Free, opt-in, UUID privado, límites, validación, concurrencia y membresía OK');await db.close();
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1;});
