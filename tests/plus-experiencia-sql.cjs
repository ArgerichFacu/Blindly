const { PGlite } = require("@electric-sql/pglite");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const db = new PGlite();
const uid = (n) => "30000000-0000-0000-0000-" + String(n).padStart(12, "0");
async function query(sql, params = []) { return (await db.query(sql, params)).rows; }
async function asUser(n) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid(n)]);
  await db.exec("set role authenticated");
}
async function fails(fn, code) { await assert.rejects(fn, new RegExp(code)); }

(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;");
  for (let n = 1; n <= 3; n++) await db.query("insert into auth.users values($1)", [uid(n)]);
  for (const file of fs.readdirSync(path.join(root, "supabase")).filter((name) => /^\d{2}_.*\.sql$/.test(name)).sort()) {
    await db.exec(fs.readFileSync(path.join(root, "supabase", file), "utf8"));
  }

  const config = {
    fichas: { tipo: "virtuales", stack: 5000 },
    modo: { id: "regular", niveles: [{ smallBlind: 25, bigBlind: 50, minutos: 15 }] },
    musica: true,
  };
  await asUser(1);
  await fails(() => query("select guardar_mesa_habitual(null,$1,$2,$3,$4,null)", ["Viernes Poker", ["Facu", "Nico"], JSON.stringify(config), "verde"]), "PLUS_REQUERIDO");

  await db.exec("reset role");
  await db.query("insert into accesos_plus(user_id,activo,entorno) values($1,true,'production')", [uid(1)]);
  await asUser(1);
  const mesa = (await query("select guardar_mesa_habitual(null,$1,$2,$3,$4,null) id", ["Viernes Poker", ["Facu", "Nico"], JSON.stringify(config), "verde"]))[0].id;
  const guardadas = (await query("select mis_mesas_habituales() datos"))[0].datos;
  assert.equal(guardadas.length, 1);
  assert.equal(guardadas[0].nombre, "Viernes Poker");
  assert.equal(guardadas[0].plus_activo, true);
  await fails(() => query("update mesas_habituales set nombre='Manipulada' where id=$1", [mesa]), "permission denied");
  await asUser(2);
  assert.equal(Number((await query("select count(*) total from mesas_habituales"))[0].total), 0);
  await fails(() => query("insert into mesas_habituales(owner_id,nombre,configuracion) values(auth.uid(),'Ajena',$1)", [JSON.stringify(config)]), "permission denied");

  await db.exec("reset role");
  await db.query("update accesos_plus set activo=false,verificado_en=now() where user_id=$1", [uid(1)]);
  await asUser(1);
  const conservadas = (await query("select mis_mesas_habituales() datos"))[0].datos;
  assert.equal(conservadas[0].plus_activo, false);
  await fails(() => query("select crear_sala_desde_mesa($1)", [mesa]), "PLUS_REQUERIDO");

  await db.exec("reset role");
  await db.query("update accesos_plus set activo=true,verificado_en=now() where user_id=$1", [uid(1)]);
  await asUser(1);
  const sala = (await query("select to_jsonb(crear_sala_desde_mesa($1)) sala", [mesa]))[0].sala;
  assert.equal(sala.configuracion.mesa_habitual_nombre, "Viernes Poker");
  assert.deepEqual(sala.configuracion.jugadores_habituales, ["Facu", "Nico"]);

  await db.exec("reset role");
  for (let i = 0; i < 12; i++) {
    const game = `40000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`;
    await db.query("insert into puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio,puesto,puntos,finalizada_en,nombre_jugador,duracion_ms) values($1,$2,gen_random_uuid(),2,5000,$3,$4,now()-($5::text||' days')::interval,$6,3600000)", [game, uid(1), i % 3 === 0 ? 1 : 2, i % 3 === 0 ? 25 : 18, 12 - i, "Facu"]);
    await db.query("insert into puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio,puesto,puntos,finalizada_en,nombre_jugador,duracion_ms) values($1,$2,gen_random_uuid(),2,5000,$3,$4,now()-($5::text||' days')::interval,$6,3600000)", [game, uid(2), i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 18 : 25, 12 - i, "Nico"]);
  }

  await asUser(2);
  const free = (await query("select mi_puntuacion() datos"))[0].datos;
  assert.equal(free.historial.length, 10);
  assert.equal(free.historial_completo, false);
  assert.equal(free.estadisticas, null);
  await fails(() => query("select mi_head_to_head()"), "PLUS_REQUERIDO");

  await asUser(1);
  const plus = (await query("select mi_puntuacion() datos"))[0].datos;
  assert.equal(plus.historial.length, 12);
  assert.equal(plus.historial_completo, true);
  assert.equal(plus.estadisticas.partidas, 12);
  assert.equal(plus.estadisticas.victorias, 4);
  assert.equal(plus.estadisticas.por_mes.length > 0, true);
  const versus = (await query("select mi_head_to_head() datos"))[0].datos;
  assert.equal(versus.length, 1);
  assert.equal(versus[0].nombre, "Nico");
  assert.equal(versus[0].partidas_juntos, 12);
  const recap = (await query("select recap_partida($1) datos", ["40000000-0000-0000-0000-000000000012"]))[0].datos;
  assert.equal(recap.resultados.length, 2);
  assert.equal(recap.resultados.some((r) => r.soy_yo), true);

  await asUser(3);
  await fails(() => query("select recap_partida($1)", ["40000000-0000-0000-0000-000000000012"]), "RECAP_NO_DISPONIBLE");
  console.log("OK: mesas habituales, cancelación/restauración Plus, historial Free/Plus, estadísticas, head-to-head y recap.");
  await db.close();
})().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exitCode = 1;
});
