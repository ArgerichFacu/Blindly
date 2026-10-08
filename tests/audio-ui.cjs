const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
function cargar(path, deps = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      require: (id) => {
        if (id.startsWith("../../assets/")) {
          assert.ok(fs.existsSync(id.replace("../../", "")));
          return 1;
        }
        assert.ok(Object.hasOwn(deps, id), id);
        return deps[id];
      },
      Date,
    },
  );
  return exports;
}
const audio = cargar("src/lib/audio.ts"),
  bot = cargar("src/lib/botonera.ts");
let p = { ...audio.AUDIO_INICIAL, ...bot.BOTONERA_INICIAL },
  activo = false,
  disponible = false;
const cambios = [],
  rutas = [];
const jsx = (type, props) => ({ type, props });
const deps = {
  "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
  react: {
    useState: (v) => [v, () => {}],
    useRef: (v) => ({ current: v }),
    useEffect: () => {},
  },
  "react-native": { View: "View", Switch: "Switch" },
  "expo-router": { useRouter: () => ({ push: (r) => rutas.push(r) }) },
  "expo-audio": { useAudioPlayer: () => {}, useAudioPlayerStatus: () => {} },
  "../lib/Preferencias": {
    usePreferencias: () => ({
      preferencias: p,
      t: (s) => s,
      cambiar: (c) => {
        cambios.push(c);
        p = { ...p, ...c };
      },
    }),
  },
  "../lib/PlusContext": { usePlus: () => ({ activo, disponible }) },
  "../lib/audio": audio,
  "../lib/botonera": bot,
  "../lib/useControlAudio": { useControlAudio: () => ({ detener: () => {} }) },
  "./Controles": { Boton: "Boton", Texto: "Texto" },
  "../components/Controles": {
    Boton: "Boton",
    Texto: "Texto",
    Tarjeta: "Tarjeta",
    Pantalla: "Pantalla",
  },
  "../components/AudioMesa": { AudioMesa: "AudioMesa" },
  "../components/Botonera": { Botonera: "Botonera" },
};
function elements(tree, type, out = []) {
  if (Array.isArray(tree)) tree.forEach((v) => elements(v, type, out));
  else if (tree && typeof tree === "object") {
    if (
      tree.type === type ||
      (typeof tree.type === "function" && tree.type.name === type)
    )
      out.push(tree.props);
    elements(tree.props?.children, type, out);
  }
  return out;
}
const board = cargar("src/components/Botonera.tsx", deps);
for (disponible of [false, true]) {
  activo = false;
  assert.equal(
    elements(board.Botonera({}), "Sonido").length,
    4,
    "Unavailable RevenueCat does not unlock Plus",
  );
  assert.equal(
    elements(board.Botonera({}), "Sonido").some((s) => s.sonido.plus),
    false,
  );
}
activo = true;
assert.equal(elements(board.Botonera({}), "Sonido").length, 8);
const settings = cargar("src/app/sonidos.tsx", deps).default;
activo = false;
assert.equal(
  elements(settings(), "Switch").length,
  5,
  "Free does not get premium configuration",
);
elements(settings(), "Boton")
  .find((b) => b.titulo === "Conocer Blindly Plus")
  .onPress();
assert.equal(rutas.pop(), "/plus");
activo = true;
const tree = settings();
assert.equal(elements(tree, "Switch").length, 13);
elements(tree, "Boton")
  .find((b) => b.titulo === "Añadir a favoritos")
  .onPress();
assert.equal(p.botoneraFavoritos[0], "aplausos");
elements(tree, "Switch")
  .find((s) => s.accessibilityLabel === "Mostrar sonido: Aplausos")
  .onValueChange();
assert.equal(p.botoneraVisibles.includes("aplausos"), false);
elements(tree, "Boton")
  .filter((b) => b.titulo === "Mover hacia arriba")[1]
  .onPress();
assert.equal(p.botoneraOrden[0], "fichas");
const saved = JSON.stringify(p);
activo = false;
assert.equal(elements(settings(), "Switch").length, 5);
assert.equal(JSON.stringify(p), saved);
assert.equal(
  elements(settings(), "Boton").some((b) => b.titulo === "Añadir a favoritos"),
  false,
);
console.log(
  "Audio UI: Free/Plus gating, disabled commerce, favorites, visibility, order and expiry rendering OK",
);
