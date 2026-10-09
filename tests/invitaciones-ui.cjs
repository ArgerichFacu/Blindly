// Handlers reales: abrir una invitación no da consentimiento para unirse.
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
const codigo = "0123456789ABCDEF0123",
  flush = () => new Promise((r) => setImmediate(r));
const source = ts.transpileModule(
  fs.readFileSync("src/app/liga-unirse.tsx", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
).outputText;
function escenario({
  protegida = true,
  inicial = codigo,
  pendiente = null,
  fallar = false,
  yaMiembro = false,
  consultaInvalida = false,
} = {}) {
  let indice = 0,
    efecto,
    guardado = pendiente;
  const estados = [],
    refs = [],
    llamadas = [];
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    react: {
      useState: (v) => {
        const i = indice++;
        if (!(i in estados)) estados[i] = v;
        return [
          estados[i],
          (v) => {
            estados[i] = typeof v === "function" ? v(estados[i]) : v;
          },
        ];
      },
      useRef: (v) => {
        const i = indice++;
        return (refs[i] ??= { current: v });
      },
      useCallback: (fn) => fn,
      useEffect: (fn) => fn(),
    },
    "expo-router": {
      useFocusEffect: (fn) => {
        efecto = fn;
      },
      useLocalSearchParams: () => ({ codigo: inicial }),
      useRouter: () => ({
        push: (r) => llamadas.push(["push", r]),
        replace: (r) => llamadas.push(["replace", r]),
      }),
    },
    "react-native": { View: "View" },
    "expo-camera": {
      CameraView: "CameraView",
      useCameraPermissions: () => [
        { granted: false },
        async () => ({ granted: false }),
      ],
    },
    "../components/Controles": Object.fromEntries(
      ["Boton", "Campo", "Pantalla", "Tarjeta", "Texto"].map((x) => [x, x]),
    ),
    "../lib/hapticos": { vibrarMomento: async () => {} },
    "../lib/useIdentidad": {
      useIdentidad: () => ({
        cargando: false,
        recuperable: protegida,
        error: null,
      }),
    },
    "../lib/Preferencias": {
      usePreferencias: () => ({ t: (k) => k, mensajeError: (e) => e.message, preferencias: { hapticos: true } }),
    },
    "../lib/invitaciones": {
      codigoInvitacion: (v) => (/^[A-F0-9]{20}$/.test(v) ? v : null),
      guardarInvitacion: async (c) => {
        guardado = c;
      },
      invitacionPendiente: async () => guardado,
      borrarInvitacion: async (c) => {
        if (guardado === c) guardado = null;
      },
    },
    "../lib/ligas": {
      consultarInvitacionLiga: async (c) => {
        llamadas.push(["consulta", c]);
        if (consultaInvalida) throw new Error("INVITACION_INVALIDA");
        return {
          liga_id: "club",
          nombre: "Los Pibes",
          descripcion: "Viernes",
          ya_miembro: yaMiembro,
        };
      },
      aceptarInvitacionLiga: async (c, n) => {
        llamadas.push(["aceptar", c, n]);
        if (fallar) throw new Error("INVITACION_INVALIDA");
        return "club";
      },
    },
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (k) => {
      assert.ok(k in mocks, k);
      return mocks[k];
    },
  });
  const render = () => {
    indice = 0;
    return exports.default();
  };
  function elementos(nodo, tipo, out = []) {
    if (Array.isArray(nodo)) nodo.forEach((n) => elementos(n, tipo, out));
    else if (nodo && typeof nodo === "object") {
      if (nodo.type === tipo) out.push(nodo.props);
      elementos(nodo.props?.children, tipo, out);
    }
    return out;
  }
  return {
    llamadas,
    render,
    elementos,
    botones: () => elementos(render(), "Boton"),
    get pendiente() {
      return guardado;
    },
    cargar: async () => {
      render();
      efecto();
      await flush();
    },
  };
}
(async () => {
  const guest = escenario({ protegida: false });
  await guest.cargar();
  assert.deepEqual(
    guest.llamadas,
    [],
    "No consulta ni ingresa automáticamente",
  );
  guest
    .botones()
    .find((b) => b.titulo === "Proteger mi cuenta")
    .onPress();
  await flush();
  assert.equal(guest.pendiente, codigo);
  assert.equal(guest.llamadas[0][1].pathname, "/cuenta");
  assert.equal(guest.llamadas[0][1].params.volver, "liga-unirse");
  assert.equal(guest.llamadas[0][1].params.codigo, codigo);
  const protegido = escenario({
    inicial: null,
    pendiente: guest.pendiente,
  });
  await protegido.cargar();
  protegido.render();
  await flush();
  assert.equal(
    protegido.elementos(protegido.render(), "Campo")[0].value,
    codigo,
    "Restaura la invitación pendiente",
  );
  assert.ok(protegido.botones().some(b => b.titulo === "Confirmar y unirme"), "El enlace resuelve una vista previa sin ingresar");
  await flush();
  assert.equal(protegido.llamadas.filter((x) => x[0] === "aceptar").length, 0);
  assert.ok(
    protegido.botones().find((b) => b.titulo === "Confirmar y unirme").disabled,
  );
  protegido
    .elementos(protegido.render(), "Campo")
    .find((c) => c.etiqueta === "Tu nombre")
    .onChangeText("Facu");
  const confirmar = protegido
    .botones()
    .find((b) => b.titulo === "Confirmar y unirme");
  confirmar.onPress();
  confirmar.onPress();
  await flush();
  assert.equal(
    protegido.llamadas.filter((x) => x[0] === "aceptar").length,
    1,
    "Un solo ingreso ante doble toque",
  );
  assert.equal(protegido.llamadas.at(-1)[1].pathname, "/liga");
  assert.equal(protegido.pendiente, null);
  const invalida = escenario({ fallar: true });
  await invalida.cargar();
  assert.ok(invalida.botones().some(b => b.titulo === "Confirmar y unirme"));
  await flush();
  invalida
    .elementos(invalida.render(), "Campo")
    .find((c) => c.etiqueta === "Tu nombre")
    .onChangeText("Facu");
  invalida
    .botones()
    .find((b) => b.titulo === "Confirmar y unirme")
    .onPress();
  await flush();
  assert.equal(invalida.llamadas.filter((x) => x[0] === "replace").length, 0);
  assert.equal(
    invalida.pendiente,
    codigo,
    "Un rechazo conserva el contexto para reintentar",
  );
  invalida
    .elementos(invalida.render(), "Campo")[0]
    .onChangeText("FFFFFFFFFFFFFFFFFFFF");
  assert.ok(
    !invalida.botones().some((b) => b.titulo === "Confirmar y unirme"),
    "Cambiar código invalida la confirmación anterior",
  );
  const vacia = escenario({ inicial: "" });
  await vacia.cargar();
  vacia
    .botones()
    .find((b) => b.titulo === "Cancelar")
    .onPress();
  await flush();
  assert.deepEqual(
    vacia.llamadas,
    [["replace", "/ligas"]],
    "Cancelar funciona también sin código válido",
  );
  const miembro = escenario({ yaMiembro: true });
  await miembro.cargar();
  assert.equal(miembro.llamadas.filter(x => x[0] === "aceptar").length, 0);
  assert.ok(miembro.llamadas.some(x => x[0] === "replace" && x[1].pathname === "/liga"), "Un miembro vuelve directamente a su club");
  const vencida = escenario({ consultaInvalida: true });
  await vencida.cargar();
  assert.equal(vencida.llamadas.filter(x => x[0] === "aceptar" || x[0] === "replace").length, 0);
  assert.ok(vencida.elementos(vencida.render(), "Texto").some(p => p.children === "INVITACION_INVALIDA"));
  console.log(
    "Invitaciones UI: invitado, cuenta, contexto, consentimiento, doble toque, rechazo y cancelar OK",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
