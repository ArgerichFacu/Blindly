const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/lib/plus.ts"),
  "utf8",
);

assert.match(source, /clave\?\.startsWith\("test_"\)/);
assert.match(
  source,
  /PLUS_HABILITADO\s*&&\s*!!clave\s*&&\s*\(__DEV__\s*\|\|\s*!CLAVE_TEST_STORE\)/,
  "una clave Test Store debe quedar bloqueada en cualquier build release",
);

console.log("Configuración RevenueCat segura para builds release");
