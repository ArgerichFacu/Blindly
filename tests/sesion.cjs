const fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript"),
  assert = require("node:assert/strict");
let id = "guest",
  anonymous = true,
  creates = 0,
  sessionError = null,
  calls = [],
  historial = 0,
  activas = [],
  plusActivo = false,
  functionError = null,
  deleted = 0;
const auth = {
  getSession: async () => ({
    data: { session: id ? { user: { id, is_anonymous: anonymous } } : null },
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
};
const sb = {
  auth,
  functions: {
    invoke: async (name, options) => {
      calls.push(["function", name, options]);
      if (functionError) return { error: functionError };
      deleted++;
      return { data: { ok: true }, error: null };
    },
  },
  rpc: async () => ({ data: { partidas: historial } }),
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
  s = await exportsAuth.solicitarCodigo("test@example.com", true);
  assert.equal(calls.at(-1)[1].options.shouldCreateUser, false);
  assert.equal((await exportsAuth.confirmarCodigo(s, "123456")).id, "restored");
  assert.equal(calls.at(-1)[1].type, "email");
  id = "changed";
  await assert.rejects(
    () => exportsAuth.confirmarCodigo(s, "123456"),
    /SESION_CAMBIO/,
  );
  id = "linked";
  anonymous = false;
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
