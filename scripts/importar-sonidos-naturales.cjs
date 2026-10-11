// Los originales se descargan fuera de Git; los PCM finales y su procedencia se versionan.
const fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { escribir, informe, SR } = require('./generar-sonidos.cjs');
const [ffmpeg, fuentes] = process.argv.slice(2);
if (!ffmpeg || !fuentes) throw new Error('Uso: node scripts/importar-sonidos-naturales.cjs <ffmpeg.exe> <carpeta-fuentes>');
const carpeta = path.join(__dirname, '../assets/sounds');
const manifest = JSON.parse(fs.readFileSync(path.join(carpeta, 'fuentes.json'), 'utf8'));
for (const [id, fuente] of Object.entries(manifest)) {
  const input = path.join(fuentes, fuente.archivo);
  if (createHash('sha256').update(fs.readFileSync(input)).digest('hex') !== fuente.sha256Fuente) throw new Error(`${id}: la fuente no coincide con el manifiesto`);
  const filtros = ['silenceremove=start_periods=1:start_duration=0.002:start_threshold=-40dB'];
  if (fuente.tempo) filtros.push(...fuente.tempo.map(v => `atempo=${v}`));
  filtros.push(`atrim=duration=${fuente.duracion}`, 'highpass=f=65', 'lowpass=f=9500');
  const result = spawnSync(ffmpeg, ['-v', 'error', '-ss', String(fuente.inicio ?? 0), '-i', input, '-af', filtros.join(','), '-ac', '1', '-ar', String(SR), '-f', 's16le', 'pipe:1'], { maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${id}: ${result.stderr?.toString()}`);
  if (!result.stdout.length) throw new Error(`${id}: fuente vacía`);
  const muestras = result.stdout.length / 2, repeticiones = fuente.repeticiones ?? 1;
  const salto = Math.round((fuente.intervalo ?? 0) * SR);
  const pcm = new Float64Array(Math.max(Math.round(SR * .35), muestras + (repeticiones - 1) * salto));
  for (let r = 0; r < repeticiones; r++) {
    for (let i = 0; i < muestras; i++) pcm[r * salto + i] += result.stdout.readInt16LE(i * 2) / 32768;
  }
  escribir(id, pcm, fuente.pack === 'Party' ? .085 : .105, .5, true);
  console.log(`${id}: ${informe[id].segundos.toFixed(2)} s, pico ${informe[id].picoDbFS} dBFS`);
}
fs.writeFileSync(path.join(carpeta, 'niveles.json'), JSON.stringify(informe, null, 2) + '\n');
