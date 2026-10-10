const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const exportsInicio = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/inicio.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: exportsInicio },
);
const { crearInicio, leerInicio, CLAVE_INICIO } = exportsInicio;
function almacenamiento() {
  const datos = new Map([["supabase-session", "identidad-existente"]]);
  let lecturas = 0,
    escrituras = 0,
    fallaLectura = false,
    fallaEscritura = false;
  return {
    datos,
    get lecturas() {
      return lecturas;
    },
    get escrituras() {
      return escrituras;
    },
    set fallaLectura(v) {
      fallaLectura = v;
    },
    set fallaEscritura(v) {
      fallaEscritura = v;
    },
    async getItem(key) {
      lecturas++;
      if (fallaLectura) throw Error("lectura");
      return datos.get(key) ?? null;
    },
    async setItem(key, value) {
      escrituras++;
      if (fallaEscritura) throw Error("escritura");
      datos.set(key, value);
    },
  };
}
const copia = (value) => JSON.parse(JSON.stringify(value));
async function main() {
  for (const dato of [
    null,
    "{",
    "null",
    "[]",
    '{"version":2}',
    JSON.stringify({
      version: 1,
      eleccion: "cuenta",
      fase: "bienvenida",
      paso: 0,
    }),
    JSON.stringify({
      version: 1,
      eleccion: "invitado",
      fase: "tutorial",
      paso: 8,
    }),
  ]) {
    assert.equal(leerInicio(dato).fase, "bienvenida");
  }
  const db = almacenamiento(),
    inicio = crearInicio(db);
  let avisos = 0;
  const retirar = inicio.subscribe(() => avisos++);
  const promesa = inicio.cargar();
  assert.equal(
    inicio.cargar(),
    promesa,
    "Una carga concurrente comparte lectura",
  );
  await promesa;
  assert.equal(db.lecturas, 1);
  assert.equal(inicio.getSnapshot().datos.fase, "bienvenida");
  assert.equal(await inicio.terminar(), true);
  assert.equal(
    inicio.getSnapshot().datos.fase,
    "bienvenida",
    "No se saltea la elección",
  );
  await inicio.elegir("invitado");
  assert.deepEqual(copia(inicio.getSnapshot().datos), {
    version: 1,
    eleccion: "invitado",
    fase: "tutorial",
    paso: 0,
  });
  const reinicio = crearInicio(db);
  await reinicio.cargar();
  assert.equal(reinicio.getSnapshot().datos.eleccion, "invitado");
  assert.equal(reinicio.getSnapshot().datos.paso, 0);
  await reinicio.avanzar();
  assert.equal(reinicio.getSnapshot().datos.paso, 1);
  await reinicio.retroceder();
  await reinicio.retroceder();
  assert.equal(reinicio.getSnapshot().datos.paso, 0);
  await reinicio.avanzar();
  await reinicio.avanzar();
  assert.equal(reinicio.getSnapshot().datos.paso, 2);
  await reinicio.avanzar();
  assert.equal(reinicio.getSnapshot().datos.paso, 3);
  assert.equal(reinicio.getSnapshot().datos.fase, "tutorial");
  await reinicio.avanzar();
  assert.equal(leerInicio(JSON.stringify({version:1, eleccion:"invitado", fase:"terminado", paso:2})).fase, "terminado", "Los tutoriales anteriores no se repiten");
  const terminado = crearInicio(db);
  await terminado.cargar();
  assert.equal(
    terminado.getSnapshot().datos.fase,
    "terminado",
    "No repite introducción después de reabrir",
  );
  await terminado.elegir("cuenta");
  await terminado.avanzar();
  await terminado.retroceder();
  assert.equal(terminado.getSnapshot().datos.fase, "terminado");
  assert.equal(
    terminado.getSnapshot().datos.eleccion,
    "invitado",
    "Una pantalla de cuenta tardía no reinicia el tutorial",
  );
  assert.equal(db.datos.get("supabase-session"), "identidad-existente");
  retirar();
  const antes = avisos;
  await inicio.avanzar();
  assert.equal(avisos, antes);

  const dbCuenta = almacenamiento(),
    cuenta = crearInicio(dbCuenta);
  await cuenta.elegir("cuenta");
  assert.equal(cuenta.getSnapshot().datos.eleccion, "cuenta");
  await cuenta.terminar();
  assert.equal(
    cuenta.getSnapshot().datos.fase,
    "terminado",
    "Omitir tutorial persiste el final",
  );

  const dbError = almacenamiento(),
    error = crearInicio(dbError);
  dbError.fallaLectura = true;
  assert.equal(await error.cargar(), false);
  assert.equal(error.getSnapshot().datos, null);
  assert.equal(error.getSnapshot().error, true);
  assert.equal(await error.elegir("invitado"), false);
  assert.equal(
    dbError.escrituras,
    0,
    "Una lectura fallida no pisa elecciones previas",
  );
  dbError.fallaLectura = false;
  await error.cargar();
  dbError.fallaEscritura = true;
  assert.equal(await error.elegir("invitado"), false);
  assert.equal(
    error.getSnapshot().datos.fase,
    "bienvenida",
    "No avanza sin confirmar persistencia",
  );
  assert.equal(error.getSnapshot().ocupado, false);
  dbError.fallaEscritura = false;
  await error.elegir("invitado");
  assert.equal(error.getSnapshot().error, false);

  let liberarLectura,
    liberarEscritura,
    llamadas = 0;
  const lento = crearInicio({
    getItem: () =>
      new Promise((res) => {
        liberarLectura = res;
      }),
    setItem: () => {
      llamadas++;
      return new Promise((res) => {
        liberarEscritura = res;
      });
    },
  });
  const cargando = lento.cargar(),
    eligiendo = lento.elegir("invitado");
  assert.equal(await lento.elegir("cuenta"), false);
  liberarLectura(
    JSON.stringify({
      version: 1,
      eleccion: "cuenta",
      fase: "tutorial",
      paso: 1,
    }),
  );
  await cargando;
  await Promise.resolve();
  liberarEscritura();
  await eligiendo;
  assert.equal(
    lento.getSnapshot().datos.eleccion,
    "cuenta",
    "Una acción durante hidratación respeta el progreso guardado",
  );
  const avance = lento.avanzar();
  await Promise.resolve();
  assert.equal(await lento.avanzar(), false);
  assert.equal(
    lento.getSnapshot().datos.paso,
    1,
    "No publica el próximo paso antes de guardarlo",
  );
  liberarEscritura();
  await avance;
  assert.equal(
    lento.getSnapshot().datos.paso,
    2,
    "Doble toque no avanza dos pasos",
  );
  assert.equal(llamadas, 2);
  assert.equal(CLAVE_INICIO, "blindly.inicio.v1");
  console.log(
    "OK: inicio persistido, restauración, tutorial, errores, identidad conservada y concurrencia.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
