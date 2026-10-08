const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
function cargarPuro(file) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    { exports },
  );
  return exports;
}
const audio = cargarPuro("src/lib/audio.ts"),
  botonera = cargarPuro("src/lib/botonera.ts");
const flush = () => new Promise((res) => setImmediate(res));
const t = (s, datos = {}) =>
  s.replace(/\{(\w+)\}/g, (_, key) => String(datos[key]));
function componente(path, mocks) {
  let indice = 0;
  const estados = [],
    refs = [];
  const jsx = (type, props) => ({ type, props });
  const react = {
    useState: (valor) => {
      const i = indice++;
      if (!(i in estados)) estados[i] = valor;
      return [
        estados[i],
        (v) => {
          estados[i] = typeof v === "function" ? v(estados[i]) : v;
        },
      ];
    },
    useRef: (valor) => {
      const i = indice++;
      return (refs[i] ??= { current: valor });
    },
    createContext: () => ({ Provider: "Provider" }),
    ...mocks.react,
  };
  const deps = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    ...mocks,
    react,
  };
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
      console,
      require: (name) => {
        assert.ok(Object.hasOwn(deps, name), name);
        return deps[name];
      },
    },
  );
  return {
    render: (nombre, props) => {
      indice = 0;
      return exports[nombre](props);
    },
  };
}
function elementos(nodo, tipo, out = []) {
  if (Array.isArray(nodo)) nodo.forEach((n) => elementos(n, tipo, out));
  else if (nodo && typeof nodo === "object") {
    if (nodo.type === tipo) out.push(nodo.props);
    elementos(nodo.props?.children, tipo, out);
  }
  return out;
}
function panel(principiante, props) {
  const instancia = componente("src/components/PanelApuesta.tsx", {
    "react-native": { View: "View" },
    "./Controles": { Boton: "Boton", Campo: "Campo", Texto: "Texto" },
    "./AyudaTurno": { AyudaTurno: "Ayuda" },
    "../lib/Preferencias": {
      usePreferencias: () => ({ t, preferencias: { principiante } }),
    },
  });
  const acciones = [],
    base = {
      faltan: 300,
      stack: 1000,
      aporte: 200,
      actual: 500,
      minima: 200,
      puedeSubir: true,
      ocupado: false,
      monto: "",
      cambiar: () => {},
      actuar: (a) => acciones.push(a),
      ...props,
    };
  return { tree: instancia.render("PanelApuesta", base), acciones };
}
assert.equal(
  elementos(panel(false).tree, "Ayuda").length,
  0,
  "Modo apagado no agrega ayuda al turno",
);
const ayuda = elementos(panel(true).tree, "Ayuda")[0].virtual;
assert.equal(ayuda.igualar, 300);
assert.equal(ayuda.totalIgualar, 500);
assert.equal(ayuda.min, 700);
assert.equal(ayuda.max, 1200);
assert.equal(ayuda.puedePasar, false);
const corto = elementos(panel(true, { stack: 100 }).tree, "Ayuda")[0].virtual;
assert.equal(corto.igualar, 100);
assert.equal(corto.totalIgualar, 300);
assert.equal(corto.puedeSubir, false);
const noSube = elementos(panel(true, { puedeSubir: false }).tree, "Ayuda")[0]
  .virtual;
assert.equal(
  noSube.puedeSubir,
  false,
  "Ayuda respeta el mismo permiso de subir del panel",
);
const sinPendiente = panel(true, { faltan: 0, actual: 200 });
assert.equal(elementos(sinPendiente.tree, "Ayuda")[0].virtual.puedePasar, true);
elementos(sinPendiente.tree, "Boton")
  .find((b) => b.titulo === "Pasar")
  .onPress();
