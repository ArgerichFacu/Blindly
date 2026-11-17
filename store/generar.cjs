// Genera los gráficos de la ficha de Google Play a partir de capturas reales de la app.
// Sin dependencias nuevas: plantillas HTML + Chrome/Edge headless + un conversor PNG propio.
//
//   node store/generar.cjs            → todo (ícono, feature graphic y capturas ES/EN/PT)
//   node store/generar.cjs --idioma es
//
// Entradas:  store/capturas.json, store/raw/<idioma>/<id>.png (capturas del teléfono, 1080×2400)
// Salidas:   store/salida/icono-512.png (PNG 32 bits con alfa, ≤ 1 MB)
//            store/salida/<idioma>/feature-1024x500.png (PNG 24 bits, sin alfa)
//            store/salida/<idioma>/<nn>-<id>.png (1080×1920, PNG 24 bits, 9:16)
// Requisitos de Play verificados el 17/11/2026 (support.google.com/googleplay/android-developer/answer/9866151).
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");

const RAIZ = path.join(__dirname, "..");
const STORE = __dirname;
const SALIDA = path.join(STORE, "salida");
const config = JSON.parse(fs.readFileSync(path.join(STORE, "capturas.json"), "utf8"));
const tokens = JSON.parse(fs.readFileSync(path.join(RAIZ, "assets", "brand", "tokens.json"), "utf8")).temas.verde;
const IDIOMAS = (() => { const i = process.argv.indexOf("--idioma"); return i > 0 ? [process.argv[i + 1]] : ["es", "en", "pt"]; })();
const CHROME = [process.env.CHROME_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => p && fs.existsSync(p));
if (!CHROME) throw new Error("No encontré Chrome/Edge. Definí CHROME_PATH.");

