const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/lib/plus.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
const products = ['blindly_plus:monthly', 'blindly_plus:annual', 'blindly_plus_founder_lifetime'];
const offering = {identifier: 'default', availablePackages: products.map((identifier, i) => ({
  identifier: ['$rc_monthly', '$rc_annual', '$rc_lifetime'][i],
  product: {identifier, price: i + 1, priceString: `$ ${i + 1},00`, currencyCode: 'ARS', receipt: 'secret-receipt'},
}))};
function setup(enabled) {
  const logs = [], exports = {};
  let id = null, error = null, changed = false, calls = 0;
  const purchases = {
    isConfigured: async () => id !== null, setLogLevel: async () => {},
    configure: options => { id = options.appUserID; }, logIn: async value => { id = value; },
    getCustomerInfo: async () => ({entitlements: {active: {}}}),
    getAppUserID: async () => changed ? 'different-private-identity' : id,
    getOfferings: async () => { calls++; if (error) throw error; return {current: {identifier: 'other'}, all: {default: offering}}; },
  };
  vm.runInNewContext(code, {exports, Error, console: {info: (...args) => logs.push(args)}, __DEV__: false,
    process: {env: {EXPO_PUBLIC_PLUS_READY: 'true', EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'goog_private-fixture', EXPO_PUBLIC_PAYMENT_RC_DIAGNOSTICS: String(enabled)}},
    require: name => name === 'react-native' ? {Platform: {OS: 'android'}} : name === './identidad' ?
      {identidadUsuario: user => ({recuperable: user.is_anonymous === false})} :
      {__esModule: true, default: purchases, LOG_LEVEL: {INFO: 1}},
  });
  return {exports, logs, fail: value => {error = value;}, change: () => {changed = true;}, calls: () => calls};
}
(async () => {
  const user = {id: 'private-supabase-identity', is_anonymous: false};
  const active = setup(true);
  assert.equal(await active.exports.consultarCatalogoPlus(user), offering);
  const event = JSON.parse(active.logs[0][1]);
  assert.equal(event.evento, 'catalogo_leido');
  assert.equal(event.sdkConfigurado, true); assert.equal(event.identidadCoincide, true);
  assert.equal(event.offering, 'default');
  assert.deepEqual(event.paquetes.map(item => item.producto), products);
  assert.deepEqual(event.paquetes.map(item => item.precioLocalizado), ['$ 1,00', '$ 2,00', '$ 3,00']);
  active.fail(new Error('private-error-with-token'));
  await assert.rejects(active.exports.consultarCatalogoPlus(user), /private-error/);
  assert.equal(JSON.parse(active.logs.at(-1)[1]).codigo, 'SDK_ERROR');
  active.fail(null); active.change();
  await assert.rejects(active.exports.consultarCatalogoPlus(user), /SESION_CAMBIO/);
  assert.equal(JSON.parse(active.logs.at(-1)[1]).codigo, 'SESION_CAMBIO');
  assert.equal(active.logs.filter(log => JSON.parse(log[1]).evento === 'catalogo_leido').length, 1);
  assert.doesNotMatch(JSON.stringify(active.logs), /private-|secret-receipt|goog_/);
  const off = setup(false); await off.exports.consultarCatalogoPlus(user); assert.equal(off.logs.length, 0);
  const guest = setup(true);
  assert.equal(await guest.exports.consultarCatalogoPlus({...user, is_anonymous: true}),offering);
  assert.equal(guest.calls(),1);
  await assert.rejects(guest.exports.prepararIdentidadCompra({...user,is_anonymous:true}),/PLUS_PROTEGER_CUENTA/);
  assert.doesNotMatch(JSON.stringify(guest.logs),/private-|secret-receipt|goog_/);
  console.log('Payment RC: evidencia de catálogo/identidad sin UUID, claves, recibos ni errores crudos; desactivada fuera del perfil RC OK');
})().catch(error => {console.error(error); process.exitCode = 1;});
