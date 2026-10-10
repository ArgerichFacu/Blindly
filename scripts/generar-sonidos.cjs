// Síntesis original determinista; sin grabaciones ni muestras de terceros.
const fs = require('node:fs'), path = require('node:path');
const SR = 22050, carpeta = path.join(__dirname, '../assets/sounds'), informe = {};
let semilla = 20261009;
const ruido = () => { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 2147483648 - 1; };
const seno = (f, t) => Math.sin(2 * Math.PI * f * t);
const pista = s => new Float64Array(Math.round(s * SR));
function sumar(d, inicio, duracion, fn) {
  for (let n = 0; n < Math.round(duracion * SR); n++) {
    const i = Math.round(inicio * SR) + n;
    if (i >= 0 && i < d.length) d[i] += fn(n / SR, duracion);
  }
}
function ficha(d, t, fuerza = 1, tono = 1) {
  sumar(d, t, .18, s => fuerza * ((seno(1420 * tono, s) + .4 * seno(2231 * tono, s) + .18 * seno(3187 * tono, s)) * Math.exp(-s * 48) + ruido() * .6 * Math.exp(-s * 140)));
}
function papel(d, t, duracion = .16, fuerza = 1) {
  let previo = 0;
  sumar(d, t, duracion, s => { const actual = ruido(); const v = (actual - previo) * .5; previo = actual; return v * fuerza * Math.sin(Math.PI * s / duracion) * (.5 + .5 * Math.abs(seno(48, s))); });
}
function golpe(d, t, fuerza = 1) {
  let filtro = 0;
  sumar(d, t, .24, s => { filtro = .7 * filtro + .3 * ruido(); return fuerza * (filtro + .4 * seno(150, s)) * Math.exp(-s * 28); });
}
function escribir(nombre, d, objetivo = .105, limite = .5) {
  const media = d.reduce((a, v) => a + v, 0) / d.length;
  let pico = 0;
  for (let i = 0; i < d.length; i++) {
    d[i] = (d[i] - media) * Math.min(1, i / (SR * .003), (d.length - 1 - i) / (SR * .025));
    pico = Math.max(pico, Math.abs(d[i]));
  }
  // Compresión suave de transitorios: evita que un único golpe limite todo el clip.
  if (nombre !== 'ambiente-casino') {
    const rmsGlobal = Math.sqrt(d.reduce((a, v) => a + v * v, 0) / d.length);
    const techo = rmsGlobal * 2.5;
    pico = 0;
    for (let i = 0; i < d.length; i++) {
      d[i] = techo * Math.tanh(d[i] / techo);
      pico = Math.max(pico, Math.abs(d[i]));
    }
  }
  // RMS de ventanas activas: 20 ms, gate relativo -30 dB. No LUFS certificado.
  const ventanas = [];
  for (let i = 0; i < d.length; i += 441) {
    let e = 0; const n = Math.min(441, d.length - i);
    for (let j = 0; j < n; j++) e += d[i + j] ** 2;
    ventanas.push(e / n);
  }
  const umbral = Math.max(...ventanas) * .001, activas = ventanas.filter(e => e > umbral);
  const rms = Math.sqrt(activas.reduce((a, v) => a + v, 0) / activas.length);
  const ganancia = Math.min(objetivo / rms, limite / pico);
  const b = Buffer.alloc(44 + d.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(b.length - 8, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(d.length * 2, 40);
  for (let i = 0; i < d.length; i++) b.writeInt16LE(Math.round(d[i] * ganancia * 32767), 44 + i * 2);
  fs.writeFileSync(path.join(carpeta, nombre + '.wav'), b);
  informe[nombre] = { segundos: d.length / SR, picoDbFS: +(20 * Math.log10(pico * ganancia)).toFixed(2), rmsActivoDbFS: +(20 * Math.log10(rms * ganancia)).toFixed(2) };
}
const fichas = pista(.85);
for (let i = 0; i < 6; i++) ficha(fichas, .035 + i * .095, .7 + i * .05, 1 + i * .018);
escribir('fichas', fichas);
const carta = pista(.45); papel(carta, .035, .19, 1); golpe(carta, .23, .3); escribir('carta', carta);
const barajar = pista(.95); for (let i = 0; i < 10; i++) papel(barajar, .03 + i * .065, .09, .65); escribir('barajar', barajar);
const campana = pista(1.15);
sumar(campana, .02, 1.1, s => (seno(880, s) + .3 * seno(1471, s) + .12 * seno(2347, s)) * Math.exp(-s * 7)); escribir('campana', campana);
const aplausos = pista(1.25);
for (let i = 0; i < 20; i++) sumar(aplausos, .02 + i * .047, .13, s => ruido() * Math.exp(-s * 45) * (.5 + .2 * seno(160, s)));
escribir('aplausos', aplausos);
const respeto = pista(.65); golpe(respeto, .04, .8); golpe(respeto, .23, .65); escribir('respeto', respeto);
const allin = pista(.9); golpe(allin, .05, 1); for (let i = 0; i < 5; i++) ficha(allin, .12 + i * .08, .6, .85 + i * .018); escribir('allin', allin);
const bust = pista(.55); golpe(bust, .04, .7); ficha(bust, .16, .25, .8); escribir('bust', bust);
const grillos = pista(1.15); for (let i = 0; i < 5; i++) sumar(grillos, .04 + i * .19, .075, s => seno(3100, s) * Math.sin(Math.PI * s / .075)); escribir('grillos', grillos, .085);
const bocina = pista(.8); sumar(bocina, .02, .65, s => (seno(330, s) + .5 * seno(440, s) + .15 * seno(660, s)) * Math.min(1, s * 30, (.65 - s) * 12)); escribir('bocina', bocina, .085);
const trombon = pista(1.15); sumar(trombon, .02, 1, s => (Math.sin(2 * Math.PI * (360 * s - 55 * s * s)) + .2 * Math.sin(4 * Math.PI * (360 * s - 55 * s * s))) * Math.min(1, s * 20, (1 - s) * 8)); escribir('trombon', trombon, .085);
const caja = pista(.85); golpe(caja, .02, .6); sumar(caja, .2, .6, s => (seno(1200, s) + .25 * seno(1967, s)) * Math.exp(-s * 10)); escribir('caja', caja, .085);
// Room tone y actividad espaciada, costura de loop con fade suave.
const ambiente = pista(20); let cama = 0;
for (let i = 0; i < ambiente.length; i++) { cama = .99 * cama + .01 * ruido(); ambiente[i] = cama * .2 * Math.min(1, i / (SR * .5), (ambiente.length - 1 - i) / (SR * .5)); }
for (let i = 0; i < 8; i++) { const t = .9 + i * 2.25; ficha(ambiente, t, .08, .88 + i * .01); if (i % 2 === 0) papel(ambiente, t + .55, .22, .035); }
escribir('ambiente-casino', ambiente, .015, .07);
fs.writeFileSync(path.join(carpeta, 'niveles.json'), JSON.stringify(informe, null, 2) + '\n');
console.log('13 WAV originales, PCM mono 22050 Hz. Reacciones 0,45–1,25 s; picos ≤ −6 dBFS.');