const url = (p) => "file:///" + path.resolve(p).replace(/\\/g, "/");
const dataUri = (p) => `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
const fuentes = ["Barlow-Regular", "Barlow-Medium", "Barlow-SemiBold", "BarlowCondensed-SemiBold", "BarlowCondensed-Bold"]
  .map((f) => `@font-face{font-family:"${f}";src:url("${url(path.join(RAIZ, "assets", "fonts", f + ".ttf"))}")}`).join("");
const wordmark = fs.readFileSync(path.join(RAIZ, "assets", "brand", "blindly-wordmark.svg"), "utf8").replace(/ width="[\d.]+" height="[\d.]+"/, "");
const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function plantilla(nombre, datos) {
  let html = fs.readFileSync(path.join(STORE, "plantillas", nombre), "utf8");
  for (const [k, v] of Object.entries({ FUENTES: fuentes, WORDMARK: wordmark, ...Object.fromEntries(Object.entries(tokens).map(([k, v]) => ["T_" + k, String(v)])), ...datos }))
    html = html.split(`{{${k}}}`).join(v);
  return html;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blindly-store-"));
function exportar(html, destino, ancho, alto) {
  const archivo = path.join(tmp, "pagina.html");
  fs.writeFileSync(archivo, html);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--allow-file-access-from-files", "--virtual-time-budget=3000", `--window-size=${ancho},${alto}`,
    `--screenshot=${destino}`, url(archivo)], { stdio: "ignore", timeout: 90000 });
}

// --- PNG: lectura/escritura mínima (8 bits, RGB o RGBA, sin entrelazado) ---
function leerPng(p) {
  const b = fs.readFileSync(p);
  let o = 8, ancho, alto, tipo, idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), t = b.toString("ascii", o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (t === "IHDR") { ancho = d.readUInt32BE(0); alto = d.readUInt32BE(4); tipo = d[9]; if (d[8] !== 8 || d[12]) throw new Error(`${p}: PNG no soportado`); }
    if (t === "IDAT") idat.push(d);
    o += 12 + len;
  }
  const canales = tipo === 6 ? 4 : tipo === 2 ? 3 : 0;
  if (!canales) throw new Error(`${p}: tipo de color ${tipo} no soportado`);
  const crudo = zlib.inflateSync(Buffer.concat(idat)), fila = ancho * canales, px = Buffer.alloc(fila * alto);
  for (let y = 0; y < alto; y++) {
    const f = crudo[y * (fila + 1)], src = crudo.subarray(y * (fila + 1) + 1, (y + 1) * (fila + 1));
    for (let x = 0; x < fila; x++) {
      const a = x >= canales ? px[y * fila + x - canales] : 0, u = y ? px[(y - 1) * fila + x] : 0, c = y && x >= canales ? px[(y - 1) * fila + x - canales] : 0;
      const pr = (() => { const p0 = a + u - c, pa = Math.abs(p0 - a), pb = Math.abs(p0 - u), pc = Math.abs(p0 - c); return pa <= pb && pa <= pc ? a : pb <= pc ? u : c; })();
      px[y * fila + x] = (src[x] + [0, a, u, (a + u) >> 1, pr][f]) & 255;
    }
  }
  return { ancho, alto, canales, px };
}
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc = (buf) => { let c = -1; for (const v of buf) c = CRC[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function escribirPng(p, { ancho, alto, canales, px }) {
  const fila = ancho * canales, crudo = Buffer.alloc((fila + 1) * alto);
  for (let y = 0; y < alto; y++) px.copy(crudo, y * (fila + 1) + 1, y * fila, (y + 1) * fila);
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, "ascii"), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(ancho, 0); ihdr.writeUInt32BE(alto, 4); ihdr[8] = 8; ihdr[9] = canales === 4 ? 6 : 2;
  fs.writeFileSync(p, Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(crudo, { level: 9 })), chunk("IEND", Buffer.alloc(0))]));
}
function convertir(p, canales) {
  const img = leerPng(p);
  if (img.canales === canales) return;
  const n = img.ancho * img.alto, px = Buffer.alloc(n * canales);
  for (let i = 0; i < n; i++) { for (let c = 0; c < 3; c++) px[i * canales + c] = img.px[i * img.canales + c]; if (canales === 4) px[i * 4 + 3] = 255; }
  escribirPng(p, { ...img, canales, px });
}
function verificar(p, ancho, alto, tipo, maxBytes) {
  const b = fs.readFileSync(p), w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (w !== ancho || h !== alto || b[25] !== tipo || (maxBytes && b.length > maxBytes)) throw new Error(`${path.relative(RAIZ, p)}: ${w}×${h} tipo ${b[25]} ${b.length} B (esperado ${ancho}×${alto} tipo ${tipo})`);
  return `${path.relative(STORE, p)}  ${w}×${h}  ${tipo === 6 ? "RGBA" : "RGB"}  ${Math.round(b.length / 1024)} KB`;
}

const informe = [];
// Ícono: el de la marca, en PNG 32 bits con alfa (requisito de Play).
fs.mkdirSync(SALIDA, { recursive: true });
const icono = path.join(SALIDA, "icono-512.png");
fs.copyFileSync(path.join(RAIZ, "assets", "brand", "blindly-icono-512.png"), icono);
convertir(icono, 4);
informe.push(verificar(icono, 512, 512, 6, 1024 * 1024));

for (const idioma of IDIOMAS) {
  const feature = path.join(SALIDA, idioma, "feature-1024x500.png");
  exportar(plantilla("feature.html", { TEXTO: escapar(config.feature[idioma]) }), feature, 1024, 500);
  convertir(feature, 3);
  informe.push(verificar(feature, 1024, 500, 2));
  let n = 0;
  for (const c of config.capturas) {
    const raw = path.join(STORE, "raw", idioma, `${c.id}.png`);
    if (!fs.existsSync(raw)) { informe.push(`FALTA ${path.relative(STORE, raw)}`); continue; }
    n += 1;
    const destino = path.join(SALIDA, idioma, `${String(n).padStart(2, "0")}-${c.id}.png`);
    exportar(plantilla("captura.html", { TITULO: escapar(c.titulo[idioma]), CAPTURA: dataUri(raw), RECORTE_ARRIBA: String(config.recorte.arriba), RECORTE_ALTO: String(config.recorte.alto) }), destino, 1080, 1920);
    convertir(destino, 3);
    informe.push(verificar(destino, 1080, 1920, 2));
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(informe.join("\n"));
if (informe.some((l) => l.startsWith("FALTA"))) process.exitCode = 1;
