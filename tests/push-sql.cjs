const {PGlite}=require('@electric-sql/pglite'),assert=require('node:assert/strict'),fs=require('node:fs');
const db=new PGlite(),uid=n=>`80000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const q=async(sql,args=[])=> (await db.query(sql,args)).rows;let solicitud=0;
async function como(n){await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[uid(n)]);await db.exec('set role authenticated');}
const accion=async(sala,tipo,datos={},req=`push-test-${++solicitud}`)=>(await q('select to_jsonb(accion_mesa($1,$2,$3,$4)) v',[sala,tipo,JSON.stringify(datos),req]))[0].v;
(async()=>{
 await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean not null default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;");
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8'));
 for(let n=1;n<=4;n++)await q('insert into auth.users values($1,$2)',[uid(n),n===4]);
 await como(1);const {liga_id:club,temporada_id:season}=(await q("select crear_liga('Push','Octubre','Facu') v"))[0].v;
 await db.exec('reset role');await q("insert into liga_miembros(liga_id,user_id,nombre) values($1,$2,'Nico')",[club,uid(2)]);
 const config={activos:true,pique:false,mvp:true,rivalidades:true,fechas:true,temporadas:true,recordatorios:true,limite_social:2};
 for(const n of [1,2]){await como(n);await q('select registrar_dispositivo_push($1,$2)',[`ExpoPushToken[abcdefghijklmnop${n}]`,'es']);await q('select guardar_preferencias_avisos($1,$2,0)',[club,JSON.stringify(config)]);}
 await como(4);await assert.rejects(q("select registrar_dispositivo_push('ExpoPushToken[abcdefghijklmnop4]','es')"),/CUENTA_REQUERIDA/);
 await como(1);await assert.rejects(q("select registrar_dispositivo_push('invalid','es')"),/DATOS_INVALIDOS/);
 const salas=[];
 for(const ganador of [1,2,2]){
  await como(1);const sala=(await q("select to_jsonb(crear_sala('[]'::jsonb,$1)) v",[season]))[0].v;salas.push(sala.id);const jugadores=[];
  for(const n of [1,2]){await como(n);jugadores.push((await q('select unirse_mesa($1,$2) v',[sala.codigo,n===1?'Facu':'Nico']))[0].v.jugadorId);}
  await como(1);await accion(sala.id,'ordenar',{orden:jugadores,dealer:jugadores[0]});
  await accion(sala.id,'configurar',{seccion:'fichas',valor:{tipo:'virtuales',stack:1000}});
  await accion(sala.id,'configurar',{seccion:'modo',valor:{id:'regular',niveles:[{minutos:20,smallBlind:5,bigBlind:10}]}});
  let estado=await accion(sala.id,'iniciar');
  for(const [n,tipo] of [[1,'allin'],[2,'igualar']]){
   await como(n);const monto=tipo==='igualar'?1000:undefined;
   estado=await accion(sala.id,'apostar',{tipo,mano:estado.mano,calle:estado.calle,revision:estado.revision,...(monto?{monto}:{})});
  }
  await db.exec('reset role');const pozos=(await q('select pozos_mesa($1) v',[sala.id]))[0].v;
  await como(1);const cierre={mano:estado.mano,pozo:estado.pozo,pozos:pozos.map(p=>({tope:p.tope,premios:[{jugador:jugadores[ganador-1],monto:p.monto}]}))};
  const req=`cierre-test-${++solicitud}`;estado=await accion(sala.id,'cerrar_mano',cierre,req);assert.equal(estado.estado,'finalizada');await accion(sala.id,'cerrar_mano',cierre,req);
 }
 await db.exec('reset role');let eventos=await q("select * from private.eventos_club where tipo='mvp' order by creado_en");
 assert.deepEqual(eventos.map(e=>e.datos.user_id),[uid(1),uid(2)],'Sólo cambios reales y primer MVP, nunca reintento');
 await como(1);assert.equal((await q('select detalle_liga($1) v',[club]))[0].v.feed.filter(e=>e.tipo==='mvp').length,2,'Feed conserva transiciones reales');
 await db.exec('reset role');
 const secret=(await q('select secreto from private.config_push'))[0].secreto;
 await como(1);await assert.rejects(q('select reservar_avisos_push($1)',[secret]),/permission denied/);
 await como(3);await assert.rejects(q('select * from private.dispositivos_push'),/permission denied/);
 await db.exec('reset role');await db.exec('set role service_role');await assert.rejects(q("select reservar_avisos_push('wrong')"),/DISPATCH_NO_AUTORIZADO/);
 const reservar=async()=> (await q('select reservar_avisos_push($1) v',[secret]))[0].v;
 let lote=await reservar();assert.equal(lote.filter(e=>e.tipo==='mvp').length,4);assert.equal(new Set(lote.map(e=>e.id)).size,lote.length);assert.deepEqual(await reservar(),[],'Reserva repetida no duplica ni consume de nuevo');
 assert.ok(lote.some(e=>e.tipo==='rivalidades'&&e.datos.nombre==='Nico'));
 await db.exec('reset role');
 for(const n of [1,2,3])await q("insert into private.eventos_club(id,liga_id,tipo,datos) values($1,$2,'recordatorios','{\"dias\":12}')",[`social:${n}`,club]);
 await db.exec('set role service_role');lote=await reservar();assert.ok(lote.filter(e=>e.tipo==='recordatorios'&&e.token.endsWith('1]')).length<=1,'Cupo compartido con rivalidades');
 assert.equal(lote.filter(e=>e.tipo==='recordatorios'&&e.token.endsWith('2]')).length,2);
 await como(1);const fecha=(await q("select programar_fecha_liga($1,now()+interval '2 days','','',null) id",[club]))[0].id;
 await q('select cancelar_fecha_liga($1)',[fecha]);await db.exec('reset role');await db.exec('set role service_role');assert.deepEqual(await reservar(),[],'No entrega fecha cancelada');
 await como(1);await q('select finalizar_temporada($1)',[season]);await q('select quitar_miembro($1,$2)',[club,uid(2)]);
 await db.exec('reset role');await db.exec('set role service_role');lote=await reservar();assert.equal(lote.length,1);assert.equal(lote[0].tipo,'temporadas','Cierre fuera del cupo social; expulsado excluido');
 await q('select confirmar_aviso_push($1,$2,$3,$4)',[secret,lote[0].id,'aceptada','ticket-demo']);
 await db.exec('reset role');await q("update private.entregas_push set reservada_en=now()-interval '16 minutes' where id=$1",[lote[0].id]);await db.exec('set role service_role');
 assert.equal((await q('select recibos_avisos_push($1) v',[secret]))[0].v.length,1);
 await q('select confirmar_aviso_push($1,$2,$3,null,$4)',[secret,lote[0].id,'fallida','DeviceNotRegistered']);
 assert.equal((await q('select recibos_avisos_push($1) v',[secret]))[0].v.length,0);
 await como(1);await assert.rejects(q('select * from private.config_push'),/permission denied/);
 console.log('Push SQL: torneos reales, cambio MVP idempotente, consentimiento, tokens privados, cupo combinado, cancelación, expulsión y recibos OK');await db.close();
})().catch(async e=>{console.error(e);await db.close();process.exitCode=1;});
