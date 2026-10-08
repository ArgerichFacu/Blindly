const { PGlite } = require("@electric-sql/pglite");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sqlDir = path.join(root, "supabase");
const migrationDir = path.join(sqlDir, "migrations");
const db = new PGlite();
const normalize = (value) => value.replace(/\r\n/g, "\n").trim();
const read = (file) => fs.readFileSync(file, "utf8");

(async () => {
  const migrationFiles = fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  assert.deepEqual(migrationFiles, [
    "20261001180424_acciones_jugador.sql",
    "20261001183749_seguridad_rendimiento.sql",
    "20261001184017_helper_privado.sql",
    "20261001232717_grant_edge_account_cleanup.sql",
    "20261002194847_stack_solo_dealer.sql",
    "20261002200358_salas_privadas.sql",
    "20261003005104_monto_igualar.sql",
    "20261004221957_ligas_temporadas_ranking.sql",
    "20261005170548_plus_mesas_estadisticas_recap.sql",
    "20261008042305_clubes_free_roles.sql",
    "20261008043539_invitaciones_club.sql",
    "20261008043933_rendimiento_clubes.sql",
  ]);

  const baseSources = fs
    .readdirSync(sqlDir)
    .filter((name) => /^(0[1-9]|10)_.*\.sql$/.test(name))
    .sort()
    .map((name) => read(path.join(sqlDir, name)))
    .join("\n");
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[0]))),
    normalize(baseSources),
    "la migración base debe reflejar exactamente 01-10",
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[1]))),
    normalize(read(path.join(sqlDir, "11_seguridad_rendimiento.sql"))),
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[2]))),
    normalize(read(path.join(sqlDir, "12_helper_privado.sql"))),
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[4]))),
    normalize(read(path.join(sqlDir, "13_stack_solo_dealer.sql"))),
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[5]))),
    normalize(read(path.join(sqlDir, "14_salas_privadas.sql"))),
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[6]))),
    normalize(read(path.join(sqlDir, "15_monto_igualar.sql"))),
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[7]))),
    normalize(read(path.join(sqlDir, "16_ligas_temporadas_ranking.sql"))),
  );
  assert.equal(
    normalize(read(path.join(migrationDir, migrationFiles[8]))),
    normalize(read(path.join(sqlDir, "17_plus_mesas_estadisticas_recap.sql"))),
  );

  await db.exec(
    "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key, is_anonymous boolean not null default false); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;",
  );

  for (const file of migrationFiles) {
    await db.exec(read(path.join(migrationDir, file)));
  }

  const schema = (
    await db.query(`
      select
        to_regclass('public.salas') is not null as salas,
        to_regclass('public.jugadores') is not null as jugadores,
        to_regclass('public.puntuacion_partidas') is not null as puntuacion,
        to_regclass('public.ligas') is not null as ligas,
        to_regclass('public.liga_temporadas') is not null as temporadas,
        to_regclass('public.liga_miembros') is not null as miembros,
        to_regclass('public.liga_partidas') is not null as partidas_liga,
        to_regclass('public.accesos_plus') is not null as accesos_plus,
        to_regclass('public.mesas_habituales') is not null as mesas_habituales,
        to_regprocedure('public.accion_mesa(uuid,text,jsonb,text)') is not null as accion,
        to_regprocedure('public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)') is not null as accion_sin_estadisticas,
        to_regprocedure('public.accion_mesa_sin_ligas(uuid,text,jsonb,text)') is not null as accion_sin_ligas,
        to_regprocedure('public.accion_mesa_con_puntuacion(uuid,text,jsonb,text)') is not null as accion_base,
        to_regprocedure('public.accion_mesa_con_stack_dealer(uuid,text,jsonb,text)') is not null as accion_stack,
        to_regprocedure('private.soy_jugador_de(uuid)') is not null as helper_privado,
        has_table_privilege('service_role', 'public.salas', 'select') as servicio_salas,
        has_table_privilege('service_role', 'public.jugadores', 'select') as servicio_jugadores
    `)
  ).rows[0];
  assert.deepEqual(schema, {
    salas: true,
    jugadores: true,
    puntuacion: true,
    ligas: true,
    temporadas: true,
    miembros: true,
    partidas_liga: true,
    accesos_plus: true,
    mesas_habituales: true,
    accion: true,
    accion_sin_estadisticas: true,
    accion_sin_ligas: true,
    accion_base: true,
    accion_stack: true,
    helper_privado: true,
    servicio_salas: true,
    servicio_jugadores: true,
  });

  const functionDefinition = (
    await db.query(
      "select pg_get_functiondef('public.accion_mesa_sin_ligas(uuid,text,jsonb,text)'::regprocedure) as definition",
    )
  ).rows[0].definition;
  assert.match(functionDefinition, /MONTO_IGUALAR_INVALIDO/);
  const finalDefinition = (
    await db.query(
      "select pg_get_functiondef('public.accion_mesa(uuid,text,jsonb,text)'::regprocedure) as definition",
    )
  ).rows[0].definition;
  assert.match(finalDefinition, /accion_mesa_sin_estadisticas/);
  assert.match(finalDefinition, /nombre_jugador/);
  const leagueDefinition = (
    await db.query(
      "select pg_get_functiondef('public.accion_mesa_sin_estadisticas(uuid,text,jsonb,text)'::regprocedure) as definition",
    )
  ).rows[0].definition;
  assert.match(leagueDefinition, /liga_miembros/);
  assert.match(leagueDefinition, /temporada_id/);
  assert.match(leagueDefinition, /private\.exigir_cuenta\(\)/);
  assert.match(leagueDefinition, /TEMPORADA_NO_FINALIZABLE/);
  const stackDefinition = (
    await db.query(
      "select pg_get_functiondef('public.accion_mesa_con_stack_dealer(uuid,text,jsonb,text)'::regprocedure) as definition",
    )
  ).rows[0].definition;
  assert.match(stackDefinition, /SOLO_DEALER/);
  assert.match(stackDefinition, /j\.id is distinct from s\.dealer_id/i);

  console.log(
    "OK: historial Supabase completo, reproducible, stacks protegidos y montos de igualada validados.",
  );
  await db.close();
})().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exitCode = 1;
});
