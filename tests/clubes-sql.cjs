const { PGlite } = require("@electric-sql/pglite"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const db = new PGlite(),
  uid = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const q = async (sql, args = []) => (await db.query(sql, args)).rows;
async function como(n) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    uid(n),
  ]);
  await db.exec("set role authenticated");
}
async function falla(sql, args, codigo) {
  await assert.rejects(q(sql, args), new RegExp(codigo));
}
(async () => {
  await db.exec(
    "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean not null default false); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;",
  );
  for (const file of fs
    .readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(fs.readFileSync(`supabase/migrations/${file}`, "utf8"));
  for (let n = 1; n <= 4; n++)
    await q("insert into auth.users values($1,$2)", [uid(n), n === 4]);
  await como(4);
  await falla(
    "select crear_liga('Club','Temporada','Guest')",
    [],
    "CUENTA_REQUERIDA",
  );
  assert.ok(
    (await q("select (crear_sala('[]'::jsonb)).id"))[0].id,
    "Casual guest stays Free",
  );
  await como(1);
  const { liga_id: club, temporada_id: season } = (
    await q("select crear_liga('Los Pibes','2026','Facu') v")
  )[0].v;
  const before = (await q("select detalle_liga($1) v", [club]))[0].v;
  assert.equal(before.liga.puede_administrar, true);
  assert.equal(before.liga.rol, "owner");
  assert.equal(before.miembros[0].rol, "owner");
  await db.exec("reset role");
  await q(
    "insert into liga_miembros(liga_id,user_id,nombre) values($1,$2,'Facu'),($1,$3,'Facu'),($1,$4,'Legacy')",
    [club, uid(2), uid(3), uid(4)],
  );
  await como(1);
  await q("select cambiar_rol_liga($1,$2,'admin')", [club, uid(2)]);
  await falla(
    "select cambiar_rol_liga($1,$2,'admin')",
    [club, uid(4)],
    "CUENTA_REQUERIDA",
  );
  await falla(
    "select cambiar_rol_liga($1,$2,'member')",
    [club, uid(1)],
    "OWNER_REQUERIDO",
  );
  await como(2);
  await q("select actualizar_club($1,'Nuestra mesa de los viernes')", [club]);
  await falla(
    "select cambiar_rol_liga($1,$2,'admin')",
    [club, uid(3)],
    "SOLO_OWNER",
  );
  await falla("select actualizar_liga($1,'Hack',true)", [club], "SOLO_OWNER");
  await falla(
    "select quitar_miembro($1,$2)",
    [club, uid(1)],
    "OWNER_REQUERIDO",
  );
  await falla("select quitar_miembro($1,$2)", [club, uid(2)], "SOLO_OWNER");
  await q("select quitar_miembro($1,$2)", [club, uid(3)]);
  await q("select finalizar_temporada($1)", [season]);
  const second = (await q("select crear_temporada($1,'2027') id", [club]))[0]
    .id;
  assert.ok(second);
  await q("select crear_sala('[]'::jsonb,$1)", [second]);
  await falla(
    "select finalizar_temporada($1)",
    [second],
    "TEMPORADA_NO_FINALIZABLE",
  );
  await como(3);
  await falla("select detalle_liga($1)", [club], "LIGA_NO_DISPONIBLE");
  await falla("select actualizar_club($1,'Hack')", [club], "SOLO_ADMIN");
  await como(4);
  assert.equal(
    (await q("select detalle_liga($1) v", [club]))[0].v.liga.puede_administrar,
    false,
    "Legacy guest remains visible until protected",
  );
  await falla("select finalizar_temporada($1)", [second], "CUENTA_REQUERIDA");
  await como(1);
  const detail = (await q("select detalle_liga($1) v", [club]))[0].v;
  assert.equal(detail.liga.descripcion, "Nuestra mesa de los viernes");
  assert.equal(detail.temporadas.length, 2);
  assert.equal(detail.miembros.find((m) => m.user_id === uid(2)).rol, "admin");
  await q("select cambiar_rol_liga($1,$2,'member')", [club, uid(2)]);
  await como(2);
  await falla("select actualizar_club($1,'Hack')", [club], "SOLO_ADMIN");
  await falla("update liga_miembros set rol='admin'", [], "permission denied");
  await db.exec("reset role");
  const privileges = (
    await q(
      "select has_function_privilege('anon','public.cambiar_rol_liga(uuid,uuid,text)','execute') a, has_function_privilege('authenticated','private.exigir_cuenta()','execute') b, has_function_privilege('authenticated','private.detalle_liga_base_club(uuid,uuid)','execute') c",
    )
  )[0];
  assert.deepEqual(privileges, { a: false, b: false, c: false });
  console.log(
    "Clubes: Free, cuenta obligatoria para administrar, legacy, roles, revocación, temporadas, datos y RPC/RLS OK",
  );
  await db.close();
})().catch(async (e) => {
  console.error(e);
  await db.close();
  process.exitCode = 1;
});
