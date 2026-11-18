// Formato de números propio (no depende de Intl/Hermes): 4.975 en es-AR, 4,975 en inglés.
const assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
const m = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/lib/numeros.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: m });
const casos = [
  [4975, "es", 0, "4.975"], [4975, "pt", 0, "4.975"], [4975, "en", 0, "4,975"],
  [10000, "es", 0, "10.000"], [1234567, "es", 0, "1.234.567"], [999, "es", 0, "999"], [0, "es", 0, "0"],
  [-2500, "es", 0, "-2.500"], [1.5, "es", 2, "1,5"], [1.5, "en", 2, "1.5"], [12.345, "es", 2, "12,35"],
  [3, "es", 3, "3"], [0.25, "es", 2, "0,25"], [NaN, "es", 0, "—"],
];
for (const [n, idioma, dec, esperado] of casos) assert.equal(m.formatoNumero(n, idioma, dec), esperado, `${n} ${idioma}`);
assert.equal(m.formatoFicha(25, "es"), "25");
assert.equal(m.formatoFicha(1000, "es"), "1K");
assert.equal(m.formatoFicha(2500, "es"), "2,5K");
assert.equal(m.formatoFicha(2500, "en"), "2.5K");
// La app no vuelve a usar toLocaleString para números (sí para fechas).
const fuentes = require("node:child_process").execSync("git ls-files src", { encoding: "utf8" }).trim().split("\n").filter((f) => /\.(ts|tsx)$/.test(f));
const usos = fuentes.flatMap((f) => fs.readFileSync(f, "utf8").split("\n").map((l, i) => [f, i + 1, l])).filter(([, , l]) => /toLocaleString\(/.test(l) && !/new Date\(/.test(l));
assert.deepEqual(usos.map(([f, i]) => `${f}:${i}`), [], "Números con toLocaleString");
console.log("Números: separadores es/pt/en, decimales, negativos y fichas OK; sin toLocaleString para números");
