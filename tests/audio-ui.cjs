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
  "./Icono": { Icono: "Icono" },
  "../components/Icono": { Icono: "Icono" },
  "../lib/visual": cargar("src/lib/visual.ts"),
  "../lib/hapticos": { vibrarToque: async () => {} },
  "../components/VolumenAudio": { VolumenAudio: "VolumenAudio" },
  "../lib/TemaContext": { useTema: () => ({tema:{}}) },
  "../lib/capacidadesPlus": cargar("src/lib/capacidadesPlus.ts"),
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
assert.equal(elements(board.Botonera({}), "Sonido").length, 12);
const settings = cargar("src/app/sonidos.tsx", deps).default;
activo = false;
assert.equal(elements(settings(), "VolumenAudio").length, 4);
const volumenPrevio = p.volumenMusica;
elements(settings(), "VolumenAudio")[0].guardar(0.37);
assert.equal(p.volumenMusica, 0.37);
assert.equal(p.musica, audio.AUDIO_INICIAL.musica);
p.volumenMusica = volumenPrevio;
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
assert.equal(elements(tree, "Switch").length, 17);
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
// Ejercitar el botón real, incluidos estados disabled/pressed/playing.
let plays = 0, taps = 0;
const player = {}, status = { isLoaded: true, playing: false };
deps["expo-audio"] = { useAudioPlayer: () => player, useAudioPlayerStatus: () => status };
deps["react-native"].Pressable = "Pressable";
deps["../lib/hapticos"] = { vibrarToque: async () => taps++ };
const mounted = cargar("src/components/Botonera.tsx", deps);
function tipo(n) {
  if (Array.isArray(n)) return n.map(tipo).find(Boolean);
  if (!n || typeof n !== "object") return null;
  return n.type?.name === "Sonido" ? n.type : tipo(n.props?.children);
}
activo = true;
const Sonido = tipo(mounted.Botonera({}));
const props = { sonido: bot.SONIDOS[1], volumen: .5, permitido: true, ultimoRef: { current: 0 }, avisar: () => {}, control: { reproducir: async () => plays++ } };
const reaction = () => elements(Sonido(props), "Pressable")[0];
const button = reaction();
assert.equal(button.disabled, false);
assert.equal(button.style({ pressed: true }).transform[0].scale, .97);
button.onPress(); button.onPress();
assert.equal(plays, 1, "Toques rápidos no acumulan sonidos");
assert.equal(taps, 1, "Una vibración discreta por reacción aceptada");
props.volumen = 0;
assert.equal(reaction().disabled, true);
reaction().onPress(); assert.equal(plays, 1, "Mute bloquea también el handler");
props.volumen = .5; props.permitido = false;
reaction().onPress(); assert.equal(plays, 1);
props.permitido = true; status.isLoaded = false;
assert.equal(reaction().disabled, true);
reaction().onPress(); assert.equal(plays, 1);
console.log("Reacciones UI: presión, carga, mute, partida pausada y límite de ráfagas OK");
