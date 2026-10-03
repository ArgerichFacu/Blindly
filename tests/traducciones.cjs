const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const textosPath = path.join(src, "lib", "textos.ts");
const traducciones = new Map();
const mensajesError = new Set();

function clavePropiedad(nombre) {
  if (
    ts.isStringLiteral(nombre) ||
    ts.isNoSubstitutionTemplateLiteral(nombre) ||
    ts.isIdentifier(nombre)
  )
    return nombre.text;
  return null;
}

function leerTraducciones(objeto, archivo) {
  for (const propiedad of objeto.properties) {
    if (!ts.isPropertyAssignment(propiedad)) continue;
    const clave = clavePropiedad(propiedad.name);
    if (!clave) continue;
    assert.ok(
      ts.isArrayLiteralExpression(propiedad.initializer),
      `${clave} debe contener inglés y portugués`,
    );
    const valores = propiedad.initializer.elements;
    assert.equal(valores.length, 2, `${clave} debe tener dos traducciones`);
    for (const valor of valores)
      assert.ok(
        (ts.isStringLiteral(valor) ||
          ts.isNoSubstitutionTemplateLiteral(valor)) &&
          valor.text.trim(),
        `${clave} contiene una traducción vacía o no literal`,
      );
    traducciones.set(clave, archivo);
  }
}

function leerErrores(objeto) {
  for (const propiedad of objeto.properties) {
    if (!ts.isPropertyAssignment(propiedad)) continue;
    const valor = propiedad.initializer;
    if (ts.isStringLiteral(valor) || ts.isNoSubstitutionTemplateLiteral(valor))
      mensajesError.add(valor.text);
  }
}

const contenidoTextos = fs.readFileSync(textosPath, "utf8");
const fuenteTextos = ts.createSourceFile(
  textosPath,
  contenidoTextos,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

function recorrerDiccionario(nodo) {
  if (
    ts.isVariableDeclaration(nodo) &&
    ts.isIdentifier(nodo.name) &&
    nodo.initializer &&
    ts.isObjectLiteralExpression(nodo.initializer)
  ) {
    if (nodo.name.text === "textos")
      leerTraducciones(nodo.initializer, "textos");
    if (nodo.name.text === "errores") leerErrores(nodo.initializer);
  }
  if (
    ts.isCallExpression(nodo) &&
    ts.isPropertyAccessExpression(nodo.expression) &&
    nodo.expression.expression.getText(fuenteTextos) === "Object" &&
    nodo.expression.name.text === "assign" &&
    ts.isObjectLiteralExpression(nodo.arguments[1])
  ) {
    const destino = nodo.arguments[0]?.getText(fuenteTextos);
    if (destino === "textos") leerTraducciones(nodo.arguments[1], "assign");
    if (destino === "errores") leerErrores(nodo.arguments[1]);
  }
  ts.forEachChild(nodo, recorrerDiccionario);
}
recorrerDiccionario(fuenteTextos);

function archivosCodigo(carpeta) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return archivosCodigo(ruta);
    return /\.tsx?$/.test(entrada.name) ? [ruta] : [];
  });
}

const usadas = new Map();
function registrar(clave, archivo, fuente, nodo) {
  const linea = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente)).line + 1;
  const ubicaciones = usadas.get(clave) ?? [];
  ubicaciones.push(`${path.relative(root, archivo)}:${linea}`);
  usadas.set(clave, ubicaciones);
}

function clavesTraducibles(expresion, resultado = []) {
  if (
    ts.isStringLiteral(expresion) ||
    ts.isNoSubstitutionTemplateLiteral(expresion)
  ) {
    resultado.push(expresion);
  } else if (ts.isConditionalExpression(expresion)) {
    clavesTraducibles(expresion.whenTrue, resultado);
    clavesTraducibles(expresion.whenFalse, resultado);
  } else if (ts.isParenthesizedExpression(expresion)) {
    clavesTraducibles(expresion.expression, resultado);
  }
  return resultado;
}

for (const archivo of archivosCodigo(src)) {
  const contenido = fs.readFileSync(archivo, "utf8");
  const fuente = ts.createSourceFile(
    archivo,
    contenido,
    ts.ScriptTarget.Latest,
    true,
    archivo.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function recorrer(nodo) {
    if (
      ts.isCallExpression(nodo) &&
      ts.isIdentifier(nodo.expression) &&
      nodo.expression.text === "t" &&
      nodo.arguments[0]
    )
      for (const clave of clavesTraducibles(nodo.arguments[0]))
        registrar(clave.text, archivo, fuente, clave);
    ts.forEachChild(nodo, recorrer);
  }
  recorrer(fuente);
}

const faltantes = [...usadas]
  .filter(([clave]) => !traducciones.has(clave))
  .map(([clave, ubicaciones]) => `${clave} (${ubicaciones.join(", ")})`);
assert.deepEqual(faltantes, [], `Faltan traducciones: ${faltantes.join("; ")}`);

const erroresSinTraducir = [...mensajesError].filter(
  (mensaje) => !traducciones.has(mensaje),
);
assert.deepEqual(
  erroresSinTraducir,
  [],
  `Faltan mensajes de error traducidos: ${erroresSinTraducir.join("; ")}`,
);

console.log(
  `OK: ${traducciones.size} textos y ${mensajesError.size} errores disponibles en español, inglés y portugués.`,
);
