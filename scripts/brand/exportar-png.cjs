// Exporta los SVG de assets/brand a PNG con Chrome headless (sin dependencias nuevas).
// Uso: node scripts/brand/exportar-png.cjs
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const DIR = path.join(__dirname, "..", "..", "assets", "brand");
const CHROME = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => p && fs.existsSync(p));
if (!CHROME) throw new Error("No encontré Chrome/Edge. Definí CHROME_PATH.");

// [svg, png, ancho, alto]
const SALIDAS = [
  ["blindly-icono-512.svg", "blindly-icono-512.png", 512, 512],
  ["blindly-icono-512.svg", "blindly-icono-1024.png", 1024, 1024],
  ["blindly-adaptive-foreground.svg", "blindly-adaptive-foreground.png", 1024, 1024],
  ["blindly-adaptive-background.svg", "blindly-adaptive-background.png", 1024, 1024],
  ["blindly-adaptive-monocromo.svg", "blindly-adaptive-monocromo.png", 1024, 1024],
  ["blindly-splash.svg", "blindly-splash.png", 1200, 0],
  ["blindly-wordmark.svg", "blindly-wordmark.png", 1200, 0],
  ["blindly-simbolo.svg", "blindly-favicon-48.png", 48, 0],
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blindly-marca-"));
for (const [origen, destino, ancho, altoPedido] of SALIDAS) {
  const contenido = fs.readFileSync(path.join(DIR, origen), "utf8");
  const [, vw, vh] = contenido.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const alto = altoPedido || Math.round((ancho * Number(vh)) / Number(vw));
  const html = path.join(tmp, "pagina.html");
  const cuerpo = contenido.replace(/width="[\d.]+" height="[\d.]+"/, `width="${ancho}" height="${alto}"`);
  fs.writeFileSync(html, `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${cuerpo}</body></html>`);
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--default-background-color=00000000", `--window-size=${ancho},${alto}`,
    `--screenshot=${path.join(DIR, destino)}`, `file:///${html.replace(/\\/g, "/")}`,
  ], { stdio: "ignore", timeout: 60000 });
  console.log(`${destino} ${ancho}×${alto}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
