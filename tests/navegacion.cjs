const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function cargar(nombre, mocks, globals = {}) {
  const source = fs.readFileSync(`src/lib/${nombre}.ts`, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (name) => {
      assert.ok(Object.hasOwn(mocks, name), `Import inesperado: ${name}`);
      return mocks[name];
    },
    ...globals,
  });
  return exports;
}

function escenario(os, historial, activado = true) {
  let listener, cleanup, retirados = 0;
  const calls = [];
  const router = {
    canGoBack: () => historial,
    back: () => calls.push("back"),
    replace: (path) => calls.push(["replace", path]),
  };
  const { useVolver } = cargar("useVolver", {
    "expo-router": {
      useRouter: () => router,
      useFocusEffect: (effect) => { cleanup = effect(); },
    },
    react: { useCallback: (fn) => fn },
    "react-native": {
      Platform: { OS: os },
      BackHandler: {
        addEventListener: (event, fn) => {
          assert.equal(event, "hardwareBackPress");
          listener = fn;
          return { remove: () => retirados++ };
        },
      },
    },
  });
  const volver = useVolver(activado);
  return { volver, calls, listener, cleanup, retirados: () => retirados };
}

const secundaria = escenario("android", true);
assert.equal(secundaria.listener(), true);
assert.deepEqual(secundaria.calls, ["back"]);
secundaria.cleanup();
assert.equal(secundaria.retirados(), 1, "Debe retirar el listener al desenfocar");
const directa = escenario("android", false);
assert.equal(directa.listener(), true, "Sin historial debe consumir Atrás");
assert.deepEqual(directa.calls, [["replace", "/"]]);
const raiz = escenario("android", false, false);
assert.equal(raiz.listener, undefined, "El menú debe permitir la salida nativa");
for (const os of ["ios", "web"]) {
  const other = escenario(os, false);
  assert.equal(other.listener, undefined);
  other.volver();
  assert.deepEqual(other.calls, [["replace", "/"]]);
}

function mesa(os, proteger, aceptacionWeb = false) {
  let callback, bloqueo;
  const dialogs = [], dispatches = [];
  const volver = () => {};
  const { useSalidaMesa, protegerSalidaMesa } = cargar("useSalidaMesa", {
    "expo-router": { useNavigation: () => ({ dispatch: (action) => dispatches.push(action) }) },
    "expo-router/react-navigation": { usePreventRemove: (enabled, fn) => { bloqueo = enabled; callback = fn; } },
    react: { useRef: (value) => ({ current: value }) },
    "react-native": { Platform: { OS: os }, Alert: { alert: (...args) => dialogs.push(args) } },
    "./Preferencias": { usePreferencias: () => ({ t: (key) => key }) },
    "./useVolver": { useVolver: () => volver },
  }, { confirm: () => aceptacionWeb });
  assert.equal(useSalidaMesa(proteger), volver);
  return { callback, bloqueo, dialogs, dispatches, protegerSalidaMesa };
}

const { protegerSalidaMesa } = mesa("android", false);
assert.equal(protegerSalidaMesa("jugando"), true);
assert.equal(protegerSalidaMesa("pausado"), true, "El estado de pausa del backend es pausado");
assert.equal(protegerSalidaMesa("esperando"), false);
assert.equal(protegerSalidaMesa("finalizada"), false);
assert.equal(protegerSalidaMesa(undefined), true, "La carga inicial protege una mesa todavía desconocida");
assert.equal(protegerSalidaMesa(undefined, true), false, "Una sala que no carga permite volver");
assert.equal(protegerSalidaMesa("desconocido"), true, "Un estado no reconocido no permite una salida accidental");
assert.equal(protegerSalidaMesa("pausado", true), true, "Una desconexión no retira la protección de una mesa conocida");

for (const os of ["android", "ios"]) {
  const active = mesa(os, true);
  assert.equal(active.bloqueo, true);
  const action = { type: "GO_BACK", source: "sala" };
  active.callback({ data: { action } });
  active.callback({ data: { action } });
  assert.equal(active.dialogs.length, 1, "Atrás repetido no debe duplicar confirmaciones");
  assert.equal(active.dispatches.length, 0, "La pantalla no sale antes de confirmar");
  active.dialogs[0][2][0].onPress();
  assert.equal(active.dispatches.length, 0, "Cancelar conserva la mesa");
  active.callback({ data: { action } });
  active.dialogs[1][2][1].onPress();
  assert.equal(active.dispatches[0], action, "Confirmar repite la acción bloqueada original");
  active.callback({ data: { action } });
  active.dialogs[2][3].onDismiss();
  active.callback({ data: { action } });
  assert.equal(active.dialogs.length, 4, "Descartar la alerta permite volver a pedir salir");
}
assert.equal(mesa("android", false).bloqueo, false, "Una sala finalizada o de espera permite volver");
for (const acepta of [false, true]) {
  const web = mesa("web", true, acepta);
  web.callback({ data: { action: { type: "REPLACE" } } });
  assert.equal(web.dispatches.length, Number(acepta));
  assert.equal(web.dialogs.length, 0);
}
console.log("OK: Atrás enfocado, fallback al menú, raíz, limpieza y confirmación de salida de mesa en Android/iOS/web.");
