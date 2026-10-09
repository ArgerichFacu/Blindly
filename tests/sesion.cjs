const fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript"),
  assert = require("node:assert/strict");
let id = "guest",
  anonymous = true,
  emailActual = null,
  creates = 0,
  sessionError = null,
  calls = [],
  historial = 0,
  activas = [],
  plusActivo = false,
  ligas = [],
  mesas = [],
  socialError = null,
  loginId = null,
  loginError = null,
  claveAjena = false,
  cambiarDuranteConsulta = false,
  functionError = null,
  deleted = 0;
const auth = {
  getSession: async () => ({
    data: {
      session: id
        ? { user: { id, is_anonymous: anonymous, email: emailActual } }
        : null,
    },
    error: sessionError,
  }),
  signInAnonymously: async () => {
    creates++;
    await Promise.resolve();
    id = "guest";
    return { data: { user: { id, is_anonymous: true } } };
  },
  updateUser: async (d) => {
    calls.push(["update", d]);
    return { data: { user: { id } } };
  },
  signInWithOtp: async (d) => {
    calls.push(["otp", d]);
    return { data: {} };
  },
  signOut: async (options) => {
    calls.push(["signout", options]);
    id = null;
    return { error: null };
  },
  verifyOtp: async (d) => {
    calls.push(["verify", d]);
    return {
      data: {
        user: {
          id: d.type === "email_change" ? id : "restored",
          is_anonymous: false,
        },
        session: {},
      },
    };
  },
  refreshSession: async () => { throw new Error("Refresh token revoked by password update"); },
  signInWithPassword: async ({ email, password }) => {
    calls.push(["password", email, password]);
    if (loginError) return { data: { user: null }, error: loginError };
    const recuperado = email.split("@")[0];
    id = recuperado;
    anonymous = false;
    emailActual = email;
    return {
      data: { user: { id: loginId ?? id, is_anonymous: false, email } },
      error: null,
    };
  },
};
const sb = {
  auth,
  functions: {
    invoke: async (name, options) => {
      calls.push(["function", name, options]);
      if (functionError) return { error: functionError };
      if (name === "crear-recuperacion") {
        const usuario = id;
        anonymous = false;
        emailActual = `${usuario}@recovery.blindly.invalid`;
        return {
          data: {
            clave: `BLINDLY1:${claveAjena ? "otro" : usuario}:abcdefghijklmnopqrstuvwxyz123456`,
          },
          error: null,
        };
      }
      deleted++;
      return { data: { ok: true }, error: null };
    },
  },
  rpc: async (nombre) => {
    if (cambiarDuranteConsulta && nombre === "mi_identidad_tiene_datos")
      id = "nueva-sesion";
    assert.equal(nombre, "mi_identidad_tiene_datos");
    return {
      data:
        Array.isArray(ligas) && Array.isArray(mesas)
          ? historial > 0 || ligas.length > 0 || mesas.length > 0
          : null,
      error: socialError,
    };
  },
  from: () => ({
    select: () => ({
      eq: () => ({ in: () => ({ limit: async () => ({ data: activas }) }) }),
    }),
  }),
};
const exportsAuth = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/sesion.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  {
    exports: exportsAuth,
    require: (modulo) =>
      modulo.endsWith("/plus")
        ? { tienePlusActivo: async () => plusActivo }
        : { supabase: sb },
  },
);
(async () => {
  id = null;
  await Promise.all([
    exportsAuth.asegurarSesion(),
    exportsAuth.asegurarSesion(),
  ]);
  assert.equal(creates, 1);
  sessionError = new Error("offline");
  await assert.rejects(exportsAuth.asegurarSesion(), /offline/);
  assert.equal(creates, 1);
  sessionError = null;
  let s = await exportsAuth.solicitarCodigo("  TEST@example.com ", false);
  assert.equal(s.usuario, "guest");
  assert.equal(calls.at(-1)[0], "update");
  assert.equal(calls.at(-1)[1].email, "test@example.com");
  assert.equal((await exportsAuth.confirmarCodigo(s, "123456")).id, "guest");
  assert.equal(calls.at(-1)[1].type, "email_change");
  historial = 1;
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /PROTEGER_INVITADO/,
  );
  historial = 0;
  activas = [{}];
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /PROTEGER_INVITADO/,
  );
  activas = [];
  plusActivo = true;
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /PROTEGER_INVITADO/,
  );
  plusActivo = false;
  ligas = [{ id: "legacy" }];
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /PROTEGER_INVITADO/,
  );
  ligas = [];
  mesas = [{ id: "cancelled-plus" }];
  await assert.rejects(
    () =>
      exportsAuth.recuperarConClave(
        "BLINDLY1:11111111-1111-4111-8111-111111111111:abcdefghijklmnopqrstuvwxyz",
      ),
    /PROTEGER_INVITADO/,
  );
  mesas = [];
  socialError = new Error("offline-social");
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /offline-social/,
  );
  socialError = null;
  ligas = null;
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /SESION_REQUERIDA/,
  );
  ligas = [];
  cambiarDuranteConsulta = true;
  const escrituras = calls.length;
  await assert.rejects(
    () => exportsAuth.solicitarCodigo("test@example.com", true),
    /SESION_CAMBIO/,
  );
  assert.equal(
    calls.length,
    escrituras,
    "Cambio de sesión durante consultas no inicia otro login",
  );
  cambiarDuranteConsulta = false;
  id = "guest";
  s = await exportsAuth.solicitarCodigo("test@example.com", true);
  assert.equal(calls.at(-1)[1].options.shouldCreateUser, false);
  assert.equal((await exportsAuth.confirmarCodigo(s, "123456")).id, "restored");
  assert.equal(calls.at(-1)[1].type, "email");
  id = "changed";
  await assert.rejects(
    () => exportsAuth.confirmarCodigo(s, "123456"),
    /SESION_CAMBIO/,
  );
  id = "11111111-1111-4111-8111-111111111111";
  anonymous = true;
  emailActual = null;
  let claveMostrada;
  const protegida = await exportsAuth.crearClaveRecuperacion((clave) => {
    claveMostrada = clave;
    assert.equal(calls.at(-1)[0], "function", "Key delivered before login");
  });
  assert.equal(claveMostrada, protegida.clave);
  assert.match(protegida.clave, /^BLINDLY1:/);
  assert.equal(protegida.usuario.id, id);
  assert.equal(protegida.usuario.is_anonymous, false);
  assert.equal(exportsAuth.cuentaConClave(protegida.usuario), true);
  assert.equal(
    exportsAuth.cuentaConClave({
      ...protegida.usuario,
      email: "otro@recovery.blindly.invalid",
    }),
    false,
  );
  loginId = "sesion-distinta";
  await assert.rejects(exportsAuth.crearClaveRecuperacion(), /SESION_CAMBIO/);
  loginId = null;
  loginError = new Error("offline-login");
  claveMostrada = null;
  await assert.rejects(
    exportsAuth.crearClaveRecuperacion((clave) => { claveMostrada = clave; }),
    /offline-login/,
  );
  assert.ok(claveMostrada, "Created key remains available when new login fails");
  loginError = null;
  claveAjena = true;
  claveMostrada = null;
  const llamadasAntes = calls.length;
  await assert.rejects(exportsAuth.crearClaveRecuperacion((clave) => { claveMostrada = clave; }), /SESION_CAMBIO/);
  assert.equal(claveMostrada, null, "Foreign key not displayed");
  assert.equal(calls.length, llamadasAntes + 1, "Foreign key never starts login");
  claveAjena = false;
  id = "22222222-2222-4222-8222-222222222222";
  anonymous = true;
  emailActual = null;
  await assert.rejects(
    () => exportsAuth.recuperarConClave("incorrecta"),
    /CLAVE_INVALIDA/,
  );
  const recuperado = await exportsAuth.recuperarConClave(protegida.clave);
  assert.equal(recuperado.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(calls.at(-1)[0], "password");
  id = "linked";
  anonymous = false;
  emailActual = "test@example.com";
  await exportsAuth.eliminarCuenta();
  assert.equal(deleted, 1);
  assert.equal(calls.at(-2)[0], "function");
  assert.equal(calls.at(-2)[1], "eliminar-cuenta");
  assert.equal(calls.at(-2)[2].method, "POST");
  assert.equal(calls.at(-1)[0], "signout");
  assert.equal(calls.at(-1)[1].scope, "local");
  assert.equal(id, null);
  console.log(
    "OK: invitado único, recuperación segura, historial y compras protegidos, y eliminación local tras borrar la cuenta.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
