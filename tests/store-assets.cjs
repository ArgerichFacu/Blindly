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

const iconoNativo = leerPng(
  path.join("assets", "images", "blindly-app-icon.png"),
);
assert.deepEqual(
  { ancho: iconoNativo.ancho, alto: iconoNativo.alto },
  { ancho: 1024, alto: 1024 },
);
assert.equal(iconoNativo.tipoColor, 2, "El ícono nativo debe ser RGB sin alfa");

for (const nombre of [
  "blindly-icon-foreground.png",
  "blindly-icon-monochrome.png",
  "blindly-icon-foreground-v2.png",
  "blindly-icon-monochrome-v2.png",
]) {
  const imagen = leerPng(path.join("assets", "images", nombre));
  assert.equal(imagen.tipoColor, 6, `${nombre} debe conservar transparencia RGBA`);
}

console.log("Recursos nativos y de Google Play validados");
