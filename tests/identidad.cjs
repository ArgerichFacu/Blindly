const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
const identidad = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/identidad.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: identidad },
);
const { identidadUsuario, esMiJugador } = identidad;
const guest = { id: "uuid-1", is_anonymous: true, email: null };
assert.equal(identidadUsuario(guest).invitado, true);
assert.equal(identidadUsuario(guest).recuperable, false);
assert.equal(
  identidadUsuario({
    ...guest,
    is_anonymous: undefined,
    email: "pending@example.com",
  }).recuperable,
  false,
);
const key = {
  ...guest,
  is_anonymous: false,
  email: "uuid-1@recovery.blindly.invalid",
};
assert.equal(identidadUsuario(key).metodo, "clave");
assert.equal(identidadUsuario(key).id, guest.id, "Linking keeps UUID");
assert.equal(
  identidadUsuario({ ...key, email: "other@recovery.blindly.invalid" })
    .recuperable,
  false,
);
assert.equal(
  identidadUsuario({ ...key, email: "name@example.com" }).recuperable,
  false,
  "Unverified email is not recoverable",
);
assert.equal(
  identidadUsuario({
    ...key,
    email: "name@example.com",
    email_confirmed_at: "2026-10-08",
  }).metodo,
  "correo",
);
assert.equal(
  identidadUsuario({
    ...key,
    email: null,
    identities: [{ user_id: "uuid-1", provider: "google" }],
  }).metodo,
  "social",
);
assert.equal(
  identidadUsuario({
    ...key,
    email: null,
    identities: [{ user_id: "uuid-2", provider: "google" }],
  }).recuperable,
  false,
);
assert.equal(
  identidadUsuario({
    ...guest,
    user_metadata: { recovery_method: "blindly_key_v1", is_anonymous: false },
  }).recuperable,
  false,
  "Editable metadata does not confer persistent identity",
);
const sameName = [
  { nombre: "Facu", user_id: "uuid-1" },
  { nombre: "Facu", user_id: "uuid-2" },
  { nombre: "Facu", user_id: null },
];
assert.equal(sameName.filter((j) => esMiJugador(j, "uuid-2")).length, 1);
assert.equal(esMiJugador({ user_id: null }, null), false);
assert.equal(esMiJugador({ user_id: "" }, ""), false);
assert.equal(esMiJugador({ nombre: "Facu" }, "uuid-1"), false);
assert.equal(
  sameName.filter((j) => !esMiJugador(j, "uuid-2")).length,
  2,
  "Legacy rows stay in the table; never auto-claimed by name",
);
console.log(
  "Identity: guest, key, verified email, social, UUID continuity, duplicate names and legacy rows OK",
);
