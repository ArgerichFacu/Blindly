const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
const output = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/poker.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: output },
);
const {
  evaluarCartas: evaluar,
  evaluarHoldem,
  compararManos,
  idCarta,
  valorCarta,
} = output;
function cartas(texto) {
  return texto
    .split(" ")
    .map((c) => ({
      valor:
        { A: 14, K: 13, Q: 12, J: 11, T: 10 }[c.slice(0, -1)] ??
        Number(c.slice(0, -1)),
      palo: c.slice(-1),
    }));
}
const ejemplos = [
  ["A♠ J♥ 8♦ 5♣ 2♠", "Carta alta", [14, 11, 8, 5, 2]],
  ["T♠ T♥ 8♦ 5♣ 2♠", "Pareja", [10, 8, 5, 2]],
  ["J♠ J♥ 7♦ 7♣ 2♠", "Doble pareja", [11, 7, 2]],
  ["Q♠ Q♥ Q♦ 8♣ 3♠", "Trío", [12, 8, 3]],
  ["5♠ 6♥ 7♦ 8♣ 9♠", "Escalera", [9]],
  ["A♦ J♦ 8♦ 5♦ 2♦", "Color", [14, 11, 8, 5, 2]],
  ["K♠ K♥ K♦ 9♣ 9♥", "Full house", [13, 9]],
  ["A♠ A♥ A♦ A♣ K♠", "Poker", [14, 13]],
  ["5♥ 6♥ 7♥ 8♥ 9♥", "Escalera de color", [9]],
  ["T♠ J♠ Q♠ K♠ A♠", "Escalera real", [14]],
];
let anterior;
for (const [entrada, nombre, desempate] of ejemplos) {
  const mano = evaluar(cartas(entrada));
  assert.equal(mano.nombre, nombre);
  assert.deepEqual(Array.from(mano.desempate), desempate);
  assert.equal(mano.cartas.length, 5);
  if (anterior) assert.equal(compararManos(mano, anterior), 1);
  anterior = mano;
}
const real = evaluarHoldem(cartas("A♠ K♠"), cartas("Q♠ J♠ T♠ 4♥ 2♦"));
assert.equal(real.nombre, "Escalera real");
assert.deepEqual(
  new Set(real.cartas.map(idCarta)),
  new Set(cartas("A♠ K♠ Q♠ J♠ T♠").map(idCarta)),
);
assert.equal(evaluar(cartas("A♠ 2♥ 3♦ 4♣ 5♠ K♦ Q♥")).desempate[0], 5);
assert.equal(
  evaluar(cartas("A♠ 2♠ 3♠ 4♠ 5♠ K♦ Q♥")).nombre,
  "Escalera de color",
);
assert.equal(evaluar(cartas("A♠ 2♥ 3♦ 4♣ 5♠ 6♦ 7♥")).desempate[0], 7);
assert.equal(
  evaluar(cartas("A♠ K♥ Q♦ J♣ 2♠ 3♦ 4♥")).nombre,
  "Carta alta",
  "El as no conecta K-Q-J-2",
);
assert.deepEqual(
  Array.from(evaluar(cartas("A♠ A♥ A♦ K♣ K♥ K♦ Q♠")).desempate),
  [14, 13],
  "Dos tríos: trío mayor y pareja siguiente",
);
assert.deepEqual(
  Array.from(evaluar(cartas("A♠ A♥ K♦ K♣ Q♥ Q♦ 2♠")).desempate),
  [14, 13, 12],
  "Tres parejas: las dos mayores y kicker",
);
assert.deepEqual(
  Array.from(evaluar(cartas("A♠ K♠ J♠ 9♠ 6♠ 4♠ 2♦")).desempate),
  [14, 13, 11, 9, 6],
);
assert.equal(
  evaluar(cartas("A♠ J♠ 8♠ 6♠ 4♠ 5♥ 7♦")).nombre,
  "Color",
  "Color y escalera separados no son escalera de color",
);
const tablero = cartas("T♠ J♠ Q♠ K♠ A♠");
assert.equal(
  compararManos(
    evaluarHoldem(cartas("2♦ 3♥"), tablero),
    evaluarHoldem(cartas("8♦ 9♥"), tablero),
  ),
  0,
  "Se pueden usar cero cartas propias",
);
const unaPropia = evaluarHoldem(
  cartas("A♠ 2♥"),
  cartas("A♦ K♣ Q♣ J♥ 3♥"),
);
assert.ok(unaPropia.cartas.some((c) => idCarta(c) === "14♠"));
assert.ok(!unaPropia.cartas.some((c) => idCarta(c) === "2♥"));
for (const [a, b] of [
  ["A♠ A♥ K♦ Q♣ 9♠", "A♦ A♣ K♥ Q♦ 8♠"],
  ["K♠ K♥ K♦ Q♣ 9♠", "K♦ K♣ K♥ Q♦ 8♠"],
  ["A♠ A♥ K♦ K♣ Q♠", "A♦ A♣ K♥ K♠ J♠"],
  ["A♠ Q♠ 9♠ 8♠ 6♠", "A♥ Q♥ 9♥ 8♥ 5♥"],
  ["T♠ T♥ T♦ T♣ A♠", "T♠ T♥ T♦ T♣ K♠"],
])
  assert.equal(
    compararManos(evaluar(cartas(a)), evaluar(cartas(b))),
    1,
    "Los kickers desempatan",
  );
