const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const docs = path.resolve(__dirname, "../docs");
const pages = ["index.html", "privacy.html", "account-deletion.html", "terms.html"];

for (const page of pages) {
  const html = fs.readFileSync(path.join(docs, page), "utf8");
  assert.match(html, /<!doctype html>/i, `${page} debe ser HTML completo`);
  assert.match(html, /<meta name="viewport"/i, `${page} debe ser adaptable`);
  assert.match(html, /href="legal\.css"/i, `${page} debe usar la identidad visual`);
  assert.doesNotMatch(html, /<script\b/i, `${page} no debe ejecutar scripts`);
  assert.doesNotMatch(html, /<form\b/i, `${page} no debe recopilar datos`);

  for (const link of html.matchAll(/href="([^"]+)"/g)) {
    const href = link[1];
    if (/^(https?:|#|mailto:)/.test(href)) continue;
    assert.ok(
      fs.existsSync(path.resolve(docs, href)),
      `${page} enlaza un recurso inexistente: ${href}`,
    );
  }
}

const privacy = fs.readFileSync(path.join(docs, "privacy.html"), "utf8");
assert.match(privacy, /Supabase/);
assert.match(privacy, /RevenueCat/);
assert.match(privacy, /no incluye publicidad/i);
assert.match(privacy, /Eliminar mi cuenta/i);

const deletion = fs.readFileSync(
  path.join(docs, "account-deletion.html"),
  "utf8",
);
assert.match(deletion, /Opciones/);
assert.match(deletion, /Mi cuenta/);
assert.match(deletion, /Eliminar definitivamente/);
assert.match(deletion, /Qué se elimina/);

const terms = fs.readFileSync(path.join(docs, "terms.html"), "utf8");
assert.match(terms, /Español/);
assert.match(terms, /English/);
assert.match(terms, /Português/);
assert.match(terms, /No ofrece\s+apuestas con dinero real/i);

console.log("Páginas legales estáticas validadas");
