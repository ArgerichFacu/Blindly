// Genera los SVG de marca de Blindly (dirección "Marcador") en assets/brand/.
// Letras construidas a mano: trazo 12, altura x 48 (y 38–86), ascendente hasta y 2, radio exterior 20 / interior 8.
// Uso: node scripts/brand/generar-marca.cjs  (después: node scripts/brand/exportar-png.cjs)
const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "..", "assets", "brand");
fs.mkdirSync(OUT, { recursive: true });

const C = { fondo: "#0E1512", marfil: "#F2F0E8", verde: "#5BD08A" };

// Cada letra: ancho y lista de [d, evenodd?] en coordenadas locales (x desde 0).
const L = {
  b: { w: 44, p: [["M0 2H12.5V86H0Z"], ["M12 38H24A20 20 0 0 1 44 58V66A20 20 0 0 1 24 86H12ZM12 50V74H24A8 8 0 0 0 32 66V58A8 8 0 0 0 24 50Z"]] },
  d: { w: 44, p: [["M31.5 2H44V86H31.5Z"], ["M32 38H20A20 20 0 0 0 0 58V66A20 20 0 0 0 20 86H32ZM32 50V74H20A8 8 0 0 1 12 66V58A8 8 0 0 1 20 50Z"]] },
  l: { w: 12, p: [["M0 2H12V86H0Z"]] },
  i: { w: 12, p: [["M0 38H12V86H0Z"], ["M3 20H9A3 3 0 0 1 12 23V29A3 3 0 0 1 9 32H3A3 3 0 0 1 0 29V23A3 3 0 0 1 3 20Z"]] },
  n: { w: 44, p: [["M0 38H12.5V86H0Z"], ["M12 38H24A20 20 0 0 1 44 58V86H32V58A8 8 0 0 0 24 50H12Z"]] },
  y: { w: 44, p: [["M0 38H12V66A8 8 0 0 0 20 74H32V38H44V98A20 20 0 0 1 24 118H6V106H24A8 8 0 0 0 32 98V86H20A20 20 0 0 1 0 66Z"]] },
};
const punto = (y) => `M3 ${y}H9A3 3 0 0 1 12 ${y + 3}V${y + 9}A3 3 0 0 1 9 ${y + 12}H3A3 3 0 0 1 0 ${y + 9}V${y + 3}A3 3 0 0 1 3 ${y}Z`;
const DOS_PUNTOS = { w: 12, p: [[punto(44) + punto(74)]] };

function componer(texto, gap, conDosPuntos, gapDosPuntos) {
  let x = 0;
  const letras = [];
  for (const ch of texto) {
    const g = L[ch];
    letras.push(g.p.map(([d]) => `<path transform="translate(${x} 0)" d="${d}" fill-rule="evenodd"/>`).join(""));
    x += g.w + gap;
  }
  x -= gap;
  let colon = "";
  if (conDosPuntos) {
    x += gapDosPuntos;
    colon = `<path transform="translate(${x} 0)" d="${DOS_PUNTOS.p[0][0]}"/>`;
    x += DOS_PUNTOS.w;
  }
  return { ancho: x, letras: letras.join(""), colon };
}

const sim = componer("b", 0, true, 14); // "b:" de 70 × 84 (y 2–86)
const pal = componer("blindly", 10, true, 12); // "blindly:" (y 2–118)
const M = 6; // margen del wordmark

function svg(w, h, cuerpo, fondo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${fondo ? `<rect width="${w}" height="${h}" fill="${fondo}"/>` : ""}${cuerpo}</svg>\n`;
}
// Escala y centra un grupo de ancho a × alto h0 (origen y0) dentro de un lienzo.
function centrar(lienzo, escala, ancho, y0, alto) {
  const tx = (lienzo - ancho * escala) / 2;
  const ty = (lienzo - alto * escala) / 2 - y0 * escala;
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${escala})`;
}
function simbolo(lienzo, escala, tinta, acento) {
  return `<g transform="${centrar(lienzo, escala, sim.ancho, 2, 84)}"><g fill="${tinta}">${sim.letras}</g><g fill="${acento}">${sim.colon}</g></g>`;
}

const archivos = {
  // Símbolo suelto (viewBox ajustado, sin fondo).
  "blindly-simbolo.svg": svg(sim.ancho, 84, `<g transform="translate(0 -2)"><g fill="${C.marfil}">${sim.letras}</g><g fill="${C.verde}">${sim.colon}</g></g>`),
  "blindly-simbolo-tinta.svg": svg(sim.ancho, 84, `<g transform="translate(0 -2)" fill="${C.fondo}">${sim.letras}${sim.colon}</g>`),
  // Wordmark (alto 2–118 → 116, más margen).
  "blindly-wordmark.svg": svg(pal.ancho + 2 * M, 116 + 2 * M, `<g transform="translate(${M} ${M - 2})"><g fill="${C.marfil}">${pal.letras}</g><g fill="${C.verde}">${pal.colon}</g></g>`),
  "blindly-wordmark-tinta.svg": svg(pal.ancho + 2 * M, 116 + 2 * M, `<g transform="translate(${M} ${M - 2})" fill="${C.fondo}">${pal.letras}${pal.colon}</g>`),
  // Ícono de Play 512 (Play aplica su propia máscara): símbolo al ~46 % del ancho.
  "blindly-icono-512.svg": svg(512, 512, simbolo(512, 3.1, C.marfil, C.verde), C.fondo),
  // Adaptive icon Android, 108 dp a 4× = 432 px. Contenido dentro del círculo seguro de 66 dp.
  "blindly-adaptive-foreground.svg": svg(432, 432, simbolo(432, 2.35, C.marfil, C.verde)),
  "blindly-adaptive-background.svg": svg(432, 432, "", C.fondo),
  "blindly-adaptive-monocromo.svg": svg(432, 432, simbolo(432, 2.35, "#FFFFFF", "#FFFFFF")),
  // Splash: wordmark transparente; el fondo lo pone expo-splash-screen (#0E1512).
  "blindly-splash.svg": svg(pal.ancho + 2 * M, 116 + 2 * M, `<g transform="translate(${M} ${M - 2})"><g fill="${C.marfil}">${pal.letras}</g><g fill="${C.verde}">${pal.colon}</g></g>`),
};
for (const [nombre, contenido] of Object.entries(archivos)) fs.writeFileSync(path.join(OUT, nombre), contenido);

// Verificación del círculo seguro del adaptive: semidiagonal del contenido ≤ 33 dp (de 108).
const semi = Math.hypot(sim.ancho * 2.35 / 2, 84 * 2.35 / 2) / 4;
if (semi > 33) throw new Error(`El símbolo se sale del círculo seguro: ${semi.toFixed(1)} dp`);
console.log(`SVG generados en assets/brand (wordmark ${pal.ancho}×116, símbolo ${sim.ancho}×84, semidiagonal adaptive ${semi.toFixed(1)} dp ≤ 33)`);
