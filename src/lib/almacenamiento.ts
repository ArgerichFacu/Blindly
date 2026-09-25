import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Nivel } from "./niveles";

const CLAVE_PRESET = "presetSeleccionado";
const CLAVE_PERSONALIZADO = "nivelesPersonalizados";
const CLAVE_DENOMINACIONES = "denominacionesFichas";
const DENOMINACIONES_DEFECTO = [25, 100, 500, 1000, 5000];

export async function cargarPresetId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CLAVE_PRESET);
  } catch {
    return null;
  }
}

export async function guardarPresetId(id: string) {
  try {
    await AsyncStorage.setItem(CLAVE_PRESET, id);
  } catch {}
}

export async function cargarPersonalizado(): Promise<Nivel[] | null> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_PERSONALIZADO);
    if (!texto) return null;
    const datos = JSON.parse(texto);
    if (!Array.isArray(datos) || datos.length === 0) return null;
    return datos as Nivel[];
  } catch {
    return null;
  }
}

export async function guardarPersonalizado(niveles: Nivel[]) {
  await AsyncStorage.setItem(CLAVE_PERSONALIZADO, JSON.stringify(niveles));
}

export async function cargarDenominaciones(): Promise<number[]> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_DENOMINACIONES);
    if (!texto) return DENOMINACIONES_DEFECTO;
    const datos = JSON.parse(texto);
    if (!Array.isArray(datos) || datos.length === 0) return DENOMINACIONES_DEFECTO;
    return datos
      .slice(0, 5)
      .map((n) => Number(n))
      .filter((n) => n > 0);
  } catch {
    return DENOMINACIONES_DEFECTO;
  }
}

export async function guardarDenominaciones(valores: number[]) {
  await AsyncStorage.setItem(CLAVE_DENOMINACIONES, JSON.stringify(valores.slice(0, 5)));
}

const CLAVE_TEMA = "temaId";
const CLAVE_SONIDO = "sonidoActivado";

export async function cargarTemaId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CLAVE_TEMA);
  } catch {
    return null;
  }
}

export async function guardarTemaId(id: string) {
  try {
    await AsyncStorage.setItem(CLAVE_TEMA, id);
  } catch {}
}

export async function cargarSonidoActivado(): Promise<boolean> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_SONIDO);
    return texto === null ? true : texto === "1";
  } catch {
    return true;
  }
}

export async function guardarSonidoActivado(activado: boolean) {
  try {
    await AsyncStorage.setItem(CLAVE_SONIDO, activado ? "1" : "0");
  } catch {}
}