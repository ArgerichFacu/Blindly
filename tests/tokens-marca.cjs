// Los tokens de la app (src/lib/temas.ts) deben coincidir con los de la marca (assets/brand/tokens.json),
// que son los verificados por contraste. Además, ningún componente define colores propios.
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript");
const temas = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/lib/temas.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: temas });
const marca = JSON.parse(fs.readFileSync("assets/brand/tokens.json", "utf8"));

assert.equal(temas.TEMAS.map((t) => t.id).join(), Object.keys(marca.temas).join(), "Mismos temas y mismo orden");
for (const t of temas.TEMAS) {
  const m = marca.temas[t.id];
  for (const [k, v] of Object.entries(m)) if (k !== "nombre" && k !== "plus") assert.equal(t[k], v, `${t.id}.${k}`);
  assert.equal(!!t.plus, m.plus, `${t.id}.plus`);
  assert.equal(t.nombre, m.nombre);
}
for (const [k, v] of Object.entries(marca.fichas)) if (!k.startsWith("$")) assert.equal(temas.FICHAS[k], v, `ficha ${k}`);
for (const [k, v] of Object.entries(marca.naipe)) if (!k.startsWith("$")) assert.equal(temas.NAIPE[k], v, `naipe ${k}`);
for (const [k, v] of Object.entries(marca.rol)) if (!k.startsWith("$")) assert.deepEqual({ ...temas.COLORES_ROL[k] }, v, `rol ${k}`);
for (const [k, v] of Object.entries(marca.club)) if (!k.startsWith("$")) assert.equal(temas.COLORES_CLUB[k], v, `club ${k}`);
assert.equal(temas.TEMA_DEFECTO.id, "verde");
assert.equal(temas.TEMAS.filter((t) => !t.plus).map((t) => t.id).join(), "verde", "Sólo el verde es gratis");

// Colores literales: sólo temas.ts puede tenerlos (y los SVG de marca, que no son código).
const permitidos = new Set(["src/lib/temas.ts"]);
const hexRe = /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b|#[0-9a-fA-F]{3}\b/g;
const fallas = [];
(function recorrer(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f), rel = p.split(path.sep).join("/");
    if (fs.statSync(p).isDirectory()) recorrer(p);
    else if (/\.(ts|tsx)$/.test(f) && !permitidos.has(rel)) {
      const s = fs.readFileSync(p, "utf8");
      const hits = (s.match(hexRe) || []).length + (s.match(/rgba?\(/g) || []).length;
      if (hits) fallas.push(`${rel}: ${hits}`);
    }
  }
})("src");
assert.deepEqual(fallas, [], "Colores fuera de src/lib/temas.ts:\n" + fallas.join("\n"));
console.log("Tokens de marca: temas, fichas y cero colores sueltos OK");
