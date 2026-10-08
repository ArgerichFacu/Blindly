const {PGlite}=require('@electric-sql/pglite'),assert=require('node:assert/strict'),fs=require('node:fs');
const db=new PGlite(),uid=n=>`50000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const q=async(sql,args=[])=> (await db.query(sql,args)).rows;
async function como(n){await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[uid(n)]);await db.exec('set role authenticated');}
(async()=>{
  await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean not null default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;");
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8'));
  for(let n=1;n<=9;n++)await q('insert into auth.users values($1,$2)',[uid(n),n===7]);
  await como(1);const {liga_id:club,temporada_id:season}=(await q("select crear_liga('Rivales','Octubre','Facu') v"))[0].v;
  const detalle=async(n=1,s=season)=>{await como(n);return (await q('select detalle_liga($1,$2) v',[club,s]))[0].v.rivalidades;};
  assert.deepEqual((await detalle()).rivales,[]);assert.equal((await detalle()).nemesis,null);
  await db.exec('reset role');
  for(let n=2;n<=7;n++)await q("insert into liga_miembros(liga_id,user_id,nombre) values($1,$2,'Mismo nombre')",[club,uid(n)]);
  async function partida(n,puestos,temporada=season,completa=true){
    await db.exec('reset role');
    for(const [user,puesto] of puestos)await q('insert into puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio,puesto,puntos,finalizada_en,temporada_id) values($1,$2,$3,$4,1000,$5,1,$6,$7)',[uid(100+n),uid(user),uid(1000+n*10+user),puestos.length,puesto,completa?new Date(Date.UTC(2026,9,n)).toISOString():null,temporada]);
  }
  await partida(1,[[1,2],[2,1],[3,1],[7,1]]);
  await partida(2,[[1,2],[2,1],[3,1],[7,1]]);
  assert.equal((await detalle()).rivales.length,0,'Dos torneos no bastan');
  await partida(3,[[1,1],[2,1],[3,1],[7,1]]);
  let d=await detalle();assert.equal(d.rivales.length,2,'No incluye invitado legacy');assert.equal(d.nemesis.user_id,uid(2),'Desempate por UUID, aunque nombres coincidan');
  assert.deepEqual([d.nemesis.compartidas,d.nemesis.victorias,d.nemesis.derrotas,d.nemesis.empates,d.nemesis.recientes],[3,0,2,1,3]);
  assert.equal((await detalle(2)).nemesis,null,'No inventa némesis con balance favorable');
  await partida(4,[[1,1],[2,2],[3,2]]);
  d=await detalle();assert.deepEqual([d.nemesis.victorias,d.nemesis.derrotas,d.nemesis.empates,d.nemesis.recientes,d.nemesis.derrotas_recientes],[1,2,1,4,2]);
  await partida(5,[[1,1],[2,2],[3,2]]);
  assert.equal((await detalle()).nemesis,null,'Balance igual deja de ser desfavorable');
  await partida(6,[[1,2],[2,1],[3,1]],season,false);
  assert.equal((await detalle()).rivales[0].compartidas,5,'No cuenta un torneo abierto');
  await db.exec('reset role');await q("insert into liga_temporadas(id,liga_id,nombre,estado) values($1,$2,'Anterior','finalizada')",[uid(900),club]);
  for(const n of [7,8,9])await partida(n,[[1,2],[2,1]],uid(900));
  assert.equal((await detalle(1,uid(900))).nemesis.derrotas,3,'Temporada histórica independiente');
  assert.equal((await detalle()).nemesis,null,'No mezcla temporadas');
  await como(1);await q('select quitar_miembro($1,$2)',[club,uid(2)]);
  assert.equal((await detalle()).rivales.length,1,'No lista miembros retirados');
  await como(2);await assert.rejects(q('select detalle_liga($1)',[club]),/LIGA_NO_DISPONIBLE/);
  await como(7);await assert.rejects(q('select detalle_liga($1)',[club]),/CUENTA_REQUERIDA/);
  await como(8);await assert.rejects(q('select detalle_liga($1)',[club]),/LIGA_NO_DISPONIBLE/);
  await assert.rejects(q('select private.rivalidades_temporada($1)',[season]),/permission denied/);
  // La némesis se elige sobre TODOS los candidatos, antes del límite visual de 5.
  const otro=(await q("select crear_liga('Más rivales','Inicio','Owner') v"))[0].v;
  await db.exec('reset role');
  for(let n=1;n<=6;n++)await q("insert into liga_miembros(liga_id,user_id,nombre) values($1,$2,'Rival')",[otro.liga_id,uid(n)]);
  let numero=20;
  for(let rival=1;rival<=5;rival++){
    for(let k=0;k<3;k++)await partida(numero++,[[8,2],[rival,1]],otro.temporada_id);
    for(let k=0;k<4;k++)await partida(numero++,[[8,1],[rival,2]],otro.temporada_id);
  }
  for(let k=0;k<2;k++)await partida(numero++,[[8,2],[6,1]],otro.temporada_id);
  await partida(numero++,[[8,1],[6,2]],otro.temporada_id);
  await como(8);
  const amplia=(await q('select detalle_liga($1) v',[otro.liga_id]))[0].v.rivalidades;
  assert.equal(amplia.rivales.length,5);assert.equal(amplia.nemesis.user_id,uid(6),'Némesis fuera de los cinco primeros por derrotas totales');
  console.log('Rivalidades SQL: Free, UUID, muestra mínima, empates, balance, últimos 4, temporadas, invitados y privacidad OK');
  await db.close();
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1;});
