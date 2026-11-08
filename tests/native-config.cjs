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
  "com.google.android.gms.permission.AD_ID",
  "android.permission.ACCESS_ADSERVICES_AD_ID",
  "android.permission.ACCESS_ADSERVICES_ATTRIBUTION",
  "android.permission.ACCESS_ADSERVICES_TOPICS",
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
const meta = name => manifest.application?.[0]?.['meta-data']?.find(item => item.$?.['android:name'] === name)?.$?.['android:value'];
assert.equal(meta('com.google.android.gms.ads.APPLICATION_ID'), 'ca-app-pub-3940256099942544~3347511713');
assert.equal(meta('com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT'), 'true');
assert.equal(config._internal.modResults.ios.infoPlist.GADApplicationIdentifier, 'ca-app-pub-3940256099942544~1458002511');
assert.equal(config._internal.modResults.ios.infoPlist.GADDelayAppMeasurementInit, true);

console.log("Configuración nativa validada");
const properties = config._internal.modResults.android.gradleProperties;
const property = key => properties.find(p => p.type === 'property' && p.key === key)?.value;
assert.equal(property('android.enableMinifyInReleaseBuilds'), 'true');
assert.equal(property('android.enableShrinkResourcesInReleaseBuilds'), 'true');
assert.equal(property('android.r8.optimizedResourceShrinking'), 'true');
assert.notEqual(property('android.enableR8.fullMode'), 'false');
// Introspect omite mods de Gradle. Generar de verdad en una copia descartable
// verifica que el plugin sobreviva a prebuild sin tocar android/ del operador.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const tempRoot = fs.realpathSync(os.tmpdir());
const fixture = fs.mkdtempSync(path.join(tempRoot, 'blindly-native-'));
try {
  for (const name of ['app.json', 'app.config.ts', 'package.json']) fs.copyFileSync(name, path.join(fixture, name));
  for (const name of ['plugins', 'assets/images']) fs.cpSync(name, path.join(fixture, name), { recursive: true });
  fs.symlinkSync(path.resolve('node_modules'), path.join(fixture, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  const prebuild = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'prebuild', '--platform', 'android', '--no-install'], {
    cwd: fixture, encoding: 'utf8', env: { ...process.env, CI: '1', EXPO_NO_DOTENV: '1' },
  });
  assert.equal(prebuild.status, 0, prebuild.stderr);
  const gradle = fs.readFileSync(path.join(fixture, 'android/app/build.gradle'), 'utf8');
  assert.match(gradle, /getDefaultProguardFile\("proguard-android-optimize.txt"\)/);
  assert.doesNotMatch(gradle, /getDefaultProguardFile\("proguard-android.txt"\)/);
  assert.match(gradle, /minifyEnabled enableMinifyInReleaseBuilds/);
  assert.match(gradle, /shrinkResources enableShrinkResources.toBoolean\(\)/);
  const generated = fs.readFileSync(path.join(fixture, 'android/gradle.properties'), 'utf8');
  for (const key of ['android.enableMinifyInReleaseBuilds', 'android.enableShrinkResourcesInReleaseBuilds', 'android.r8.optimizedResourceShrinking']) assert.ok(generated.includes(key + '=true'));
} finally {
  const target = fs.realpathSync(fixture);
  assert.equal(path.dirname(target), tempRoot);
  assert.ok(path.basename(target).startsWith('blindly-native-'));
  // Unlink the junction explicitly; never traverse shared dependencies.
  if (fs.existsSync(path.join(target, 'node_modules'))) fs.unlinkSync(path.join(target, 'node_modules'));
  fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
}
console.log('Release Android generada: R8, optimize defaults, full mode y resource shrinking habilitados; sin keep global agregado.');

// App ID real por variable EAS; combinaciones inconsistentes no compilan.
const introspeccion = env => spawnSync(process.execPath, [require.resolve("expo/bin/cli"), "config", "--type", "introspect", "--json"],
  { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, ...env } });
const real = introspeccion({ ADMOB_ANDROID_APP_ID: "ca-app-pub-1234567890123456~1234567890", EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID: "ca-app-pub-1234567890123456/1234567890" });
assert.equal(real.status, 0, real.stderr);
const manifestReal = JSON.parse(real.stdout)._internal.modResults.android.manifest.manifest;
assert.equal(manifestReal.application[0]["meta-data"].find(i => i.$["android:name"] === "com.google.android.gms.ads.APPLICATION_ID").$["android:value"], "ca-app-pub-1234567890123456~1234567890");
for (const env of [
  { EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID: "ca-app-pub-1234567890123456/1234567890" },
  { ADMOB_ANDROID_APP_ID: "ca-app-pub-3940256099942544~3347511713" },
  { ADMOB_ANDROID_APP_ID: "ca-app-pub-1234567890123456~1234567890", EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID: "ca-app-pub-6543210987654321/1234567890" },
]) assert.notEqual(introspeccion(env).status, 0, JSON.stringify(env));
