export type PreferenciasAudio = {
  silencio: boolean;
  musica: boolean;
  sonido: boolean;
  ambiente: "ninguno" | "casino";
  botonera: boolean;
  volumenMusica: number;
  volumenRonda: number;
  volumenAmbiente: number;
  volumenBotonera: number;
};
export type CategoriaAudio = "musica" | "efectos" | "ambiente" | "botonera";
export const AUDIO_INICIAL: PreferenciasAudio = {
  silencio: false,
  musica: true,
  sonido: true,
  ambiente: "ninguno",
  botonera: true,
  volumenMusica: 0.3,
  volumenRonda: 0.8,
  volumenAmbiente: 0.3,
  volumenBotonera: 0.5,
};
export function normalizarAudio(
  datos: Partial<PreferenciasAudio>,
): PreferenciasAudio {
  const nuevas = { ...AUDIO_INICIAL, ...datos };
  for (const clave of ["silencio", "musica", "sonido", "botonera"] as const)
    if (typeof nuevas[clave] !== "boolean")
      nuevas[clave] = AUDIO_INICIAL[clave];
  if (!["ninguno", "casino"].includes(nuevas.ambiente))
    nuevas.ambiente = "ninguno";
  for (const clave of [
    "volumenMusica",
    "volumenRonda",
    "volumenAmbiente",
    "volumenBotonera",
  ] as const)
    if (
      !Number.isFinite(nuevas[clave]) ||
      nuevas[clave] < 0 ||
      nuevas[clave] > 1
    )
      nuevas[clave] = AUDIO_INICIAL[clave];
  return nuevas;
}
export function volumenAudio(
  p: PreferenciasAudio,
  categoria: CategoriaAudio,
): number {
  if (p.silencio) return 0;
  return categoria === "musica"
    ? p.musica
      ? p.volumenMusica
      : 0
    : categoria === "efectos"
      ? p.sonido
        ? p.volumenRonda
        : 0
      : categoria === "ambiente"
        ? p.ambiente === "casino"
          ? p.volumenAmbiente
          : 0
        : p.botonera
          ? p.volumenBotonera
          : 0;
}
export type Reproductor = {
  play: () => void;
  pause: () => void;
  seekTo: (n: number) => Promise<void>;
  volume: number;
  loop: boolean;
};
export function configurarAudio(
  player: Reproductor,
  volumen: number,
  loop = false,
) {
  player.volume = volumen;
  player.loop = loop;
  if (volumen === 0) player.pause();
}
// Invalida operaciones pendientes al silenciar, desenfocar, salir o cambiar de sonido.
export function crearControlAudio(exclusivo = false) {
  let permitido = false,
    revision = 0;
  const players = new Set<Reproductor>();
  const intentos = new Map<Reproductor, number>();
  function pausaSegura(p: Reproductor) {
    // Expo puede liberar el SharedObject antes de ejecutar nuestra limpieza.
    try {
      p.pause();
    } catch {
      /* Ya liberado: no debe impedir la salida ni las otras pausas. */
    }
  }
  function pausar(p: Reproductor) {
    intentos.set(p, (intentos.get(p) ?? 0) + 1);
    pausaSegura(p);
  }
  function detener() {
    revision++;
    players.forEach(pausaSegura);
  }
  return {
    registrar: (p: Reproductor) => {
      players.add(p);
      return () => {
        players.delete(p);
        intentos.delete(p);
        revision++;
        pausaSegura(p);
      };
    },
    permitir: (valor: boolean) => {
      permitido = valor;
      if (!valor) detener();
    },
    detener,
    pausar,
    async reproducir(p: Reproductor, reiniciar = false): Promise<boolean> {
      if (!permitido || p.volume <= 0 || !players.has(p)) return false;
      if (exclusivo) detener();
      const vigente = revision;
      const intento = (intentos.get(p) ?? 0) + 1;
      intentos.set(p, intento);
      if (reiniciar) await p.seekTo(0);
      if (
        !permitido ||
        vigente !== revision ||
        intentos.get(p) !== intento ||
        p.volume <= 0 ||
        !players.has(p)
      )
        return false;
      p.play();
      return true;
    },
  };
}
