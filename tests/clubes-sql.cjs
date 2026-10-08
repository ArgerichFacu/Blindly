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
  await falla("select detalle_liga($1) v", [club], "CUENTA_REQUERIDA");
  await falla("select mi_puntuacion()", [], "CUENTA_REQUERIDA");
  await falla("select mis_ligas()", [], "CUENTA_REQUERIDA");
  await falla("select ranking_liga($1)", [second], "CUENTA_REQUERIDA");
  assert.equal(
    (await q("select mi_identidad_tiene_datos() v"))[0].v,
    true,
    "Presencia legacy propia permite proteger recuperación sin revelar datos",
  );
  assert.equal(
    (await q("select count(*)::int n from ligas"))[0].n,
    0,
    "RLS no revela clubes a un invitado legacy",
  );
  await db.exec("reset role");
  await q(
    "insert into puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio,puesto,puntos,finalizada_en,temporada_id) values($1,$2,$3,2,1000,1,2,now(),$4)",
    [uid(777), uid(4), uid(778), second],
  );
  await como(4);
  const casual = (await q("select to_jsonb(crear_sala('[]'::jsonb)) s"))[0].s;
  await q("select unirse_mesa($1,'Legacy')", [casual.codigo]);
  assert.equal(
    (await q("select rango from rangos_mesa($1)", [casual.id]))[0].rango,
    null,
    "Invitado no aparece en el rango persistente de la mesa",
  );
  await como(1);
  assert.equal(
    (await q("select count(*)::int n from ranking_liga($1)", [second]))[0].n,
    0,
    "Legacy no protegido no figura en ranking de liga",
  );
  await db.exec("reset role");
  await q("update auth.users set is_anonymous=false where id=$1", [uid(4)]);
  await como(4);
  assert.equal(
    (await q("select detalle_liga($1) v", [club]))[0].v.liga.rol,
    "member",
    "Proteger el mismo UUID recupera el club legacy",
  );
  assert.equal(
    (await q("select mi_puntuacion() v"))[0].v.partidas,
    1,
    "Historial legacy se recupera sin borrar resultados",
  );
  assert.equal(
    (await q("select rango from rangos_mesa($1)", [casual.id]))[0].rango,
    1,
  );
  await db.exec("reset role");
  await q("update auth.users set is_anonymous=true where id=$1", [uid(4)]);
  await como(4);
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
  await falla("select obtener_invitacion_liga($1)", [club], "SOLO_ADMIN");
  await como(1);
  const invitation = (
    await q("select obtener_invitacion_liga($1) v", [club])
  )[0].v;
  assert.match(invitation.codigo, /^[A-F0-9]{20}$/);
  assert.equal(
    (await q("select obtener_invitacion_liga($1) v", [club]))[0].v.codigo,
    invitation.codigo,
    "Mostrar no renueva un código vigente",
  );
  await como(4);
  await falla(
    "select consultar_invitacion_liga($1)",
    [invitation.codigo],
    "CUENTA_REQUERIDA",
  );
  await falla(
    "select aceptar_invitacion_liga($1,'Guest')",
    [invitation.codigo],
    "CUENTA_REQUERIDA",
  );
  await como(3);
  await falla(
    "select aceptar_invitacion_liga($1,'Facu')",
    [invitation.codigo],
    "MIEMBRO_RETIRADO",
  );
  await db.exec("reset role");
  await q("insert into auth.users values($1,false)", [uid(5)]);
  await como(5);
  assert.equal(
    (await q("select mi_identidad_tiene_datos() v"))[0].v,
    false,
    "No devuelve presencia de datos ajenos",
  );
  await falla("select detalle_liga($1)", [club], "LIGA_NO_DISPONIBLE");
  const preview = (
    await q("select consultar_invitacion_liga($1) v", [
      invitation.codigo.toLowerCase(),
    ])
  )[0].v;
  assert.equal(preview.nombre, "Los Pibes");
  assert.equal(preview.ya_miembro, false);
  assert.ok(
    !("miembros" in preview) && !("ranking" in preview),
    "Vista previa no divulga personas o resultados",
  );
  await falla(
    "select aceptar_invitacion_liga($1,'')",
    [invitation.codigo],
    "DATOS_INVALIDOS",
  );
  assert.equal(
    (
      await q("select aceptar_invitacion_liga($1,'Facu') id", [
        invitation.codigo,
      ])
    )[0].id,
    club,
  );
  await q("select aceptar_invitacion_liga($1,'Otro nombre')", [
    invitation.codigo,
  ]);
  const joined = (await q("select detalle_liga($1) v", [club]))[0].v;
  assert.equal(joined.miembros.filter((m) => m.user_id === uid(5)).length, 1);
  assert.equal(joined.miembros.find((m) => m.user_id === uid(5)).rol, "member");
  assert.equal(
    joined.miembros.find((m) => m.user_id === uid(5)).nombre,
    "Facu",
    "Reintentar no cambia nombre o rol",
  );
  await falla("select obtener_invitacion_liga($1,true)", [club], "SOLO_ADMIN");
  await falla(
    "select consultar_invitacion_liga('garbage')",
    [],
    "INVITACION_INVALIDA",
  );
  await como(1);
  await q("select cambiar_rol_liga($1,$2,'admin')", [club, uid(2)]);
  await como(2);
  const renewed = (
    await q("select obtener_invitacion_liga($1,true) v", [club])
  )[0].v;
  assert.notEqual(renewed.codigo, invitation.codigo);
  await como(5);
  await falla(
    "select consultar_invitacion_liga($1)",
    [invitation.codigo],
    "INVITACION_INVALIDA",
  );
  assert.equal(
    (await q("select consultar_invitacion_liga($1) v", [renewed.codigo]))[0].v
      .ya_miembro,
    true,
  );
  await db.exec("reset role");
  await q(
    "update liga_invitaciones set vence_en=now()-interval '1 second' where liga_id=$1",
    [club],
  );
  await como(5);
  await falla(
    "select consultar_invitacion_liga($1)",
    [renewed.codigo],
    "INVITACION_INVALIDA",
  );
  await falla(
    "select aceptar_invitacion_liga($1,'Facu')",
    [renewed.codigo],
    "INVITACION_INVALIDA",
  );
  await falla("select * from liga_invitaciones", [], "permission denied");
  await como(1);
  const current = (await q("select obtener_invitacion_liga($1) v", [club]))[0]
    .v;
  await q("select actualizar_liga($1,'Los Pibes',true)", [club]);
  await como(5);
  await falla(
    "select consultar_invitacion_liga($1)",
    [current.codigo],
    "INVITACION_INVALIDA",
  );
  await como(1);
  await q("select actualizar_liga($1,'Los Pibes',false)", [club]);
  const sala = (
    await q("select to_jsonb(crear_sala('[]'::jsonb,$1)) s", [second])
  )[0].s;
  const jugadores = [];
  await como(3);
  await falla(
    "select unirse_mesa($1,'Retirado')",
    [sala.codigo],
    "MEMBRESIA_REQUERIDA",
  );
  await como(4);
  await falla(
    "select unirse_mesa($1,'Guest')",
    [sala.codigo],
    "CUENTA_REQUERIDA",
  );
  for (const n of [1, 2]) {
    await como(n);
    jugadores.push(
      (await q("select unirse_mesa($1,$2) j", [sala.codigo, `Facu ${n}`]))[0].j
        .jugadorId,
    );
  }
  await como(1);
  let solicitud = 0;
  const accion = (a, datos = {}) =>
    q("select accion_mesa($1,$2,$3::jsonb,$4)", [
      sala.id,
      a,
      JSON.stringify(datos),
      `invitaciones-${++solicitud}`,
    ]);
  await accion("ordenar", { orden: jugadores, dealer: jugadores[0] });
  await accion("configurar", {
    seccion: "fichas",
    valor: { tipo: "virtuales", stack: 1000 },
  });
  await accion("configurar", {
    seccion: "modo",
    valor: {
      id: "regular",
      niveles: [{ minutos: 20, smallBlind: 5, bigBlind: 10 }],
    },
  });
  await q("select quitar_miembro($1,$2)", [club, uid(2)]);
  await assert.rejects(accion("iniciar"), /MEMBRESIA_REQUERIDA/);
  assert.equal(
    (await q("select estado from salas where id=$1", [sala.id]))[0].estado,
    "esperando",
    "Un rechazo no comienza ni cobra ciegas",
  );
  await db.exec("reset role");
  await q(
    "update liga_miembros set activo=true,rol='member' where liga_id=$1 and user_id=$2",
    [club, uid(2)],
  );
  await como(1);
  await accion("iniciar");
  await db.exec("reset role");
  assert.equal(
    (
      await q(
        "select activo from liga_miembros where liga_id=$1 and user_id=$2",
        [club, uid(3)],
      )
    )[0].activo,
    false,
    "Iniciar no reactiva miembros retirados",
  );
  await como(3);
  await falla("select detalle_liga($1)", [club], "LIGA_NO_DISPONIBLE");
  await db.exec("reset role");
  const privileges = (
    await q(
      "select has_function_privilege('anon','public.cambiar_rol_liga(uuid,uuid,text)','execute') a, has_function_privilege('authenticated','private.exigir_cuenta()','execute') b, has_function_privilege('authenticated','private.detalle_liga_base_club(uuid,uuid)','execute') c",
    )
  )[0];
  assert.deepEqual(privileges, { a: false, b: false, c: false });
  const indices = await q(
    "select indexname from pg_indexes where schemaname='public' and indexname in ('salas_temporada_id_idx','mesas_habituales_temporada_id_idx')",
  );
  assert.equal(
    indices.length,
    2,
    "Claves foráneas de temporada cubiertas por índices",
  );
  const policy = (
    await q(
      "select qual from pg_policies where schemaname='public' and tablename='mesas_habituales' and policyname='owner ve sus mesas habituales'",
    )
  )[0].qual;
  assert.match(policy, /SELECT auth.uid/);
  for (const firma of [
    "public.obtener_invitacion_liga(uuid,boolean)",
    "public.consultar_invitacion_liga(text)",
    "public.aceptar_invitacion_liga(text,text)",
  ])
    assert.equal(
      (
        await q("select has_function_privilege('anon',$1,'execute') p", [firma])
      )[0].p,
      false,
    );
  // Dos torneos completos: la comparación quita TODOS los resultados del último.
  await db.exec("reset role");
  async function torneo(numero, participantes, fecha) {
    await q("insert into liga_partidas(sala_id,temporada_id,codigo_sala,finalizada_en) values($1,$2,$3,$4)", [uid(numero),second,`T${numero}X`,fecha]);
    for (const [n,puesto,puntos] of participantes)
      await q("insert into puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio,puesto,puntos,finalizada_en,temporada_id) values($1,$2,$3,$4,1000,$5,$6,$7,$8)", [uid(numero),uid(n),uid(numero+n+20),participantes.length,puesto,puntos,fecha,second]);
  }
  await torneo(900,[[1,1,2],[2,2,1]],"2026-10-01T12:00:00Z");
  await como(1);
  assert.deepEqual((await q("select detalle_liga($1,$2) v",[club,second]))[0].v.movimientos,{},"Primera partida: sin cambios inventados");
  await db.exec("reset role");
  await torneo(901,[[2,1,4],[5,2,2],[1,3,1]],"2026-10-02T12:00:00Z");
  await como(1);
  const clasificacion=(await q("select detalle_liga($1,$2) v",[club,second]))[0].v;
  assert.deepEqual(clasificacion.ranking.map(f=>[f.user_id,Number(f.posicion),Number(f.puntos)]),[[uid(2),1,5],[uid(1),2,3],[uid(5),3,2]]);
  assert.deepEqual(clasificacion.movimientos,{[uid(1)]:-1,[uid(2)]:1});
  assert.equal(clasificacion.movimientos[uid(5)],undefined,"Nuevo participante: no se inventa posición previa");
  await db.exec("reset role");
  await q("insert into liga_temporadas(id,liga_id,nombre,estado) values($1,$2,'Empate','finalizada')",[uid(903),club]);
  await q("update liga_miembros set nombre='Facu' where liga_id=$1 and user_id in ($2,$3)",[club,uid(1),uid(2)]);
  for(const n of [1,2]) await q("insert into puntuacion_partidas(sala_id,user_id,jugador_id,jugadores,stack_inicio,puesto,puntos,finalizada_en,temporada_id) values($1,$2,$3,2,1000,1,1.5,now(),$4)",[uid(902),uid(n),uid(920+n),uid(903)]);
  await como(1);
  const empate=(await q("select detalle_liga($1,$2) v",[club,uid(903)]))[0].v;
  assert.equal(empate.temporada.estado,"finalizada");
  assert.deepEqual(empate.ranking.map(f=>[f.user_id,Number(f.posicion)]),[[uid(1),1],[uid(2),2]],"Empate total: UUID estable, un solo puesto 1");
  await assert.rejects(q("select * from private.ranking_liga_sin_partida($1,$2)",[second,uid(901)]),/permission denied/);
  await db.exec("reset role");
  assert.equal((await q("select count(*)::int n from pg_publication_tables where pubname='supabase_realtime' and tablename in ('liga_partidas','liga_temporadas')"))[0].n,2);
  // Completar fixtures pendientes permite probar el cierre real de la RPC.
  await q("update salas set estado='finalizada' where temporada_id=$1",[second]);
  await q("update liga_partidas set finalizada_en=now() where temporada_id=$1 and finalizada_en is null",[second]);
  await como(1);
  await q("select finalizar_temporada($1)",[second]);
  const historica=(await q("select detalle_liga($1,$2) v",[club,second]))[0].v;
  assert.equal(historica.temporada.estado,'finalizada');
  assert.equal(historica.ranking[0].user_id,uid(2));
  const siguiente=(await q("select crear_temporada($1,'2028') id",[club]))[0].id;
  assert.equal((await q("select detalle_liga($1,$2) v",[club,siguiente]))[0].v.ranking.length,0,'Nueva temporada empieza desde cero');
  assert.equal((await q("select detalle_liga($1,$2) v",[club,second]))[0].v.ranking.length,3,'Nueva temporada conserva resultados históricos');
  console.log(
    "Clubes: Free, cuenta obligatoria para administrar, legacy, roles, revocación, temporadas, datos y RPC/RLS OK",
  );
  await db.close();
})().catch(async (e) => {
  console.error(e);
  await db.close();
  process.exitCode = 1;
});
