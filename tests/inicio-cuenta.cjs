// Ejercita los handlers reales de Cuenta con auth/storage controlados, sin red.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const source = ts.transpileModule(
  fs.readFileSync("src/app/cuenta.tsx", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
).outputText;
const flush = () => new Promise((res) => setImmediate(res));
const identidad = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/identidad.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: identidad },
);
function escenario(origen = "1", volver, liga, codigo) {
  let indice = 0,
    efecto,
    usuario = { id: "uuid-original", is_anonymous: true },
    persistir = true;
  const estados = [],
    refs = [],
    llamadas = [];
  const controles = Object.fromEntries(
    ["Pantalla", "Texto", "Tarjeta", "Campo", "Boton"].map((key) => [key, key]),
  );
  const inicio = {
    ocupado: false,
    error: false,
    elegir: async (valor) => {
      llamadas.push(["elegir", valor]);
      return persistir;
    },
  };
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: {
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
      useCallback: (fn) => fn,
    },
    "expo-router": {
      useFocusEffect: (fn) => {
        efecto = fn;
      },
      useLocalSearchParams: () => ({ inicio: origen, volver, liga, codigo }),
      useRouter: () => ({
        replace: (ruta) => llamadas.push(["replace", ruta]),
        dismissTo: (ruta) => llamadas.push(["dismissTo", ruta]),
      }),
    },
    "../components/Controles": controles,
    "../lib/Preferencias": {
      usePreferencias: () => ({ t: (key) => key, mensajeError: () => "error" }),
    },
    "../lib/PlusContext": { usePlus: () => ({ activo: false }) },
    "../lib/InicioContext": { useInicio: () => inicio },
    "../lib/identidad": identidad,
    "../lib/sesion": {
      asegurarSesion: async () => usuario,
      cuentaConClave: (u) => !!u?.email?.endsWith("@recovery.blindly.invalid"),
      crearClaveRecuperacion: async () => {
        usuario = {
          id: "uuid-original",
          is_anonymous: false,
          email: "uuid-original@recovery.blindly.invalid",
        };
        return { usuario, clave: "CLAVE-DE-PRUEBA" };
      },
      recuperarConClave: async () => ({
        id: "uuid-recuperado",
        is_anonymous: false,
        email: "uuid-recuperado@recovery.blindly.invalid",
      }),
    },
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    process: { env: { EXPO_PUBLIC_EMAIL_AUTH_READY: "false" } },
    require: (name) => {
      assert.ok(Object.hasOwn(mocks, name), `Import no esperado: ${name}`);
      return mocks[name];
    },
  });
  function render() {
    indice = 0;
    return exports.default();
  }
  function elementos(nodo, tipo, out = []) {
    if (Array.isArray(nodo)) nodo.forEach((n) => elementos(n, tipo, out));
    else if (nodo && typeof nodo === "object") {
      if (nodo.type === tipo) out.push(nodo.props);
      elementos(nodo.props?.children, tipo, out);
    }
    return out;
  }
  const botones = () => elementos(render(), "Boton");
  return {
    llamadas,
    inicio,
    render,
    botones,
    elementos,
    cargar: async () => {
      render();
      efecto();
      await flush();
    },
    set persistir(v) {
      persistir = v;
    },
  };
}
async function main() {
  const cuenta = escenario();
  await cuenta.cargar();
  assert.ok(
    cuenta
      .elementos(cuenta.render(), "Texto")
      .some((e) => e.children === "uuid-original"),
    "Muestra el UUID propio sin cambiarlo",
  );
  assert.ok(
    !cuenta.botones().some((b) => b.titulo === "Continuar con esta cuenta"),
    "No considera persistente al anónimo",
  );
  cuenta
    .botones()
    .find((b) => b.titulo === "Crear clave de recuperación")
    .onPress();
  await flush();
  const continuar = cuenta
    .botones()
    .find((b) => b.titulo === "Guardé mi clave. Continuar");
  assert.ok(continuar);
  assert.deepEqual(
    cuenta.llamadas,
    [],
    "Crear clave no navega ni guarda elección antes de leerla",
  );
  assert.ok(
    cuenta
      .elementos(cuenta.render(), "Texto")
      .some((e) => e.children === "CLAVE-DE-PRUEBA"),
  );
  cuenta.persistir = false;
  continuar.onPress();
  await flush();
  assert.deepEqual(
    cuenta.llamadas,
    [["elegir", "cuenta"]],
    "No abandona pantalla si falla guardado",
  );
  cuenta.persistir = true;
  cuenta
    .botones()
    .find((b) => b.titulo === "Guardé mi clave. Continuar")
    .onPress();
  await flush();
  assert.deepEqual(
    cuenta.llamadas.at(-1),
    ["dismissTo", "/"],
    "Vuelve al inicio que mostrará tutorial",
  );

  const recuperar = escenario();
  await recuperar.cargar();
  recuperar
    .botones()
    .find((b) => b.titulo === "Ya tengo una clave")
    .onPress();
  const campoClave = recuperar
    .elementos(recuperar.render(), "Campo")
    .find((c) => c.etiqueta === "Clave de recuperación");
  assert.equal(campoClave.autoCapitalize, "none");
  assert.equal(campoClave.secureTextEntry, true);
  recuperar
    .elementos(recuperar.render(), "Campo")
    .find((c) => c.etiqueta === "Clave de recuperación")
    .onChangeText("CLAVE-DE-PRUEBA");
  recuperar
    .botones()
    .find((b) => b.titulo === "Recuperar mi cuenta")
    .onPress();
  await flush();
  assert.deepEqual(
    recuperar.llamadas,
    [],
    "Recuperar no pierde contexto de onboarding mediante replace",
  );
  recuperar
    .botones()
    .find((b) => b.titulo === "Continuar con esta cuenta")
    .onPress();
  await flush();
  assert.deepEqual(recuperar.llamadas, [
    ["elegir", "cuenta"],
    ["dismissTo", "/"],
  ]);

  const normal = escenario(undefined);
  await normal.cargar();
  // La función usa un default: origen distinto indica apertura común.
  const comun = escenario("0");
  await comun.cargar();
  comun
    .botones()
    .find((b) => b.titulo === "Crear clave de recuperación")
    .onPress();
  await flush();
  assert.ok(
    !comun.botones().some((b) => b.titulo === "Guardé mi clave. Continuar"),
  );
  assert.deepEqual(
    comun.llamadas,
    [],
    "Proteger una cuenta existente no reinicia introducción",
  );
  const nuevoClub = escenario("0", "liga-nueva");
  await nuevoClub.cargar();
  assert.ok(!nuevoClub.botones().some((b) => b.titulo === "Volver a mi club"));
  nuevoClub
    .botones()
    .find((b) => b.titulo === "Crear clave de recuperación")
    .onPress();
  await flush();
  assert.deepEqual(
    nuevoClub.llamadas,
    [],
    "Mantiene visible la clave antes de regresar",
  );
  nuevoClub
    .botones()
    .find((b) => b.titulo === "Guardé mi clave. Continuar")
    .onPress();
  assert.deepEqual(nuevoClub.llamadas, [["replace", "/liga-nueva"]]);

  const clubExistente = escenario("0", "liga", "club-prueba");
  await clubExistente.cargar();
  clubExistente
    .botones()
    .find((b) => b.titulo === "Ya tengo una clave")
    .onPress();
  clubExistente
    .elementos(clubExistente.render(), "Campo")
    .find((c) => c.etiqueta === "Clave de recuperación")
    .onChangeText("CLAVE-DE-PRUEBA");
  clubExistente
    .botones()
    .find((b) => b.titulo === "Recuperar mi cuenta")
    .onPress();
  await flush();
  assert.deepEqual(
    clubExistente.llamadas,
    [],
    "Recuperación conserva el club de origen",
  );
  clubExistente
    .botones()
    .find((b) => b.titulo === "Volver a mi club")
    .onPress();
  assert.equal(clubExistente.llamadas[0][1].pathname, "/liga");
  assert.equal(clubExistente.llamadas[0][1].params.id, "club-prueba");
  const invitacion = escenario(
    "0",
    "liga-unirse",
    undefined,
    "0123456789ABCDEF0123",
  );
  await invitacion.cargar();
  invitacion
    .botones()
    .find((b) => b.titulo === "Crear clave de recuperación")
    .onPress();
  await flush();
  invitacion
    .botones()
    .find((b) => b.titulo === "Guardé mi clave. Continuar")
    .onPress();
  assert.equal(invitacion.llamadas[0][1].pathname, "/liga-unirse");
  assert.equal(invitacion.llamadas[0][1].params.codigo, "0123456789ABCDEF0123");
  console.log(
    "OK: invitado, vinculación con UUID, clave visible, recuperación y contexto de inicio.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
