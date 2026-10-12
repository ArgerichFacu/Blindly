const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
function check(os) {
  let ready = false, hidden = 0, prevented = 0;
  const exports = {}, jsx = (type, props) => ({ type, props });
  const deps = {
    react: { useState: () => [ready, value => { ready = value; }], useCallback: f => f, useEffect: f => f() },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { Platform: { OS: os }, View: 'View' },
    'expo-router': { Stack: 'Stack' },
    'expo-splash-screen': { preventAutoHideAsync: () => { prevented++; return Promise.resolve(); }, hideAsync: () => { hidden++; return Promise.resolve(); } },
  };
  for (const [file, name] of [['../components/SesionNativa','SesionNativa'],['../lib/TemaContext','TemaProvider'],['../lib/Preferencias','PreferenciasProvider'],['../components/PantallaCarga','PantallaCarga'],['../lib/PlusContext','PlusProvider'],['../lib/InicioContext','InicioProvider'],['../components/AvisosNativos','AvisosNativos']]) deps[file] = { [name]: name };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/_layout.tsx','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText, {exports, require:id => { assert.ok(deps[id],id); return deps[id]; }});
  function find(node, type) {
    if (Array.isArray(node)) return node.map(n => find(n,type)).find(Boolean);
    if (!node) return null;
    return node.type === type ? node.props : find(node.props?.children,type);
  }
  const initial = exports.default();
  assert.equal(hidden,0,'No oculta la carga antes de estar listo');
  find(initial,'PantallaCarga').onLoadEnd();
  assert.ok(find(exports.default(),'Stack'));
  // No simulamos onLayout: la carga terminada debe quitar el splash igualmente.
  assert.equal(hidden,os === 'web' ? 0 : 1);
  assert.equal(prevented,os === 'web' ? 0 : 1);
}
for (const os of ['android','ios','web']) check(os);
console.log('Splash: carga inicial, salida sin depender de onLayout y exclusión web OK');
