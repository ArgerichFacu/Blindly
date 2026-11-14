// Verifica el contraste WCAG 2.1 de los tokens de assets/brand/tokens.json.
// Texto ≥ 4,5:1 (AA normal) y controles/bordes de control/acento ≥ 3:1 (no textual).
// Uso: node scripts/brand/contraste.cjs [--md]   (--md imprime la tabla en Markdown)
const fs = require("node:fs");
const path = require("node:path");

const { temas, fichas } = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "assets", "brand", "tokens.json"), "utf8"));

function lum(hex) {
  const [r, g, b] = hex.replace("#", "").match(/../g).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const FONDOS = ["fondo", "superficie", "superficieElevada", "mesa"];
// [primer plano, mínimo, fondos donde se usa]
const REGLAS = [
  ["texto", 4.5, FONDOS],
  ["textoSecundario", 4.5, ["fondo", "superficie", "superficieElevada"]],
  ["acento", 3, ["fondo", "superficie", "superficieElevada"]],
  ["acentoMesa", 3, ["mesa"]],
  ["exito", 3, ["fondo", "superficie"]],
  ["error", 4.5, ["fondo", "superficie"]],
  ["bordeControl", 3, ["fondo", "superficie"]],
];

const md = process.argv.includes("--md");
let fallas = 0;
const filas = [];
for (const [id, t] of Object.entries(temas)) {
  for (const [token, minimo, fondos] of REGLAS) {
    for (const f of fondos) {
      const r = ratio(t[token], t[f]);
      const ok = r >= minimo;
      if (!ok) fallas++;
      filas.push([t.nombre, token, f, r, minimo, ok]);
    }
  }
  // Botón primario: texto de acción sobre la acción primaria.
  const r = ratio(t.textoAccion, t.accionPrimaria);
  if (r < 4.5) fallas++;
  filas.push([t.nombre, "textoAccion", "accionPrimaria", r, 4.5, r >= 4.5]);
}
// Fichas: valor escrito en tinta clara u oscura, la que más contraste dé (el diseño la elige igual).
for (const [ficha, color] of Object.entries(fichas)) {
  if (ficha.startsWith("$")) continue;
  const r = Math.max(ratio("#F2F0E8", color), ratio("#0E1512", color));
  if (r < 4.5) fallas++;
  filas.push(["Fichas", ficha, "mejor tinta", r, 4.5, r >= 4.5]);
}

if (md) {
  console.log("| Tema | Color | Sobre | Ratio | Mínimo | |\n|---|---|---|---|---|---|");
  for (const [tema, token, f, r, minimo, ok] of filas) console.log(`| ${tema} | ${token} | ${f} | ${r.toFixed(2)}:1 | ${minimo}:1 | ${ok ? "✓" : "✗"} |`);
} else {
  for (const [tema, token, f, r, minimo, ok] of filas) if (!ok) console.log(`FALLA ${tema}: ${token} sobre ${f} = ${r.toFixed(2)} (mínimo ${minimo})`);
  console.log(`${filas.length} combinaciones revisadas, ${fallas} fallas`);
}
process.exitCode = fallas ? 1 : 0;
