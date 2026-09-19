export type Nivel = {
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  minutos: number;
  esBreak?: boolean;
};

// Niveles de prueba: 15 segundos cada uno, para ver el avance rápido
export const NIVELES_PRUEBA: Nivel[] = [
  { smallBlind: 25, bigBlind: 50, minutos: 0.25 },
  { smallBlind: 50, bigBlind: 100, minutos: 0.25 },
  { smallBlind: 0, bigBlind: 0, minutos: 0.25, esBreak: true },
  { smallBlind: 100, bigBlind: 200, minutos: 0.25 },
];

// Niveles reales de una partida regular
export const NIVELES_REGULAR: Nivel[] = [
  { smallBlind: 25, bigBlind: 50, minutos: 15 },
  { smallBlind: 50, bigBlind: 100, minutos: 15 },
  { smallBlind: 75, bigBlind: 150, minutos: 15 },
  { smallBlind: 100, bigBlind: 200, minutos: 15 },
  { smallBlind: 0, bigBlind: 0, minutos: 10, esBreak: true },
  { smallBlind: 150, bigBlind: 300, minutos: 15 },
  { smallBlind: 200, bigBlind: 400, minutos: 15 },
  { smallBlind: 300, bigBlind: 600, minutos: 15 },
];

export type EstadoTimer = {
  indice: number;
  msRestantes: number;
  terminado: boolean;
};

// Dado el tiempo total transcurrido, devuelve en qué nivel estamos y cuánto falta
export function estadoActual(niveles: Nivel[], msTranscurridos: number): EstadoTimer {
  let resto = msTranscurridos;
  for (let i = 0; i < niveles.length; i++) {
    const duracion = niveles[i].minutos * 60_000;
    if (resto < duracion) {
      return { indice: i, msRestantes: duracion - resto, terminado: false };
    }
    resto -= duracion;
  }
  return { indice: niveles.length - 1, msRestantes: 0, terminado: true };
}

// Los breaks no cuentan como nivel: "Nivel 3" es el tercer nivel de juego
export function numeroDeNivel(niveles: Nivel[], indice: number) {
  return niveles.slice(0, indice + 1).filter((n) => !n.esBreak).length;
}

export function describir(nivel: Nivel) {
  return nivel.esBreak
    ? `Break de ${nivel.minutos} min`
    : `${nivel.smallBlind} / ${nivel.bigBlind}`;
}

export const NIVELES_TURBO: Nivel[] = [
  { smallBlind: 25, bigBlind: 50, minutos: 8 },
  { smallBlind: 50, bigBlind: 100, minutos: 8 },
  { smallBlind: 100, bigBlind: 200, minutos: 8 },
  { smallBlind: 0, bigBlind: 0, minutos: 5, esBreak: true },
  { smallBlind: 150, bigBlind: 300, minutos: 8 },
  { smallBlind: 200, bigBlind: 400, minutos: 8 },
  { smallBlind: 300, bigBlind: 600, minutos: 8 },
  { smallBlind: 500, bigBlind: 1000, minutos: 8 },
];

export const NIVELES_DEEP: Nivel[] = [
  { smallBlind: 25, bigBlind: 50, minutos: 20 },
  { smallBlind: 50, bigBlind: 100, minutos: 20 },
  { smallBlind: 75, bigBlind: 150, minutos: 20 },
  { smallBlind: 100, bigBlind: 200, minutos: 20 },
  { smallBlind: 0, bigBlind: 0, minutos: 10, esBreak: true },
  { smallBlind: 150, bigBlind: 300, minutos: 20 },
  { smallBlind: 200, bigBlind: 400, minutos: 20 },
  { smallBlind: 300, bigBlind: 600, minutos: 20 },
  { smallBlind: 400, bigBlind: 800, minutos: 20 },
  { smallBlind: 500, bigBlind: 1000, minutos: 20 },
];

export type Preset = { id: string; nombre: string; niveles: Nivel[] };

export const PRESETS: Preset[] = [
  { id: "turbo", nombre: "Turbo", niveles: NIVELES_TURBO },
  { id: "regular", nombre: "Regular", niveles: NIVELES_REGULAR },
  { id: "deep", nombre: "Deep stack", niveles: NIVELES_DEEP },
  { id: "prueba", nombre: "Prueba", niveles: NIVELES_PRUEBA },
];

// Cuántos ms pasan desde el arranque hasta que empieza el nivel `indice`
export function inicioDeNivel(niveles: Nivel[], indice: number) {
  let total = 0;
  for (let i = 0; i < indice; i++) {
    total += niveles[i].minutos * 60_000;
  }
  return Math.ceil(total);
}