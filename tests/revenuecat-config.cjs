const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/lib/plus.ts"),
  "utf8",
);
const serverSource = fs.readFileSync(
  path.resolve(__dirname, "../supabase/functions/sincronizar-plus/index.ts"),
  "utf8",
);

assert.match(source, /clave\?\.startsWith\("test_"\)/);
assert.match(
  source,
  /PLUS_HABILITADO\s*&&\s*!!clave\s*&&\s*\(__DEV__\s*\|\|\s*!CLAVE_TEST_STORE\)/,
  "una clave Test Store debe quedar bloqueada en cualquier build release",
);
assert.match(serverSource, /REVENUECAT_SECRET_KEY/);
assert.match(serverSource, /authClient\.auth\.getUser\(token\)/);
assert.match(serverSource, /entitlements\?\.blindly_plus/);
assert.match(serverSource, /respuesta\.status === 200 \|\| respuesta\.status === 201/);
assert.match(serverSource, /\.from\("accesos_plus"\)\.upsert/);
assert.doesNotMatch(serverSource, /EXPO_PUBLIC_/);

console.log("RevenueCat seguro en release y entitlement Plus verificado en servidor");
