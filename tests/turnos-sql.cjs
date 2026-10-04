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
    "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;",
  );
  for (let n = 1; n <= 12; n++)
    await db.query("insert into auth.users values($1)", [uid(n)]);
  for (const archivo of fs
    .readdirSync(raiz + "/supabase")
    .filter((f) => /^\d{2}_.*\.sql$/.test(f))
    .sort())
    await db.exec(fs.readFileSync(raiz + "/supabase/" + archivo, "utf8"));

  let fixtureN = 0;
  async function mesa(n = 3, tipo = "virtuales", dealerNumero = 1) {
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
    await accion(id, "ordenar", {
      orden: ids,
      dealer: ids[dealerNumero - 1],
    });
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
      if (tipo === "igualar" && monto == null) {
        const jugador = (
          await consulta(
            "select aporte_calle,fichas from jugadores where id=$1",
            [ids[num - 1]],
          )
        )[0];
        monto = Math.min(
          Number(jugador.aporte_calle) + Number(jugador.fichas),
          Number(estado.apuesta_actual),
        );
      }
      estado = await accion(id, "apostar", {
        tipo,
        mano: estado.mano,
        calle: estado.calle,
        revision: estado.revision,
        ...(monto == null ? {} : { monto }),
      });
      return estado;
    };
    const jugarFisico = async (tipo = "pasar") => {
      await leer();
      const num = ids.indexOf(estado.turno_id) + 1;
      if (num < 1) throw new Error("TURNO_FISICO_INVALIDO");
      await como(num);
      estado = await accion(id, "turno_fisico", {
        tipo,
        mano: estado.mano,
        calle: estado.calle,
        revision: estado.revision,
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
    return { id, ids, leer, jugar, jugarFisico, cerrar };
  }
  const m = await mesa();
  let s = await m.leer();
  assert.equal(s.turno_id, m.ids[0]);
  assert.equal(s.pozo, 15);
  assert.equal(s.boton_id, m.ids[0]);
  await falla(() => m.jugar(2, "igualar"), "TURNO_AJENO");
  await falla(() => m.jugar(1, "pasar"), "APUESTA_PENDIENTE");
  await como(1);
  await falla(
    () =>
      accion(m.id, "apostar", {
        tipo: "igualar",
        mano: s.mano,
        calle: s.calle,
        revision: s.revision,
      }),
    "MONTO_INVALIDO",
  );
  await falla(
    () =>
      accion(m.id, "apostar", {
        tipo: "igualar",
        monto: 9,
        mano: s.mano,
        calle: s.calle,
        revision: s.revision,
      }),
    "MONTO_IGUALAR_INVALIDO",
  );
  await falla(() => m.cerrar(), "APUESTAS_ABIERTAS");
  s = await m.jugar(1, "igualar");
  assert.equal(s.turno_id, m.ids[1]);
  s = await m.jugar(2, "igualar");
  assert.equal(s.turno_id, m.ids[2]); // BB retains option
  s = await m.jugar(3, "pasar");
  assert.equal(s.calle, "flop");
  assert.equal(s.turno_id, m.ids[1]);
  await falla(() => m.jugar(2, "subir", 5), "SUBIDA_INVALIDA");
  s = await m.jugar(2, "subir", 20);
  assert.equal(s.apuesta_actual, 20);
  await m.jugar(3, "igualar");
  s = await m.jugar(1, "igualar");
  assert.equal(s.calle, "turn");
  for (const calle of ["turn", "river"]) {
    for (const n of [2, 3, 1]) s = await m.jugar(n, "pasar");
  }
  assert.equal(s.calle, "reparto");
  assert.equal(s.turno_id, null);
  assert.equal(s.pozo, 90);
  await como(2);
  await falla(
    () =>
      accion(m.id, "cerrar_mano", { mano: s.mano, pozo: s.pozo, pozos: [] }),
    "SOLO_DEALER",
  );
  s = await m.cerrar();
  assert.equal(s.dealer_id, m.ids[0]);
  assert.equal(s.boton_id, m.ids[1]);
  assert.equal(s.turno_id, m.ids[1]);
  assert.equal(s.pozo, 15);
  assert.equal(
    Number(
      (
        await consulta(
          "select sum(fichas)+$2 as total from jugadores where sala_id=$1",
          [m.id, s.pozo],
        )
      )[0].total,
    ),
    3000,
  );
  // Heads-up: button/SB first preflop, BB first postflop; fixed payout dealer.
  const h = await mesa(2);
  s = await h.leer();
  assert.equal(s.turno_id, h.ids[0]);
  await h.jugar(1, "igualar");
  s = await h.jugar(2, "pasar");
  assert.equal(s.turno_id, h.ids[1]);
  s = await h.jugar(2, "retirarse");
  assert.equal(s.calle, "reparto");
  s = await h.cerrar();
  assert.equal(s.boton_id, h.ids[1]);
  assert.equal(s.turno_id, h.ids[1]);
  assert.equal(s.dealer_id, h.ids[0]);
  // Short all-in cannot reopen a previous actor's raise. Side pots limit eligibility.
  const a = await mesa();
  await db.exec("reset role");
  await db.query("update jugadores set fichas=25 where id=$1", [a.ids[2]]);
  await como(1);
  await a.jugar(1, "subir", 30);
  await a.jugar(2, "igualar");
  s = await a.jugar(3, "allin");
  assert.equal(s.apuesta_actual, 35);
  await falla(() => a.jugar(1, "subir", 65), "SUBIDA_NO_REABIERTA");
  await a.jugar(1, "igualar");
  s = await a.jugar(2, "igualar");
  assert.equal(s.calle, "flop");
  await a.jugar(2, "subir", 20);
  s = await a.jugar(1, "igualar");
  for (const n of [2, 1, 2, 1]) s = await a.jugar(n, "pasar");
  assert.equal(s.calle, "reparto");
  await db.exec("reset role");
  let pots = (await consulta("select pozos_mesa($1) as p", [a.id]))[0].p;
  assert.deepEqual(
    pots.map((p) => p.monto),
    [105, 40],
  );
  assert.equal(pots[1].elegibles.includes(a.ids[2]), false);
  await como(1);
  await falla(
    () =>
      accion(a.id, "cerrar_mano", {
        mano: s.mano,
        pozo: s.pozo,
        pozos: pots.map((p) => ({
          tope: p.tope,
          premios: [{ jugador: a.ids[2], monto: p.monto }],
        })),
      }),
    "REPARTO_INVALIDO",
  );
  s = await a.cerrar(2);
  assert.equal(s.dealer_id, a.ids[0]);
  // Idempotent calls and stale request prevention.
  const z = await mesa(2);
  s = await z.leer();
  await como(1);
  const datos = {
    mano: s.mano,
    calle: s.calle,
    revision: s.revision,
    tipo: "igualar",
    monto: 10,
  };
  const first = await accion(z.id, "apostar", datos, "repeticion-segura");
  const second = await accion(z.id, "apostar", datos, "repeticion-segura");
  assert.equal(first.pozo, second.pozo);
  assert.equal(first.revision, second.revision);
  await falla(() => accion(z.id, "apostar", datos), "MANO_CAMBIO");
  await falla(
    () => consulta("select preparar_apuestas($1,true)", [z.id]),
    "permission denied",
  );
  await falla(
    () =>
      consulta("select accion_mesa_v1($1,'apostar','{}','atajo-inseguro')", [
        z.id,
      ]),
    "permission denied",
  );
  // Physical: every player declares their own action; no chip deductions.
  const f = await mesa(3, "fisicas");
  s = await f.leer();
  assert.equal(s.pozo, 0);
  const primerTurno = s.turno_id;
  const ajeno = f.ids.findIndex((id) => id !== primerTurno) + 1;
  await como(ajeno);
  await falla(
    () =>
      accion(f.id, "turno_fisico", {
        mano: s.mano,
        calle: s.calle,
        revision: s.revision,
        tipo: "pasar",
      }),
    "TURNO_AJENO",
  );
  for (let i = 0; i < 12; i++)
    s = await f.jugarFisico(i === 0 ? "igualar" : "pasar");
  assert.equal(s.calle, "reparto");
  await como(2);
  await falla(
    () =>
      accion(f.id, "cerrar_mano", {
        mano: s.mano,
        pozo: s.pozo,
        premios: [],
      }),
    "SOLO_DEALER",
  );
  s = await f.cerrar();
  assert.equal(s.dealer_id, f.ids[0]);
  assert.equal(s.boton_id, f.ids[1]);

  // Dealer busts but retains distribution authority; previous BB must not repeat.
  const bust = await mesa();
  await bust.jugar(1, "allin");
  await bust.jugar(2, "igualar");
  s = await bust.jugar(3, "igualar");
  assert.equal(s.calle, "reparto");
  s = await bust.cerrar(1);
  assert.equal(s.dealer_id, bust.ids[0]);
  assert.equal(s.estado, "finalizada");
  const trans = await mesa(3, "fisicas");
  await como(1);
  await accion(trans.id, "fichas", { jugador: trans.ids[0], monto: 0 });
  for (let i = 0; i < 8; i++) s = await trans.jugarFisico();
  s = await trans.cerrar();
  assert.equal(s.bb_id, trans.ids[1]);
  assert.equal(s.boton_id, trans.ids[2]);
  assert.equal(s.dealer_id, trans.ids[0]);
  // Removing an unrelated physical player must not skip the current turn.
  const keep = await mesa(4, "fisicas");
  s = await keep.leer();
  const original = s.turno_id;
  await como(1);
  s = await accion(keep.id, "fichas", { jugador: keep.ids[1], monto: 0 });
  assert.equal(s.turno_id, original);

  // El host y cualquier otro jugador no pueden tocar stacks ajenos. El dealer
  // sí puede hacerlo aunque no sea el host de la sala.
  const permisos = await mesa(3, "fisicas", 2);
  await como(1);
  await falla(
    () =>
      accion(permisos.id, "fichas", {
        jugador: permisos.ids[2],
        monto: 700,
      }),
    "SOLO_DEALER",
  );
  await como(3);
  await falla(
    () =>
      accion(permisos.id, "fichas", {
        jugador: permisos.ids[0],
        monto: 700,
      }),
    "SOLO_DEALER",
  );
  await como(2);
  await accion(permisos.id, "fichas", {
    jugador: permisos.ids[0],
    monto: 700,
  });
  assert.equal(
    Number(
      (
        await consulta("select fichas from jugadores where id=$1", [
          permisos.ids[0],
        ])
      )[0].fichas,
    ),
    700,
  );
  console.log(
    "OK: turnos propios, dealer fijo, ciegas, heads-up, rondas, all-in, pozos, permisos e idempotencia",
  );
  await db.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
