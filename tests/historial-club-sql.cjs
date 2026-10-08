const {PGlite}=require('@electric-sql/pglite'),assert=require('node:assert/strict'),fs=require('node:fs');
const db=new PGlite(),uid=n=>`90000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const q=async(s,a=[]) => (await db.query(s,a)).rows;
async function como(n){await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[uid(n)]);await db.exec('set role authenticated');}
(async()=>{
 await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean not null default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;");
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8'));
 for(let n=1;n<=3;n++)await q('insert into auth.users values($1,$2)',[uid(n),n===3]);
 await como(1);const {liga_id:club,temporada_id:season}=(await q("select crear_liga('History','Octubre','Facu') v"))[0].v;
 await db.exec('reset role');for(let n=100;n<145;n++)await q("insert into liga_partidas(sala_id,temporada_id,codigo_sala,finalizada_en) values($1,$2,$3,'2026-10-08T00:00:00Z')",[uid(n),season,`H${n}X`]);
 await como(1);const detalle=(await q('select detalle_liga($1) v',[club]))[0].v;assert.equal(detalle.partidas.length,20);assert.equal(detalle.historial_hay_mas,true);
 const next=async cursor=>(await q('select historial_club($1,$2,$3,$4) v',[club,season,cursor.finalizada_en,cursor.sala_id]))[0].v;
 let second=await next(detalle.partidas.at(-1));assert.equal(second.partidas.length,20);assert.equal(second.hay_mas,true);
 let third=await next(second.partidas.at(-1));assert.equal(third.partidas.length,5);assert.equal(third.hay_mas,false);
 assert.equal(new Set([...detalle.partidas,...second.partidas,...third.partidas].map(p=>p.sala_id)).size,45,'Misma fecha paginada por UUID, sin repetidos ni faltantes');
 await assert.rejects(q('select historial_club($1,$2,now(),null)',[club,season]),/DATOS_INVALIDOS/);
 await como(2);await assert.rejects(q('select historial_club($1,$2)',[club,season]),/LIGA_NO_DISPONIBLE/);
 await como(3);await assert.rejects(q('select historial_club($1,$2)',[club,season]),/CUENTA_REQUERIDA/);
 await db.exec('reset role');assert.equal((await q("select has_function_privilege('anon','public.historial_club(uuid,uuid,timestamptz,uuid)','execute') p"))[0].p,false);
 console.log('Historial club: 45 partidas, páginas 20/20/5, cursor estable y acceso aislado OK');await db.close();
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1;});
