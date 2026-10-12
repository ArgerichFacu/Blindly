const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
function load(file, deps = {}, env = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText,
    { exports, process: { env }, require: id => { assert.ok(id in deps, id); return deps[id]; }, setTimeout: () => { throw Error('No inicia compras'); }, clearTimeout() {} });
  return exports;
}
const base = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
const config = env => load('app.config.ts', {}, env).default({ config: base });
assert.equal(config({}).android.package, 'com.blindly.studio');
assert.equal(config({}).extra.plusDemo, false);
const demo = config({ BLINDLY_BUILD_VARIANT: 'plus-demo' });
assert.equal(demo.android.package, 'com.blindly.app.plusdemo');
assert.equal(demo.name, 'Blindly Plus Demo');
assert.equal(demo.scheme, 'blindly-plus-demo');
assert.equal(demo.extra.eas.projectId, base.extra.eas.projectId);
assert.equal(base.android.package, 'com.blindly.studio', 'No muta la configuración normal');
for (const env of [{ EXPO_PUBLIC_PLUS_READY: 'true' }, { EAS_BUILD_PROFILE: 'production' }, { EAS_BUILD_PROFILE: 'play-testing' }]) {
  assert.throws(() => config({ BLINDLY_BUILD_VARIANT: 'plus-demo', ...env }), /Plus Demo/);
}
function enabled(os, expoConfig) {
  return load('src/lib/plusDemo.ts', { 'expo-constants': { __esModule: true, default: { expoConfig } }, 'react-native': { Platform: { OS: os } } }).PLUS_DEMO;
}
assert.equal(enabled('android', demo), true);
for (const metadata of [null, base, { ...demo, android: base.android }, { ...demo, extra: { plusDemo: 'true' } }]) assert.equal(enabled('android', metadata), false);
for (const os of ['ios', 'web']) assert.equal(enabled(os, demo), false);
let calls = 0;
const forbidden = () => { calls++; throw Error('No llama a SDK ni servidor'); };
const provider = load('src/lib/PlusContext.tsx', {
  react: { createContext: () => ({ Provider: 'Provider' }), useContext() {}, useState: v => [v, () => {}], useRef: v => ({ current: v }), useEffect: f => f() },
  'react/jsx-runtime': { jsx: (_, props) => props },
  'react-native': { AppState: { addEventListener: forbidden }, Linking: { openURL: forbidden } },
  'react-native-purchases': { __esModule: true, default: new Proxy({}, { get: () => forbidden }) },
  'react-native-purchases-ui': { __esModule: true, default: {}, PAYWALL_RESULT: {} },
  './plusDemo': { PLUS_DEMO: true }, './plus': { PLUS_DISPONIBLE: true, tieneEntitlementPlus: () => false },
  './plusServidor': { sincronizarPlusServidor: forbidden }, './sesion': { asegurarSesion: forbidden },
  './supabase': { supabase: { auth: { onAuthStateChange: forbidden } } },
});
(async () => {
  const state = provider.PlusProvider({ children: null }).value;
  assert.equal(state.demostracion, true); assert.equal(state.activo, true);
  assert.equal(state.cargando, false); assert.equal(state.disponible, false);
  await assert.rejects(state.comprar(), /PLUS_NO_CONFIGURADO/);
  await assert.rejects(state.restaurar(), /PLUS_NO_CONFIGURADO/);
  await state.refrescar();
  await assert.rejects(state.gestionar(), /PLUS_SIN_GESTION/);
  assert.equal(calls, 0, 'No crea compras, claims ni accesos Plus en el servidor');
  const cap = load('src/lib/capacidadesPlus.ts').capacidadesPlus(state);
  const catalog = load('src/lib/botonera.ts');
  assert.equal(catalog.sonidosDisponibles(catalog.BOTONERA_INICIAL, cap.botonera).length, 12);
  console.log('Plus Demo: paquete separado, perfiles de tienda bloqueados, 12 sonidos oficiales, sin SDK/compras ni grants de servidor OK');
})().catch(e => { console.error(e); process.exitCode = 1; });
