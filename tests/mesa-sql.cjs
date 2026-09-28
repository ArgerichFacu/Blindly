const { PGlite } = require("@electric-sql/pglite");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const raiz = require("node:path").resolve(__dirname, "..");
const db = new PGlite();
const uid = (n) => "00000000-0000-0000-0000-" + String(n).padStart(12, "0");
let solicitud = 0;
async function consulta(sql, params = []) {
  return (await db.query(sql, params)).rows;
}
async function como(n) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    uid(n),
  ]);
  await db.exec("set role authenticated");
}
async function accion(sala, tipo, datos = {}, id = "prueba-" + ++solicitud) {
  return (
    await consulta("select to_jsonb(public.accion_mesa($1,$2,$3,$4)) as sala", [
      sala,
      tipo,
      JSON.stringify(datos),
      id,
    ])
  )[0].sala;
}
async function falla(fn, texto) {
  await assert.rejects(fn, new RegExp(texto));
}
(async () => {
  await db.exec(
    "create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;",
  );
  for (let n = 1; n <= 12; n++)
    await db.query("insert into auth.users values($1)", [uid(n)]);
  for (const archivo of fs
    .readdirSync(raiz + "/supabase")
    .filter((f) => /^0[1-7]_.*\.sql$/.test(f))
    .sort())
    await db.exec(fs.readFileSync(raiz + "/supabase/" + archivo, "utf8"));
  await como(1);
  const sala = (
    await consulta(
      "insert into salas(codigo,host_id,niveles) values('PRUEB',auth.uid(),'[]') returning id",
    )
  )[0].id;
  const jugadores = [];
  for (let n = 1; n <= 10; n++) {
    await como(n);
    const r = await consulta("select unirse_mesa('PRUEB',$1) as datos", [
      "Jugador " + n,
    ]);
    jugadores.push(r[0].datos.jugadorId);
  }
  await como(11);
  await falla(
    () => consulta("select unirse_mesa('PRUEB','Extra')"),
    "SALA_LLENA",
  );
  await como(1);
  await consulta("select unirse_mesa('PRUEB','Host')");
  await falla(() => accion(sala, "iniciar"), "ORDEN_INVALIDO");
  await falla(
    () =>
      accion(sala, "ordenar", {
        orden: Array(10).fill(jugadores[0]),
        dealer: jugadores[0],
      }),
    "ORDEN_INVALIDO",
  );
  await accion(sala, "ordenar", { orden: jugadores, dealer: jugadores[0] });
  await falla(() => accion(sala, "iniciar"), "CONFIGURACION_INCOMPLETA");
  await accion(sala, "configurar", {
    seccion: "fichas",
    valor: { tipo: "virtuales", stack: 1000 },
  });
  await accion(sala, "configurar", {
    seccion: "modo",
    valor: {
      id: "regular",
      niveles: [{ smallBlind: 25, bigBlind: 50, minutos: 15 }],
    },
  });
  let s = await accion(sala, "iniciar");
  assert.equal(s.estado, "jugando");
  await falla(
    () => consulta("update jugadores set fichas=9999 where user_id=auth.uid()"),
    "permission denied",
  );
  await falla(
    () => consulta("update salas set pozo=9999 where id=$1", [sala]),
    "permission denied",
  );
  await falla(
    () =>
      consulta(
        "insert into jugadores(sala_id,user_id,nombre,fichas) values($1,auth.uid(),'X',9999)",
        [sala],
      ),
    "permission denied",
  );
  await como(2);
  await falla(() => accion(sala, "pausar"), "SOLO_HOST");
  await falla(
    () => accion(sala, "apostar", { monto: 1001, mano: 1 }),
    "MONTO_INVALIDO",
  );
  await falla(
    () => accion(sala, "apostar", { monto: -1, mano: 1 }),
    "MONTO_INVALIDO",
  );
  s = await accion(sala, "apostar", { monto: 100, mano: 1 }, "misma-apuesta");
  assert.equal(s.pozo, 100);
  s = await accion(sala, "apostar", { monto: 100, mano: 1 }, "misma-apuesta");
  assert.equal(s.pozo, 100);
  await falla(
    () =>
      accion(sala, "cerrar_mano", {
        mano: 1,
        pozo: 100,
        premios: [{ jugador: jugadores[1], monto: 100 }],
      }),
    "SOLO_DEALER",
  );
  await como(1);
  await falla(
    () =>
      accion(sala, "cerrar_mano", {
        mano: 1,
        pozo: 100,
        premios: [{ jugador: jugadores[1], monto: 101 }],
      }),
    "REPARTO_INVALIDO",
  );
  await falla(
    () => accion(sala, "cerrar_mano", { mano: 1, pozo: 0, premios: [] }),
    "MANO_CAMBIO",
  );
  s = await accion(sala, "cerrar_mano", {
    mano: 1,
    pozo: 100,
    premios: [
      { jugador: jugadores[1], monto: 60 },
      { jugador: jugadores[0], monto: 40 },
    ],
  });
  assert.equal(s.pozo, 0);
  assert.equal(s.mano, 2);
  assert.equal(s.dealer_id, jugadores[1]);
  const suma = (
    await consulta(
      "select sum(fichas)::text as total from jugadores where sala_id=$1",
      [sala],
    )
  )[0].total;
  assert.equal(suma, "10000");
  await falla(
    () => accion(sala, "apostar", { mano: 1, monto: 1 }),
    "MANO_CAMBIO",
  );
  s = await accion(sala, "pausar");
  assert.equal(s.estado, "pausado");
  assert.equal(s.inicio_en, null);
  s = await accion(sala, "comenzar");
  assert.equal(s.estado, "jugando");
  await falla(
    () => accion(sala, "fichas", { jugador: jugadores[0], monto: 9999 }),
    "ESTADO_INVALIDO",
  );
  await como(11);
  await falla(
    () => consulta("select unirse_mesa('PRUEB','Tarde')"),
    "PARTIDA_INICIADA",
  );
  console.log(
    "OK: límite 10, configuración obligatoria, permisos, apuestas, reintentos, reparto, conservación y rotación.",
  );
  await como(1);
  const fisica = (
    await consulta(
      "insert into salas(codigo,host_id,niveles) values('FISIC',auth.uid(),'[]') returning id",
    )
  )[0].id;
  const fisicos = [];
  for (let n = 1; n <= 3; n++) {
    await como(n);
    fisicos.push(
      (
        await consulta("select unirse_mesa('FISIC',$1) as datos", [
          "Físico " + n,
        ])
      )[0].datos.jugadorId,
    );
  }
  await como(1);
  await accion(fisica, "ordenar", { orden: fisicos, dealer: fisicos[0] });
  await accion(fisica, "configurar", {
    seccion: "fichas",
    valor: {
      tipo: "fisicas",
      denominaciones: [
        { valor: 25, cantidad: 10 },
        { valor: 100, cantidad: 8 },
      ],
    },
  });
  await accion(fisica, "configurar", {
    seccion: "modo",
    valor: {
      id: "turbo",
      niveles: [{ smallBlind: 25, bigBlind: 50, minutos: 8 }],
    },
  });
  await accion(fisica, "iniciar");
  const stacks = await consulta(
    "select fichas from jugadores where sala_id=$1",
    [fisica],
  );
  assert.ok(stacks.every((j) => j.fichas === 275));
  await falla(
    () => accion(fisica, "apostar", { monto: 25, mano: 1 }),
    "ESTADO_INVALIDO",
  );
  await accion(fisica, "fichas", { jugador: fisicos[2], monto: 0 });
  s = await accion(fisica, "cerrar_mano", { mano: 1, pozo: 0, premios: [] });
  assert.equal(s.dealer_id, fisicos[1]);
  console.log(
    "OK: reparto físico igual, sobrantes fuera del stack, sin apuestas virtuales y salto de eliminados.",
  );
  await db.close();
})().catch(async (e) => {
  console.error(e.message);
  console.error(e.detail ?? "");
  await db.close();
  process.exitCode = 1;
});
