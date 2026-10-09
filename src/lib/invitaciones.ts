import AsyncStorage from "@react-native-async-storage/async-storage";
const CLAVE = "blindly.invitacion-liga.v1";
export function enlaceInvitacion(codigo: string) {
  if (!/^[A-F0-9]{20}$/.test(codigo)) throw new Error("INVITACION_INVALIDA");
  return `blindly://liga-unirse?codigo=${codigo}`;
}
// Solo acepta un código o un enlace de la ruta conocida; nunca navega a la URL pegada.
export function codigoInvitacion(valor: string): string | null {
  const directo = valor.trim().toUpperCase();
  if (/^[A-F0-9]{20}$/.test(directo)) return directo;
  try {
    const url = new URL(valor.trim());
    const ruta =
      url.protocol === "blindly:"
        ? `${url.hostname}${url.pathname}`
        : url.pathname.replace(/^\//, "");
    if (ruta !== "liga-unirse" && ruta !== "--/liga-unirse") return null;
    const codigo = url.searchParams.get("codigo")?.toUpperCase();
    return codigo && /^[A-F0-9]{20}$/.test(codigo) ? codigo : null;
  } catch {
    return null;
  }
}
export async function guardarInvitacion(codigo: string) {
  if (!/^[A-F0-9]{20}$/.test(codigo)) throw new Error("INVITACION_INVALIDA");
  await AsyncStorage.setItem(CLAVE, codigo);
}
export async function invitacionPendiente() {
  const valor = await AsyncStorage.getItem(CLAVE);
  return valor ? codigoInvitacion(valor) : null;
}
export async function borrarInvitacion(codigo: string) {
  // Un cierre de una invitación vieja no borra una nueva pendiente.
  if ((await AsyncStorage.getItem(CLAVE)) === codigo)
    await AsyncStorage.removeItem(CLAVE);
}
