const { PGlite } = require("@electric-sql/pglite");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const db = new PGlite();
const uid = (n) => "10000000-0000-0000-0000-" + String(n).padStart(12, "0");
let solicitud = 0;

async function consulta(sql, params = []) {
  return (await db.query(sql, params)).rows;
}
async function como(n) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid(n)]);
  await db.exec("set role authenticated");
}
async function falla(fn, codigo) {
  await assert.rejects(fn, new RegExp(codigo));
}
async function accion(sala, tipo, datos = {}, id = `liga-test-${++solicitud}`) {
  return (
    await consulta("select to_jsonb(public.accion_mesa($1,$2,$3,$4)) sala", [
      sala,
      tipo,
      JSON.stringify(datos),
      id,
    ])
  )[0].sala;
}

(async () => {
  await db.exec(
    "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;",
  );
  for (let n = 1; n <= 4; n++)
    await db.query("insert into auth.users values($1)", [uid(n)]);
  for (const archivo of fs
    .readdirSync(path.join(root, "supabase"))
    .filter((f) => /^\d{2}_.*\.sql$/.test(f))
    .sort())
    await db.exec(fs.readFileSync(path.join(root, "supabase", archivo), "utf8"));

  await como(1);
  await falla(
    () => consulta("select crear_liga('Los Pibes','Temporada 2026','Facu')"),
    "PLUS_REQUERIDO",
  );

  // El acceso se escribe únicamente desde el backend que valida RevenueCat.
  await db.exec("reset role");
  await db.query(
    "insert into accesos_plus(user_id,activo,vence_en,entorno) values($1,true,null,'production')",
    [uid(1)],
  );
  await como(1);
  const creada = (
    await consulta("select crear_liga($1,$2,$3) liga", [
      "Los Pibes Poker League",
      "Temporada 2026",
      "Facu",
    ])
  )[0].liga;
  assert.ok(creada.liga_id);
  assert.ok(creada.temporada_id);
  assert.equal((await consulta("select mi_estado_plus() estado"))[0].estado.activo, true);

  // Un usuario ajeno no puede enumerar ni leer la liga.
  await como(3);
  assert.equal((await consulta("select count(*)::int n from ligas"))[0].n, 0);
  await falla(
    () => consulta("select detalle_liga($1)", [creada.liga_id]),
    "LIGA_NO_DISPONIBLE",
  );

  // El owner Plus crea una sala asociada. El juego y sus jugadores siguen
  // usando el flujo normal; el invitado Free no necesita suscripción.
  await como(1);
  const sala = (
    await consulta("select to_jsonb(crear_sala('[]'::jsonb,$1)) sala", [
      creada.temporada_id,
    ])
  )[0].sala;
  const jugadores = [];
  for (let n = 1; n <= 2; n++) {
    await como(n);
    jugadores.push(
      (
        await consulta("select unirse_mesa($1,$2) jugador", [
          sala.codigo,
          n === 1 ? "Facu" : "Nico",
        ])
      )[0].jugador.jugadorId,
    );
  }
  await como(1);
  await accion(sala.id, "ordenar", { orden: jugadores, dealer: jugadores[0] });
  await accion(sala.id, "configurar", {
    seccion: "fichas",
    valor: { tipo: "virtuales", stack: 1000 },
  });
  await accion(sala.id, "configurar", {
    seccion: "modo",
    valor: {
      id: "regular",
      niveles: [{ minutos: 20, smallBlind: 5, bigBlind: 10 }],
    },
  });
  let estado = await accion(sala.id, "iniciar");
  assert.equal(
    (await consulta("select count(*)::int n from liga_miembros where liga_id=$1", [creada.liga_id]))[0].n,
    2,
  );

  async function jugar(n, tipo, monto) {
    await como(n);
    estado = (await consulta("select * from salas where id=$1", [sala.id]))[0];
    if (tipo === "igualar") {
      const j = (
        await consulta("select aporte_calle,fichas from jugadores where id=$1", [
          jugadores[n - 1],
        ])
      )[0];
      monto = Math.min(
        Number(j.aporte_calle) + Number(j.fichas),
        Number(estado.apuesta_actual),
      );
    }
    estado = await accion(sala.id, "apostar", {
      tipo,
      mano: estado.mano,
      calle: estado.calle,
      revision: estado.revision,
      ...(monto == null ? {} : { monto }),
    });
  }
  await jugar(1, "allin");
  await jugar(2, "igualar");
  await db.exec("reset role");
  const pozos = (await consulta("select pozos_mesa($1) p", [sala.id]))[0].p;
  await como(1);
  estado = (await consulta("select * from salas where id=$1", [sala.id]))[0];
  const cierre = {
    mano: estado.mano,
    pozo: estado.pozo,
    pozos: pozos.map((p) => ({
      tope: p.tope,
      premios: [{ jugador: jugadores[0], monto: p.monto }],
    })),
  };
  const solicitudCierre = `cierre-${++solicitud}`;
  estado = await accion(sala.id, "cerrar_mano", cierre, solicitudCierre);
  assert.equal(estado.estado, "finalizada");
  // Reintentar el cierre es idempotente también para la asociación de liga.
  await accion(sala.id, "cerrar_mano", cierre, solicitudCierre);

  await como(2);
  const detalle = (
    await consulta("select detalle_liga($1) detalle", [creada.liga_id])
  )[0].detalle;
  assert.equal(detalle.liga.nombre, "Los Pibes Poker League");
  assert.equal(detalle.ranking.length, 2);
  assert.deepEqual(
    detalle.ranking.map((r) => ({
      posicion: Number(r.posicion),
      nombre: r.nombre,
      partidas: Number(r.partidas),
      puntos: Number(r.puntos),
    })),
    [
      { posicion: 1, nombre: "Facu", partidas: 1, puntos: 2 },
      { posicion: 2, nombre: "Nico", partidas: 1, puntos: 1 },
    ],
  );
  assert.equal(detalle.partidas.length, 1);
  assert.equal(detalle.partidas[0].ganador, "Facu");
  assert.equal(detalle.partidas[0].jugadores, 2);

  await falla(
    () => consulta("update ligas set nombre='Robada'"),
    "permission denied",
  );
  await falla(
    () => consulta("update puntuacion_partidas set puntos=999"),
    "permission denied",
  );
  await falla(
    () => consulta("select crear_liga('Liga falsa','Temporada','Nico')"),
    "PLUS_REQUERIDO",
  );

  // Una sala asociada que todavía espera jugadores impide cerrar la temporada.
  await como(1);
  const salaPendiente = (
    await consulta("select to_jsonb(crear_sala('[]'::jsonb,$1)) sala", [
      creada.temporada_id,
    ])
  )[0].sala;
  await falla(
    () => consulta("select finalizar_temporada($1)", [creada.temporada_id]),
    "TEMPORADA_NO_FINALIZABLE",
  );

  // Cancelar Plus conserva todo y convierte la administración en solo lectura.
  await db.exec("reset role");
  await db.query("update accesos_plus set activo=false where user_id=$1", [uid(1)]);
  await como(1);
  assert.equal((await consulta("select mis_ligas() ligas"))[0].ligas.length, 1);
  await falla(
    () => consulta("select finalizar_temporada($1)", [creada.temporada_id]),
    "PLUS_REQUERIDO",
  );
  await falla(
    () => consulta("select crear_sala('[]'::jsonb,$1)", [creada.temporada_id]),
    "PLUS_REQUERIDO",
  );
  await falla(
    () => accion(salaPendiente.id, "iniciar"),
    "PLUS_REQUERIDO",
  );

  // Restaurar un acceso lifetime reactiva la administración y todo reaparece.
  await db.exec("reset role");
  await db.query(
    "update accesos_plus set activo=true,vence_en=null,verificado_en=now() where user_id=$1",
    [uid(1)],
  );
  await como(1);
  await falla(
    () => consulta("select finalizar_temporada($1)", [creada.temporada_id]),
    "TEMPORADA_NO_FINALIZABLE",
  );
  await db.exec("reset role");
  await db.query("delete from salas where id=$1", [salaPendiente.id]);
  await como(1);
  await consulta("select finalizar_temporada($1)", [creada.temporada_id]);
  const nuevaTemporada = (
    await consulta("select crear_temporada($1,'Temporada 2027') id", [
      creada.liga_id,
    ])
  )[0].id;
  assert.ok(nuevaTemporada);
  await db.exec("reset role");
  assert.equal(
    (await consulta("select count(*)::int n from puntuacion_partidas where temporada_id=$1", [creada.temporada_id]))[0].n,
    2,
  );

  // El owner puede retirar a un miembro, pero los resultados históricos quedan.
  await consulta("select quitar_miembro($1,$2)", [creada.liga_id, uid(2)]);
  await como(2);
  await falla(
    () => consulta("select detalle_liga($1)", [creada.liga_id]),
    "LIGA_NO_DISPONIBLE",
  );
  await db.exec("reset role");
  assert.equal(
    (await consulta("select count(*)::int n from puntuacion_partidas where temporada_id=$1", [creada.temporada_id]))[0].n,
    2,
  );

  const seguridad = (
    await consulta(`
      select
        has_table_privilege('authenticated','public.ligas','insert,update,delete') as escribe_ligas,
        has_table_privilege('authenticated','public.liga_temporadas','insert,update,delete') as escribe_temporadas,
        has_table_privilege('authenticated','public.liga_partidas','insert,update,delete') as escribe_partidas,
        has_table_privilege('authenticated','public.accesos_plus','select,insert,update,delete') as toca_plus,
        has_function_privilege('anon','public.crear_liga(text,text,text)','execute') as anon_crea_liga,
        has_function_privilege('authenticated','public.crear_liga(text,text,text)','execute') as auth_crea_liga,
        has_function_privilege('authenticated','private.tiene_plus(uuid)','execute') as auth_tiene_plus,
        has_function_privilege('authenticated','public.accion_mesa_sin_ligas(uuid,text,jsonb,text)','execute') as auth_accion_interna
    `)
  )[0];
  assert.deepEqual(seguridad, {
    escribe_ligas: false,
    escribe_temporadas: false,
    escribe_partidas: false,
    toca_plus: false,
      anon_crea_liga: false,
      auth_crea_liga: true,
      auth_tiene_plus: false,
      auth_accion_interna: false,
  });

  console.log(
    "OK: ligas Plus, temporadas, invitados Free, ranking, cancelación/restauración, idempotencia y RLS.",
  );
  await db.close();
})().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exitCode = 1;
});
