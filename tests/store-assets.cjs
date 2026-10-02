const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function leerPng(ruta) {
  const contenido = fs.readFileSync(ruta);
  assert.equal(
    contenido.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    `${ruta} debe ser un PNG válido`,
  );
  assert.equal(contenido.subarray(12, 16).toString("ascii"), "IHDR");
  return {
    ancho: contenido.readUInt32BE(16),
    alto: contenido.readUInt32BE(20),
    profundidad: contenido[24],
    tipoColor: contenido[25],
    bytes: contenido.length,
  };
}

const icono = leerPng(path.join("assets", "store", "play-icon.png"));
assert.deepEqual(
  { ancho: icono.ancho, alto: icono.alto },
  { ancho: 512, alto: 512 },
);
assert.equal(icono.profundidad, 8);
assert.equal(icono.tipoColor, 6, "El ícono debe ser RGBA de 32 bits");
assert.ok(icono.bytes <= 1024 * 1024, "El ícono debe pesar como máximo 1 MB");

const grafico = leerPng(
  path.join("assets", "store", "play-feature-graphic.png"),
);
assert.deepEqual(
  { ancho: grafico.ancho, alto: grafico.alto },
  { ancho: 1024, alto: 500 },
);
assert.equal(grafico.profundidad, 8);
assert.equal(grafico.tipoColor, 2, "El gráfico debe ser RGB de 24 bits sin alfa");

console.log("Recursos de Google Play validados");
