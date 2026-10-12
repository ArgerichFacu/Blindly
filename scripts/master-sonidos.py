"""Edición offline de grabaciones CC0. No genera tonos ni audio sintético.

Requiere numpy/scipy/pyloudnorm en el entorno de herramientas, no en la app.
Uso: python scripts/master-sonidos.py <ffmpeg.exe> <carpeta-fuentes>
"""
import hashlib, json, math, subprocess, sys, wave
from pathlib import Path
import numpy as np
import pyloudnorm as pyln

ffmpeg, inputs = sys.argv[1:]
assets = Path(__file__).resolve().parent.parent / 'assets/sounds'
sources = json.loads((assets / 'fuentes.json').read_text(encoding='utf8'))
levels = {}
rate = 22050
for name, source in sources.items():
    original = Path(inputs) / source['archivo']
    assert hashlib.sha256(original.read_bytes()).hexdigest() == source['sha256Fuente'], name
    # Eliminar sólo silencio inicial; no acelerar instrumentos ni voces.
    filters = f"silenceremove=start_periods=1:start_duration=0.002:start_threshold={source.get("umbralSilencioDb", -38)}dB,atrim=duration={source['duracion']},acompressor=threshold=0.08:ratio=3:attack=0.5:release=50:knee=2"
    result = subprocess.run([ffmpeg, '-v', 'error', '-ss', str(source.get('inicio', 0)), '-i', str(original), '-af', filters, '-ac', '1', '-ar', str(rate), '-f', 'f32le', 'pipe:1'], check=True, capture_output=True)
    samples = np.frombuffer(result.stdout, dtype='<f4').astype(np.float64)
    assert len(samples) > rate * .2, f'{name}: audio vacío o demasiado breve'
    samples -= np.mean(samples)
    # Fundidos mínimos, manteniendo dinámica y velocidad originales.
    attack = min(round(rate * .003), len(samples))
    release = min(round(rate * .025), len(samples))
    samples[:attack] *= np.linspace(0, 1, attack)
    samples[-release:] *= np.linspace(1, 0, release)
    seconds = len(samples) / rate
    block = .4 if seconds >= .4 else .2
    meter = pyln.Meter(rate, block_size=block)
    loudness = float(meter.integrated_loudness(samples))
    assert math.isfinite(loudness), f'{name}: sólo silencio'
    # -23 LUFS, pico <= -3 dBFS, compresión moderada anterior, sin hard clipping.
    gain = min(10 ** ((-23 - loudness) / 20), 10 ** (-3 / 20) / np.max(np.abs(samples)))
    samples *= gain
    pcm = np.round(samples * 32767).astype('<i2')
    with wave.open(str(assets / f'{name}.wav'), 'wb') as out:
        out.setnchannels(1); out.setsampwidth(2); out.setframerate(rate); out.writeframes(pcm.tobytes())
    levels[name] = {'segundos':seconds, 'picoDbFS':round(float(20*np.log10(np.max(np.abs(pcm))/32767)),2), 'loudnessK':round(float(meter.integrated_loudness(pcm.astype(float)/32767)),2), 'ventanaSegundos':block, 'gananciaDb':round(20*math.log10(gain),2), 'sha256Final':hashlib.sha256((assets/f'{name}.wav').read_bytes()).hexdigest()}
    print(name, levels[name])
(assets/'niveles.json').write_text(json.dumps(levels, indent=2)+'\n', encoding='utf8')
