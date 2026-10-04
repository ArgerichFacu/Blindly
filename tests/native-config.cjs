const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const result = spawnSync(
  process.execPath,
  [require.resolve("expo/bin/cli"), "config", "--type", "introspect", "--json"],
  { cwd: process.cwd(), encoding: "utf8" },
);

assert.equal(
  result.status,
  0,
  `Expo no pudo generar la configuración nativa:\n${result.error ?? result.stderr}`,
);

const config = JSON.parse(result.stdout);
const manifest = config._internal.modResults.android.manifest.manifest;
const permissions = (manifest["uses-permission"] ?? []).map(
  (permission) => permission.$?.["android:name"],
);
const mainActivity = manifest.application?.[0]?.activity?.find((activity) =>
  activity.$?.["android:name"]?.endsWith("MainActivity"),
);
const blockedPermissions = [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW",
];

assert.ok(
  permissions.includes("com.android.vending.BILLING"),
  "El manifiesto Android debe declarar el permiso de Google Play Billing",
);
for (const blockedPermission of blockedPermissions) {
  const declarations = (manifest["uses-permission"] ?? []).filter(
    (permission) => permission.$?.["android:name"] === blockedPermission,
  );
  assert.ok(
    declarations.length > 0 &&
      declarations.every(
        (permission) => permission.$?.["tools:node"] === "remove",
      ),
    `El manifiesto Android debe bloquear ${blockedPermission}`,
  );
}
assert.equal(
  mainActivity?.$?.["android:launchMode"],
  "singleTop",
  "RevenueCat requiere singleTop para no cancelar compras al volver de otra app",
);

console.log("Configuración nativa validada");
