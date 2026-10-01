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
    .filter((f) => /^\d{2}_.*\.sql$/.test(f))
    .sort())
    await db.exec(fs.readFileSync(raiz + "/supabase/" + archivo, "utf8"));

  let fixtureN = 0;
  async function mesa(n = 3, tipo = "virtuales") {
    await como(1);
    const codigo = "T" + String(++fixtureN).padStart(4, "0");
    const id = (
      await consulta(
        "insert into salas(codigo,host_id,niveles) values($1,auth.uid(),'[]') returning id",
        [codigo],
      )
    )[0].id;
    const ids = [];
    for (let i = 1; i <= n; i++) {
      await como(i);
      ids.push(
        (await consulta("select unirse_mesa($1,$2) as j", [codigo, "J" + i]))[0]
          .j.jugadorId,
      );
    }
    await como(1);
    await accion(id, "ordenar", { orden: ids, dealer: ids[0] });
    await accion(id, "configurar", {
      seccion: "fichas",
      valor:
        tipo === "virtuales"
          ? { tipo, stack: 1000 }
          : { tipo, denominaciones: [{ valor: 10, cantidad: 300 }] },
    });
    await accion(id, "configurar", {
      seccion: "modo",
      valor: {
        id: "regular",
        niveles: [{ minutos: 20, smallBlind: 5, bigBlind: 10 }],
      },
    });
    let estado = await accion(id, "iniciar");
    const leer = async () =>
      (estado = (await consulta("select * from salas where id=$1", [id]))[0]);
    const jugar = async (num, tipo, monto) => {
      await como(num);
      await leer();
      estado = await accion(id, "apostar", {
        tipo,
        mano: estado.mano,
        calle: estado.calle,
        revision: estado.revision,
        ...(monto == null ? {} : { monto }),
      });
      return estado;
    };
    const cerrar = async (ganador = 0) => {
      await como(1);
      await leer();
      await db.exec("reset role");
      const capas = (await consulta("select pozos_mesa($1) as p", [id]))[0].p;
      await como(1);
      estado = await accion(id, "cerrar_mano", {
        mano: estado.mano,
        pozo: estado.pozo,
        pozos: capas.map((p) => ({
          tope: p.tope,
          premios: [
            {
              jugador: p.elegibles.includes(ids[ganador])
                ? ids[ganador]
                : p.elegibles[0],
              monto: p.monto,
            },
          ],
        })),
      });
      return estado;
    };
    return { id, ids, leer, jugar, cerrar };
  }
  // Tabla completa y recorte superior para cada tamaño de mesa.
  await db.exec("reset role");
  const puntos = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  for (let n = 2; n <= 10; n++)
    for (let p = 1; p <= n; p++)
      assert.equal(
        (await consulta("select puntos_posicion($1,$2) p", [n, p]))[0].p,
        puntos[10 - n + p - 1],
      );
  const m = await mesa(2);
  await m.jugar(1, "allin");
  await m.jugar(2, "igualar");
  let s = await m.cerrar(0);
  assert.equal(s.estado, "finalizada");
  const propio = async () => (await consulta("select mi_puntuacion() p"))[0].p;
  assert.equal((await propio()).puntos, 2);
  assert.equal((await propio()).rango, 1);
  await como(2);
  assert.equal((await propio()).puntos, 1);
  const rangos = await consulta("select * from rangos_mesa($1)", [m.id]);
  assert.equal(rangos.length, 2);
  assert.deepEqual(Object.keys(rangos[0]).sort(), ["jugador_id", "rango"]);
  await falla(
    () => consulta("select * from puntuacion_partidas"),
    "permission denied",
  );
  await falla(
    () => consulta("update puntuacion_partidas set puntos=999"),
    "permission denied",
  );
  await falla(
    () =>
      consulta("select accion_mesa_v2($1,$2,$3,$4)", [
        m.id,
        "iniciar",
        "{}",
        "prohibido-test",
      ]),
    "permission denied",
  );
  await como(12);
  await falla(
    () => consulta("select * from rangos_mesa($1)", [m.id]),
    "NO_PERTENECES",
  );
  assert.deepEqual(await propio(), {
    puntos: 0,
    partidas: 0,
    rango: null,
    historial: [],
  });
  await db.exec("reset role; set role anon");
  await falla(() => consulta("select mi_puntuacion()"), "permission denied");
  await falla(
    () => consulta("select * from puntuacion_partidas"),
    "permission denied",
  );
  // Repetir la solicitud original de cierre devuelve el estado, sin acreditar de nuevo.
  await db.exec("reset role");
  const cierre = (
    await consulta(
      "select * from operaciones_mesa where sala_id=$1 and accion='cerrar_mano'",
      [m.id],
    )
  )[0];
  await como(1);
  await accion(m.id, "cerrar_mano", cierre.datos, cierre.solicitud);
  assert.equal((await propio()).puntos, 2);
  assert.equal((await propio()).partidas, 1);
  // Borrar la sala no borra los puntos privados ni mantiene acceso al rango del rival.
  await consulta("delete from salas where id=$1", [m.id]);
  assert.equal((await propio()).puntos, 2);
  await falla(
    () => consulta("select * from rangos_mesa($1)", [m.id]),
    "NO_PERTENECES",
  );
  // Tres stacks iguales: 4 para el ganador y (2+1)/2 para cada eliminado.
  const t = await mesa(3);
  await t.jugar(1, "allin");
  await t.jugar(2, "igualar");
  await t.jugar(3, "igualar");
  await t.cerrar(0);
  await db.exec("reset role");
  let resultados = await consulta(
    "select puesto,puntos::float from puntuacion_partidas where sala_id=$1 order by puesto",
    [t.id],
  );
  assert.deepEqual(resultados, [
    { puesto: 1, puntos: 4 },
    { puesto: 2, puntos: 1.5 },
    { puesto: 2, puntos: 1.5 },
  ]);
  // Física: registrar cada eliminación al cierre evita perder su orden en manos siguientes.
  const f = await mesa(6, "fisicas");
  for (let eliminado = 6; eliminado >= 2; eliminado--) {
    await como(1);
    await accion(f.id, "fichas", { jugador: f.ids[eliminado - 1], monto: 0 });
    // Fixture para centrar este test en puntuación: el flujo de calles tiene su propia suite.
    await db.exec("reset role");
    await consulta(
      "update salas set calle='reparto',turno_id=null where id=$1",
      [f.id],
    );
    await f.cerrar();
    if (eliminado > 2) {
      await falla(
        () =>
          accion(f.id, "fichas", { jugador: f.ids[eliminado - 1], monto: 50 }),
        "ELIMINACION_CONFIRMADA",
      );
      assert.equal((await propio()).partidas, 2); // No se acredita hasta terminar.
    }
  }
  await db.exec("reset role");
  resultados = await consulta(
    "select puesto,puntos::float from puntuacion_partidas where sala_id=$1 order by puesto",
    [f.id],
  );
  assert.deepEqual(
    resultados,
    [10, 8, 6, 4, 2, 1].map((p, i) => ({ puesto: i + 1, puntos: p })),
  );
  // Error de reparto no puede confirmar eliminaciones o puntuar.
  const e = await mesa(2);
  await e.jugar(1, "allin");
  await e.jugar(2, "igualar");
  await como(1);
  s = await e.leer();
  await falla(
    () =>
      accion(e.id, "cerrar_mano", { mano: s.mano, pozo: s.pozo, pozos: [] }),
    "REPARTO_INVALIDO",
  );
  await db.exec("reset role");
  assert.equal(
    (
      await consulta(
        "select count(*)::int n from puntuacion_partidas where sala_id=$1 and (finalizada_en is not null or mano_eliminacion is not null)",
        [e.id],
      )
    )[0].n,
    0,
  );

  // Misma mano, distinto stack inicial: se respeta el desempate sin repartir puntos de más.
  const d = await mesa(3);
  await db.exec("reset role");
  for (let i = 0; i < 3; i++)
    await consulta("update jugadores set fichas=$1-aporte_calle where id=$2", [
      [1000, 500, 250][i],
      d.ids[i],
    ]);
  await d.jugar(1, "allin");
  await d.jugar(2, "igualar");
  await d.jugar(3, "igualar");
  await d.cerrar(0);
  await db.exec("reset role");
  assert.deepEqual(
    await consulta(
      "select puesto,puntos::float from puntuacion_partidas where sala_id=$1 order by puesto",
      [d.id],
    ),
    [
      { puesto: 1, puntos: 4 },
      { puesto: 2, puntos: 2 },
      { puesto: 3, puntos: 1 },
    ],
  );
  console.log(
    "OK: puntos 2–10 jugadores, empates, cierre único, eliminaciones físicas, privacidad, permisos, persistencia y rollback.",
  );
  await db.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
