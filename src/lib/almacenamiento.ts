import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Nivel } from "./niveles";

const CLAVE_PRESET = "presetSeleccionado";
const CLAVE_PERSONALIZADO = "nivelesPersonalizados";

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