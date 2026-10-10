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
const vm = require('node:vm'), ts = require('typescript');
function disponible(os, key, dev = false, ready = true) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {
    exports, __DEV__:dev, process:{env:{EXPO_PUBLIC_PLUS_READY:String(ready),
      EXPO_PUBLIC_REVENUECAT_ANDROID_KEY:key, EXPO_PUBLIC_REVENUECAT_IOS_KEY:key}},
    require:n=>n==='react-native'?{Platform:{OS:os}}:{}
  });
  return exports.PLUS_DISPONIBLE;
}
for (const os of ['android','ios']) {
  assert.equal(disponible(os,'test_fixture'),false,'Test Store nunca configura release');
  assert.equal(disponible(os,'test_fixture',true),true);
  assert.equal(disponible(os,'sk_secret'),false);
  assert.equal(disponible(os,undefined),false);
}
assert.equal(disponible('android','goog_fixture'),true);
assert.equal(disponible('android','appl_fixture'),false);
assert.equal(disponible('ios','appl_fixture'),true);
assert.equal(disponible('ios','goog_fixture'),false);
assert.equal(disponible('web','goog_fixture'),false);
assert.equal(disponible('android','goog_fixture',false,false),false);
assert.match(serverSource, /REVENUECAT_SECRET_KEY/);
assert.match(serverSource, /authClient\.auth\.getUser\(token\)/);
assert.match(serverSource, /entitlements\?\.blindly_plus/);
assert.match(serverSource, /respuesta\.status === 200 \|\| respuesta\.status === 201/);
assert.match(serverSource, /\.from\("accesos_plus"\)\.upsert/);
assert.doesNotMatch(serverSource, /EXPO_PUBLIC_/);
const {execFileSync} = require('node:child_process');
for (const secret of ['credentials.json','.credentials/google.json','revenuecat-key.json','blindly-service-account.json','google-play-credentials.json']) {
  assert.ok(execFileSync('git',['check-ignore',secret],{encoding:'utf8'}).trim(),`${secret} debe estar excluido`);
}
const eas = JSON.parse(fs.readFileSync(path.resolve(__dirname,'../eas.json'),'utf8'));
assert.equal(eas.build['play-testing'].android.buildType,'app-bundle');
assert.equal(eas.build['play-testing'].distribution,'store');
assert.equal(eas.build['play-testing'].environment,'preview');
assert.equal(eas.build.production.env?.EXPO_PUBLIC_PLUS_READY,undefined,'el perfil de pruebas no activa producción');

console.log("RevenueCat seguro en release y entitlement Plus verificado en servidor");
