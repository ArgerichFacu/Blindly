const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  ts = require("typescript");
function cargar(file, deps = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      Set,
      Map,
      require: (id) => {
        assert.ok(Object.hasOwn(deps, id), id);
        return deps[id];
      },
    },
  );
  return exports;
}
const audio = cargar("src/lib/audio.ts"),
  botonera = cargar("src/lib/botonera.ts");
const json = (v) => JSON.parse(JSON.stringify(v));
const p = audio.normalizarAudio({ sonido: false, volumenMusica: 0.7 });
assert.equal(p.sonido, false);
assert.equal(p.volumenMusica, 0.7);
assert.equal(p.ambiente, "ninguno");
const invalida = audio.normalizarAudio({
  silencio: "si",
  musica: 0,
  volumenMusica: NaN,
  volumenBotonera: 3,
  ambiente: "url",
});
assert.deepEqual(json(invalida), json(audio.AUDIO_INICIAL));
for (const cat of ["musica", "ambiente", "efectos", "botonera"])
  assert.equal(audio.volumenAudio({ ...p, silencio: true }, cat), 0);
assert.equal(audio.volumenAudio(p, "efectos"), 0);
assert.equal(audio.volumenAudio({ ...p, ambiente: "casino" }, "ambiente"), 0.3);
assert.equal(audio.volumenAudio(p, "musica"), 0.7);
const config = botonera.normalizarBotonera({
  botoneraOrden: ["caja", "caja", "url"],
  botoneraFavoritos: ["respeto", "nada"],
  botoneraVisibles: ["caja", "respeto"],
});
assert.equal(config.botoneraOrden.length, 8);
assert.equal(new Set(config.botoneraOrden).size, 8);
assert.deepEqual(
  json(botonera.sonidosDisponibles(config, true).map((s) => s.id)),
  ["respeto", "caja"],
);
assert.deepEqual(
  json(botonera.sonidosDisponibles(config, false).map((s) => s.id)),
  ["aplausos", "fichas", "grillos", "campana"],
);
const snapshot = JSON.stringify(config);
botonera.sonidosDisponibles(config, false);
assert.equal(
  JSON.stringify(config),
  snapshot,
  "Expiry preserves customization",
);
assert.equal(
  botonera.sonidosDisponibles(
    botonera.normalizarBotonera({ botoneraVisibles: [] }),
    true,
  ).length,
  0,
);
// Names reached dynamically by t(sonido.nombre) must also have translations.
const textos = cargar("src/lib/textos.ts");
for (const s of botonera.SONIDOS) assert.ok(textos.textos[s.nombre], s.nombre);
function player() {
  const seeks = [];
  return {
    volume: 0.5,
    loop: false,
    plays: 0,
    pauses: 0,
    playing: false,
    play() {
      this.plays++;
      this.playing = true;
    },
    pause() {
      this.pauses++;
      this.playing = false;
    },
    seekTo() {
      return new Promise((resolve) => seeks.push(resolve));
    },
    seeks,
  };
}
(async () => {
  const c = audio.crearControlAudio(),
    a = player();
  const salir = c.registrar(a);
  assert.equal(await c.reproducir(a), false);
  c.permitir(true);
  assert.equal(a.plays, 0, "No autoplay");
  assert.equal(await c.reproducir(a), true);
  let prom = c.reproducir(a, true);
  c.permitir(false);
  c.permitir(true);
  a.seeks.shift()();
  assert.equal(
    await prom,
    false,
    "Mute invalidates delayed seek, even after unmute",
  );
  assert.equal(a.plays, 1);
  prom = c.reproducir(a, true);
  c.pausar(a);
  a.seeks.shift()();
  assert.equal(await prom, false, "Category pause cancels pending play");
  prom = c.reproducir(a, true);
  salir();
  a.seeks.shift()();
  assert.equal(await prom, false, "Unmount cancels pending play");
  const exclusive = audio.crearControlAudio(true),
    x = player(),
    y = player();
  exclusive.registrar(x);
  exclusive.registrar(y);
  exclusive.permitir(true);
  const first = exclusive.reproducir(x, true),
    second = exclusive.reproducir(y, true);
  x.seeks.shift()();
  y.seeks.shift()();
  assert.equal(await first, false);
  assert.equal(await second, true);
  assert.equal(x.plays, 0);
  assert.equal(y.plays, 1);
  assert.ok(x.pauses > 0);
  audio.configurarAudio(y, 0, true);
  assert.equal(y.loop, true);
  assert.equal(await exclusive.reproducir(y), false);
  // Exercise the actual focus/AppState hook, not a second lifecycle implementation.
  let focus,
    listener,
    removed = 0,
    cleanupUnmount;
  const hooked = cargar("src/lib/useControlAudio.ts", {
    "./audio": audio,
    react: {
      useState: (f) => [f()],
      useCallback: (f) => f,
      useEffect: (f) => {
        cleanupUnmount = f();
      },
    },
    "expo-router": {
      useFocusEffect: (f) => {
        focus = f;
      },
    },
    "react-native": {
      AppState: {
        currentState: "active",
        addEventListener: (_, f) => {
          listener = f;
          return { remove: () => removed++ };
        },
      },
    },
  });
  const control = hooked.useControlAudio(true),
    z = player();
  control.registrar(z);
  const blur = focus();
  assert.equal(await control.reproducir(z), true);
  prom = control.reproducir(z, true);
  listener("background");
  const pausasAlSalir = z.pauses;
  // El módulo nativo de Expo reanuda antes del evento active de React Native.
  z.play();
  listener("active");
  assert.ok(z.pauses > pausasAlSalir, "Foreground stops native auto-resume");
  assert.equal(z.playing, false, "Native auto-resume is actually paused");
  z.seeks.shift()();
  assert.equal(await prom, false);
  assert.equal(z.plays, 2, "Hook does not add playback to native auto-resume");
  assert.equal(await control.reproducir(z), true);
  blur();
  assert.equal(removed, 1);
  assert.equal(await control.reproducir(z), false);
  cleanupUnmount();
  const released = player(),
    releasedControl = audio.crearControlAudio();
  const unregister = releasedControl.registrar(released);
  released.pause = () => {
    throw new Error("SharedObject released");
  };
  assert.doesNotThrow(() => releasedControl.detener());
  assert.doesNotThrow(
    unregister,
    "Expo cleanup order does not break navigation",
  );
  // Local WAV files: valid PCM, bounded amplitude, fades at loop edges, no missing assets.
  for (const id of [
    "ambiente-casino",
    ...botonera.SONIDOS.filter((s) => s.id !== "campana").map((s) => s.id),
  ]) {
    const buf = fs.readFileSync(`assets/sounds/${id}.wav`);
    assert.equal(buf.toString("ascii", 0, 4), "RIFF");
    assert.equal(buf.toString("ascii", 8, 12), "WAVE");
    assert.equal(buf.readUInt16LE(20), 1);
    assert.equal(buf.readUInt16LE(22), 1);
    assert.equal(buf.readUInt32LE(24), 22050);
    assert.equal(buf.readUInt16LE(34), 16);
    assert.equal(buf.readUInt32LE(40), buf.length - 44);
    const duration = (buf.length - 44) / 44100;
    assert.ok(duration >= 1 && duration <= 20);
    let peak = 0,
      energy = 0;
    for (let i = 44; i < buf.length; i += 2) {
      const v = buf.readInt16LE(i);
      peak = Math.max(peak, Math.abs(v));
      energy += v * v;
    }
    assert.ok(peak > 100 && peak < 30000);
    assert.ok(energy > 0);
    assert.equal(buf.readInt16LE(44), 0);
    assert.ok(Math.abs(buf.readInt16LE(buf.length - 2)) < 100);
  }
  console.log(
    "Audio: legacy preferences, mute, expiry, exclusive playback, delayed operations, focus/background and 8 local assets OK",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
