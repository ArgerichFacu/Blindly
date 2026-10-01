const { PGlite } = require("@electric-sql/pglite");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const db = new PGlite();

(async () => {
  await db.exec(
    "create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;",
  );

  for (const file of fs
    .readdirSync(path.join(root, "supabase"))
    .filter((name) => /^\d{2}_.*\.sql$/.test(name))
    .sort()) {
    await db.exec(fs.readFileSync(path.join(root, "supabase", file), "utf8"));
  }

  const privileges = (
    await db.query(`
      select
        has_function_privilege('anon', 'public.hora_servidor()', 'execute') as anon_hora,
        has_function_privilege('authenticated', 'public.hora_servidor()', 'execute') as auth_hora,
        to_regprocedure('public.soy_jugador_de(uuid)') is null as helper_publico_ausente,
        has_function_privilege('anon', 'private.soy_jugador_de(uuid)', 'execute') as anon_mesa,
        has_function_privilege('authenticated', 'private.soy_jugador_de(uuid)', 'execute') as auth_mesa
    `)
  ).rows[0];
  assert.deepEqual(privileges, {
    anon_hora: false,
    auth_hora: true,
    helper_publico_ausente: true,
    anon_mesa: false,
    auth_mesa: true,
  });

  const indexes = (
    await db.query(`
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'jugadores_user_id_idx',
          'operaciones_mesa_sala_id_idx',
          'salas_host_id_idx'
        )
      order by indexname
    `)
  ).rows.map((row) => row.indexname);
  assert.deepEqual(indexes, [
    "jugadores_user_id_idx",
    "operaciones_mesa_sala_id_idx",
    "salas_host_id_idx",
  ]);

  const policies = (
    await db.query(`
      select cmd, policyname
      from pg_policies
      where schemaname = 'public' and tablename = 'jugadores'
      order by cmd, policyname
    `)
  ).rows;
  assert.equal(policies.filter((policy) => policy.cmd === "SELECT").length, 1);
  assert.equal(policies.filter((policy) => policy.cmd === "UPDATE").length, 0);
  assert.ok(
    policies.some(
      (policy) =>
        policy.cmd === "SELECT" &&
        policy.policyname === "ver jugadores autorizados",
    ),
  );

  await db.exec("set role anon");
  await assert.rejects(
    () => db.query("select public.hora_servidor()"),
    /permission denied/i,
  );
  await db.exec("reset role; set role authenticated");
  assert.equal(
    (await db.query("select public.hora_servidor() is not null as ok")).rows[0].ok,
    true,
  );

  console.log(
    "OK: auxiliares privados, política única de lectura e índices para claves foráneas.",
  );
  await db.close();
})().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exitCode = 1;
});
