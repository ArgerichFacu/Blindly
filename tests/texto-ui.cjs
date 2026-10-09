const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const flatten = value => Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : value || {};
const jsx = (type, props) => ({ type, props });
const mocks = {
  'react/jsx-runtime': { jsx, jsxs: jsx }, react: {},
  'react-native': { Text: 'Text', StyleSheet: { create: x => x, flatten } },
  'react-native-safe-area-context': {}, './Superficie': {}, '../lib/visual': {}, '../lib/useVolver': {},
  '../lib/TemaContext': { useTema: () => ({ tema: { textoFuerte: '#fff' } }) }, '../lib/Preferencias': {},
};
const exportsTest = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/Controles.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { exports: exportsTest, require: k => { assert.ok(k in mocks, k); return mocks[k]; } });
const render = style => exportsTest.Texto({ children: 'Jugador · g j p q y · blindly.', style });
const perfil = flatten(render({ fontSize: 26, fontWeight: '800' }).props.style);
assert.ok(perfil.lineHeight > perfil.fontSize, 'Nombre grande reserva espacio para descendentes');
assert.equal(perfil.includeFontPadding, true, 'Android conserva espacio de la fuente');
assert.equal(flatten(render().props.style).lineHeight, 21, 'Texto normal conserva su altura');
assert.equal(flatten(render([{ fontSize: 32 }, null, { fontSize: 34, lineHeight: 41 }]).props.style).lineHeight, 41, 'Hero mantiene la altura explícita válida');
assert.ok(flatten(render({ fontSize: 32, lineHeight: 21 }).props.style).lineHeight > 32, 'Una altura heredada insuficiente no recorta una letra grande');
console.log('Texto: descendentes, estilos combinados, altura explícita y padding Android OK');