assert.equal(
  compararManos(
    evaluar(cartas("A♠ K♠ J♠ 8♠ 2♠")),
    evaluar(cartas("A♥ K♥ J♥ 8♥ 2♥")),
  ),
  0,
  "Los palos no tienen jerarquía",
);
const parcial = evaluarHoldem(cartas("A♠ A♥"), []);
assert.equal(parcial.nombre, "Pareja");
assert.equal(parcial.completa, false);
assert.throws(() => compararManos(parcial, real), /MANO_INCOMPLETA/);
for (const entrada of [
  "A♠",
  "A♠ A♠",
  "1♠ 2♦",
  "15♠ 2♥",
  "A? 2♥",
  "A♠ K♥ Q♦ J♣ T♠ 9♥ 8♦ 7♣",
])
  assert.throws(() => evaluar(cartas(entrada)), /INVALID/);
assert.throws(() => evaluarHoldem(cartas("A♠"), []), /INVALID/);
assert.throws(
  () => evaluarHoldem(cartas("A♠ K♥"), cartas("Q♦ J♣ T♠ 9♥ 8♦ 7♣")),
  /INVALID/,
);
let semilla = 701;
const azar = () => {
  semilla = (semilla * 1664525 + 1013904223) >>> 0;
  return semilla / 4294967296;
};
const mazo = ["♠", "♥", "♦", "♣"].flatMap((palo) =>
  Array.from({ length: 13 }, (_, n) => ({ valor: n + 2, palo })),
);
for (let n = 0; n < 200; n++) {
  const pool = [...mazo],
    entrada = Array.from(
      { length: 7 },
      () => pool.splice(Math.floor(azar() * pool.length), 1)[0],
    );
  const antes = JSON.stringify(entrada),
    mano = evaluar(entrada),
    inversa = evaluar([...entrada].reverse());
  assert.equal(compararManos(mano, inversa), 0);
  assert.deepEqual(
    new Set(mano.cartas.map(idCarta)),
    new Set(inversa.cartas.map(idCarta)),
    "Selección estable en empates equivalentes",
  );
  assert.equal(JSON.stringify(entrada), antes, "No muta cartas de entrada");
  assert.equal(mano.cartas.length, 5);
  assert.equal(new Set(mano.cartas.map(idCarta)).size, 5);
  assert.ok(
    mano.cartas.every((c) => entrada.some((e) => idCarta(e) === idCarta(c))),
  );
  assert.equal(
    compararManos(mano, evaluar(mano.cartas)),
    0,
    "Las cinco seleccionadas reproducen el resultado",
  );
}
assert.equal(valorCarta(14), "A");
assert.equal(valorCarta(10), "10");
console.log(
  "OK: diez manos, mejores cinco, kickers, as bajo, board compartido, parciales, duplicados y 200 propiedades reproducibles.",
);
