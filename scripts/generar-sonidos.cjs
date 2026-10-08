// Sonidos originales sintetizados para Blindly, sin muestras ni grabaciones externas.
const fs = require("node:fs"),
  path = require("node:path");
const SR = 22050;
let semilla = 20261008;
const ruido = () => {
  semilla = (semilla * 1664525 + 1013904223) >>> 0;
  return semilla / 2147483648 - 1;
};
const seno = (f, t) => Math.sin(2 * Math.PI * f * t);
function pista(segundos) {
  return new Float64Array(Math.round(segundos * SR));
}
function sumar(datos, desde, duracion, fn) {
  for (let n = 0; n < Math.round(duracion * SR); n++) {
    const i = Math.round(desde * SR) + n;
    if (i >= 0 && i < datos.length) datos[i] += fn(n / SR, duracion);
  }
}
function escribir(nombre, datos, pico = 0.65) {
  let max = 0;
  for (const v of datos) max = Math.max(max, Math.abs(v));
  const buffer = Buffer.alloc(44 + datos.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(datos.length * 2, 40);
  for (let i = 0; i < datos.length; i++) {
    const fade = Math.min(
      1,
      i / (SR * 0.008),
      (datos.length - 1 - i) / (SR * 0.04),
    );
    buffer.writeInt16LE(
      Math.round((datos[i] / Math.max(max, 0.001)) * pico * fade * 32767),
      44 + i * 2,
    );
  }
  fs.writeFileSync(
    path.join(__dirname, "../assets/sounds", nombre + ".wav"),
    buffer,
  );
}
const ambiente = pista(20);
let cama = 0;
for (let i = 0; i < ambiente.length; i++) {
  cama = cama * 0.985 + ruido() * 0.015;
  const t = i / SR,
    fade = Math.min(1, t / 0.4, (20 - t) / 0.4);
  ambiente[i] = cama * 0.07 * fade;
}
for (let n = 0; n < 35; n++) {
  const t = 0.7 + ((n * 0.539) % 18.3);
  sumar(
    ambiente,
    t,
    0.075,
    (s) =>
      (seno(1900 + n * 17, s) * 0.06 + ruido() * 0.025) * Math.exp(-s * 90),
  );
  if (n % 3 === 0)
    sumar(
      ambiente,
      t + 0.12,
      0.18,
      (s) => ruido() * 0.025 * Math.sin((Math.PI * s) / 0.18),
    );
}
escribir("ambiente-casino", ambiente, 0.18);
const aplausos = pista(2.4);
for (let n = 0; n < 38; n++)
  sumar(
    aplausos,
    0.04 + n * 0.056,
    0.08,
    (s) => ruido() * Math.exp(-s * 65) * (0.3 + 0.4 * Math.abs(seno(12, s))),
  );
escribir("aplausos", aplausos);
const fichas = pista(1.2);
for (let n = 0; n < 9; n++)
  sumar(
    fichas,
    n * 0.095,
    0.12,
    (s) =>
      (seno(2300 + n * 41, s) + 0.4 * seno(3400, s) + 0.3 * ruido()) *
      Math.exp(-s * 45),
  );
escribir("fichas", fichas);
const grillos = pista(2);
for (let n = 0; n < 9; n++)
  sumar(
    grillos,
    0.06 + n * 0.19,
    0.09,
    (s) => seno(3700, s) * Math.sin((Math.PI * s) / 0.09) * 0.4,
  );
escribir("grillos", grillos, 0.45);
const bocina = pista(1.1);
sumar(
  bocina,
  0,
  0.9,
  (s) =>
    (seno(330, s) + 0.6 * seno(440, s) + 0.25 * seno(660, s)) *
    Math.min(1, s * 35) *
    Math.min(1, (0.9 - s) * 12),
);
escribir("bocina", bocina, 0.5);
const trombon = pista(1.6);
sumar(
  trombon,
  0,
  1.5,
  (s) =>
    (seno(360 - 65 * s, s) + 0.25 * seno(720 - 130 * s, s)) *
    Math.min(1, s * 18) *
    Math.min(1, (1.5 - s) * 5),
);
escribir("trombon", trombon, 0.5);
const caja = pista(1);
sumar(caja, 0, 0.25, (s) => ruido() * Math.exp(-s * 24));
sumar(
  caja,
  0.22,
  0.7,
  (s) => (seno(1800, s) + 0.4 * seno(2700, s)) * Math.exp(-s * 8),
);
escribir("caja", caja, 0.55);
const respeto = pista(1.8);
[523.25, 659.25, 783.99].forEach((f, n) =>
  sumar(respeto, n * 0.18, 1.2, (s) => seno(f, s) * Math.exp(-s * 4)),
);
escribir("respeto", respeto, 0.55);
console.log(
  "Generados 8 WAV PCM mono de 22050 Hz, originales y reproducibles.",
);
