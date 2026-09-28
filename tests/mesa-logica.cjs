const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const ts = require("typescript");
function cargar(nombre) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(
        path.join(__dirname, "../src/lib", nombre + ".ts"),
        "utf8",
      ),
      { compilerOptions: { module: ts.ModuleKind.CommonJS } },
    ).outputText,
    { exports },
  );
  return exports;
}
const {
  repartirFisicas,
  recomendarModo,
  adaptarNiveles,
  rolesMesa,
  entero,
  validarNiveles,
} = cargar("mesa");
for (let jugadores = 2; jugadores <= 10; jugadores++) {
  const denominaciones = [
    { valor: 25, cantidad: 103 },
    { valor: 100, cantidad: 81 },
    { valor: 500, cantidad: 17 },
  ];
  const resultado = repartirFisicas(denominaciones, jugadores);
  for (const d of resultado.reparto)
    assert.equal(d.porJugador * jugadores + d.reserva, d.cantidad);
  assert.equal(
    resultado.stack * jugadores +
      resultado.reparto.reduce((s, d) => s + d.reserva * d.valor, 0),
    denominaciones.reduce((s, d) => s + d.cantidad * d.valor, 0),
  );
}
assert.throws(() =>
  repartirFisicas(
    [
      { valor: 25, cantidad: 2 },
      { valor: 25, cantidad: 2 },
    ],
    2,
  ),
);
assert.throws(() => repartirFisicas([{ valor: 25, cantidad: 1 }], 2));
for (const invalido of ["-1", "1.5", "Infinity", "1e3", "", "NaN"])
  assert.throws(() => entero(invalido));
assert.equal(recomendarModo(29), "turbo");
assert.equal(recomendarModo(30), "regular");
assert.equal(recomendarModo(60), "deep");
const jugadores = ["a", "b", "c"].map((id) => ({ id, eliminado_en: null }));
assert.equal(rolesMesa(jugadores, ["a", "b", "c"], "c").a, "SB");
assert.equal(rolesMesa(jugadores.slice(0, 2), ["a", "b"], "a").a, "DR / BTN / SB");
assert.equal(rolesMesa(jugadores.slice(0, 2), ["a", "b"], "a").b, "BB");
assert.equal(
  rolesMesa(
    [
      { id: "a", eliminado_en: null },
      { id: "b", eliminado_en: "hoy" },
      { id: "c", eliminado_en: null },
    ],
    ["a", "b", "c"],
    "a",
  ).c,
  "BB",
);
const niveles = [{ smallBlind: 25, bigBlind: 50, minutos: 15 }];
assert.equal(
  adaptarNiveles(niveles, "regular", { tipo: "virtuales", stack: 10000 }, 4)[0]
    .bigBlind,
  100,
);
assert.equal(
  adaptarNiveles(niveles, "turbo", { tipo: "virtuales", stack: 4000 }, 4)[0]
    .bigBlind,
  100,
);
assert.equal(
  adaptarNiveles(
    niveles,
    "regular",
    { tipo: "fisicas", denominaciones: [{ valor: 100, cantidad: 40 }] },
    4,
  )[0].smallBlind,
  100,
);
assert.ok(validarNiveles(niveles));
assert.ok(
  !validarNiveles([{ smallBlind: 0, bigBlind: 0, minutos: 10, esBreak: true }]),
);
const { textos, traducir } = cargar("textos");
for (const [clave, idiomas] of Object.entries(textos)) {
  assert.ok(idiomas.every((t) => t.length > 0));
  const variables = clave.match(/\{\w+\}/g)?.sort() ?? [];
  for (const texto of idiomas)
    assert.deepEqual(texto.match(/\{\w+\}/g)?.sort() ?? [], variables);
}
assert.equal(traducir("en", "Mano {n}", { n: 2 }), "Hand 2");
console.log(
  "OK: reparto físico, conservación, límites, asientos, heads-up, ciegas adaptadas y traducciones.",
);