assert.deepEqual(
  sinPendiente.acciones,
  ["pasar"],
  "La ayuda no cambia la acción del jugador",
);
function modal(virtual) {
  const instancia = componente("src/components/AyudaTurno.tsx", {
    "react-native": { View: "View", Modal: "Modal", ScrollView: "ScrollView" },
    "./Controles": { Boton: "Boton", Texto: "Texto" },
    "../lib/Preferencias": { usePreferencias: () => ({ t }) },
    "../lib/TemaContext": { useTema: () => ({ tema: {} }) },
  });
  const render = () => instancia.render("AyudaTurno", { virtual });
  assert.equal(elementos(render(), "Modal")[0].visible, false);
  elementos(render(), "Boton")[0].onPress();
  assert.equal(elementos(render(), "Modal")[0].visible, true);
  elementos(render(), "Modal")[0].onRequestClose();
  assert.equal(
    elementos(render(), "Modal")[0].visible,
    false,
    "Atrás cierra ayuda antes de salir de mesa",
  );
  const textos = elementos(render(), "Texto")
    .map((p) => p.children)
    .join(" ");
  return textos;
}
assert.match(modal(ayuda), /Igualar agrega 300 fichas.*total.*500/);
assert.match(modal(corto), /igualada será all-in/);
assert.match(modal({ ...ayuda, max: 600 }), /Solo podés subir all-in a 600/);
assert.match(modal(noSube), /Subir no está disponible/);
assert.match(modal(undefined), /Con fichas físicas, verificá en la mesa/);
async function preferencias(datos, demora = false) {
  let efecto, persistido, completar;
  const instancia = componente("src/lib/Preferencias.tsx", {
    react: {
      useEffect: (fn) => {
        efecto = fn;
      },
    },
    "@react-native-async-storage/async-storage": {
      getItem: () =>
        demora
          ? new Promise((res) => {
              completar = res;
            })
          : Promise.resolve(JSON.stringify(datos)),
      setItem: async (_, valor) => {
        persistido = JSON.parse(valor);
      },
    },
    "./audio": audio,
    "./botonera": botonera,
    "./almacenamiento": { cargarSonidoActivado: async () => true },
    "./textos": { errores: {}, traducir: t },
  });
  const render = () =>
    instancia.render("PreferenciasProvider", { children: null }).props.value;
  render();
  efecto();
  if (demora) {
    render().cambiar({ silencio: true });
    completar(JSON.stringify(datos));
  }
  await flush();
  const value = render();
  if (demora) {
    assert.equal(value.preferencias.silencio, true);
    assert.equal(persistido.idioma, "pt");
    assert.equal(persistido.volumenMusica, 0.7);
  }
  assert.equal(
    value.preferencias.principiante,
    typeof datos.principiante === "boolean" ? datos.principiante : false,
  );
  value.cambiar({ principiante: true });
  await flush();
  assert.equal(persistido.principiante, true);
  assert.equal(persistido.idioma, "pt");
  assert.equal(persistido.volumenMusica, 0.7);
  assert.equal(render().preferencias.principiante, true);
  render().cambiar({
    silencio: true,
    ambiente: "casino",
    volumenAmbiente: 0.2,
    volumenBotonera: 0.4,
    botoneraFavoritos: ["caja"],
    botoneraOrden: [
      "caja",
      ...botonera.BOTONERA_INICIAL.botoneraOrden.filter((id) => id !== "caja"),
    ],
  });
  await flush();
  assert.equal(persistido.silencio, true);
  assert.equal(persistido.ambiente, "casino");
  assert.equal(persistido.volumenAmbiente, 0.2);
  assert.equal(persistido.volumenBotonera, 0.4);
  assert.equal(persistido.botoneraFavoritos[0], "caja");
  assert.equal(persistido.botoneraOrden[0], "caja");
  assert.equal(persistido.idioma, "pt");
  assert.equal(persistido.volumenMusica, 0.7);
}
Promise.all([
  preferencias({ idioma: "pt", volumenMusica: 0.7 }, true),
  preferencias({ idioma: "pt", volumenMusica: 0.7 }),
  preferencias({ idioma: "pt", volumenMusica: 0.7, principiante: true }),
  preferencias({ idioma: "pt", volumenMusica: 0.7, principiante: "true" }),
])
  .then(() =>
    console.log(
      "OK: ayuda opcional, montos reales, all-in corto, subida bloqueada, modal y preferencias compatibles/persistidas.",
    ),
  )
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
