const assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
function escenario(activo, conLiga) {
  const llamadas = [], exportsModulo = {};
  const jsx = (type, props) => ({ type, props });
  const liga = { id: "club", nombre: "Amigos", estado: "activa" }, detalle = { liga: { id: "club" }, ranking: [{ nombre: "Real", puntos: 40 }] };
  const mocks = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    "expo-router": { useRouter: () => ({ push: r => llamadas.push(r) }) },
    "react-native": { Pressable: "Pressable", View: "View" },
    "../../components/Controles": { Pantalla: "Pantalla", Texto: "Texto", Boton: "Boton" },
    "../../components/Icono": { Icono: "Icono" },
    "../../components/ResumenClub": { ResumenClub: "ResumenClub" },
    "../../components/FilaOpcion": { FilaOpcion: "FilaOpcion" },
    "../../components/EntradaSuave": { EntradaSuave: "EntradaSuave" },
    "../../lib/useClubes": { useClubes: () => ({ datos: { usuario: "yo", ligas: conLiga ? [liga] : [], elegida: conLiga ? "club" : null, detalles: { club: detalle } }, error: null }) },
    "../../lib/TemaContext": { useTema: () => ({ tema: {} }) },
    "../../lib/Preferencias": { usePreferencias: () => ({ t: k => k }) },
    "../../lib/PlusContext": { usePlus: () => ({ activo }) },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/app/(principal)/index.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { exports: exportsModulo, require: k => { assert.ok(k in mocks, k); return mocks[k]; } });
  const elementos = [];
  function recorrer(n) { if (Array.isArray(n)) n.forEach(recorrer); else if (n && typeof n === "object") { elementos.push(n); recorrer(n.props?.children); } }
  recorrer(exportsModulo.default());
  return { elementos, llamadas, liga, detalle };
}
const free = escenario(false, false), premium = escenario(true, true);
assert.equal(free.elementos.filter(e => e.type === "Pressable" && e.props.accessibilityLabel === "Blindly Plus").length, 1);
assert.equal(premium.elementos.filter(e => e.type === "Pressable" && e.props.accessibilityLabel === "Blindly Plus").length, 0);
const snapshot = premium.elementos.find(e => e.type === "ResumenClub");
assert.equal(snapshot.props.liga, premium.liga);
assert.equal(snapshot.props.detalle, premium.detalle, "Home usa datos reales sin ranking ficticio");
assert.ok(free.elementos.some(e => e.type === "Texto" && e.props.children === "Todavía no tenés liga."));
free.elementos.find(e => e.type === "Boton" && e.props.titulo === "Crear partida").props.onPress();
free.elementos.find(e => e.type === "FilaOpcion" && e.props.titulo === "Unirme con código").props.onPress();
assert.deepEqual(free.llamadas, ["/crear-sala", "/unirse"]);
console.log("Home UI: Free/Plus, contexto real, empty state y flujos existentes OK");
