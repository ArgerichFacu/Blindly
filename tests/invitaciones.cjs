const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
const datos = new Map(),
  exportsModulo = {};
const codigo = "0123456789ABCDEF0123";
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/invitaciones.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  {
    exports: exportsModulo,
    URL,
    require: () => ({
      __esModule: true,
      default: {
        getItem: async (k) => datos.get(k) ?? null,
        setItem: async (k, v) => datos.set(k, v),
        removeItem: async (k) => datos.delete(k),
      },
    }),
  },
);
(async () => {
  const {
    codigoInvitacion,
    guardarInvitacion,
    invitacionPendiente,
    borrarInvitacion,
  } = exportsModulo;
  assert.equal(codigoInvitacion(` ${codigo.toLowerCase()} `), codigo);
  for (const enlace of [
    `blindly://liga-unirse?codigo=${codigo}`,
    `https://blindly.example/liga-unirse?codigo=${codigo}`,
    `exp://192.168.1.1:8081/--/liga-unirse?codigo=${codigo}`,
  ])
    assert.equal(codigoInvitacion(enlace), codigo);
  for (const invalido of [
    "abc",
    "BLINDLY:ABCDE",
    `blindly://cuenta?codigo=${codigo}`,
    `https://example.com/?codigo=${codigo}`,
    `javascript:alert(1)?codigo=${codigo}`,
    `blindly://liga-unirse?codigo=${codigo}EXTRA`,
  ])
    assert.equal(codigoInvitacion(invalido), null);
  assert.equal(await invitacionPendiente(), null);
  await assert.rejects(guardarInvitacion("INVALIDO"), /INVITACION_INVALIDA/);
  await guardarInvitacion(codigo);
  assert.equal(await invitacionPendiente(), codigo);
  await borrarInvitacion("FFFFFFFFFFFFFFFFFFFF");
  assert.equal(
    await invitacionPendiente(),
    codigo,
    "No elimina una invitación nueva al cerrar otra",
  );
  await borrarInvitacion(codigo);
  assert.equal(await invitacionPendiente(), null);
  console.log(
    "Invitaciones: código, deep link nativo/web/Expo Go, rutas inválidas y persistencia tras recuperación OK",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
