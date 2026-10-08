import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import { asegurarSesion } from "./sesion";
import { identidadUsuario } from "./identidad";
import type { Idioma } from "./textos";

export const pushDisponible = Platform.OS !== "web" && Device.isDevice && process.env.EXPO_PUBLIC_PUSH_READY === "true";
// Mantiene el token asociado a la cuenta actual; nunca abre un permiso automáticamente.
export async function actualizarPushAutorizado(idioma: Idioma) {
  if (!pushDisponible) return;
  const inicial = (await supabase.auth.getSession()).data.session?.user;
  if (!inicial || !identidadUsuario(inicial).recuperable) return;
  const N = await import("expo-notifications"), permisos = await N.getPermissionsAsync();
  if (!permisos.granted && permisos.ios?.status !== N.IosAuthorizationStatus.PROVISIONAL) return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId !== "string") return;
  const token = (await N.getExpoPushTokenAsync({ projectId })).data;
  if ((await supabase.auth.getSession()).data.session?.user.id !== inicial.id) return;
  const { error } = await supabase.rpc("registrar_dispositivo_push", { p_token: token, p_idioma: idioma });
  if (error) throw error;
}
export async function activarPush(idioma: Idioma) {
  if (!pushDisponible) throw new Error("PUSH_NO_DISPONIBLE");
  if (!identidadUsuario(await asegurarSesion()).recuperable) throw new Error("CUENTA_REQUERIDA");
  const N = await import("expo-notifications");
  if (Platform.OS === "android") await N.setNotificationChannelAsync("club", { name: "Blindly", importance: N.AndroidImportance.DEFAULT });
  let permisos = await N.getPermissionsAsync();
  if (!permisos.granted && permisos.canAskAgain) permisos = await N.requestPermissionsAsync();
  if (!permisos.granted && permisos.ios?.status !== N.IosAuthorizationStatus.PROVISIONAL) throw new Error("PUSH_PERMISO_DENEGADO");
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId !== "string") throw new Error("PUSH_NO_DISPONIBLE");
  const token = (await N.getExpoPushTokenAsync({ projectId })).data;
  const { error } = await supabase.rpc("registrar_dispositivo_push", { p_token: token, p_idioma: idioma });
  if (error) throw error;
}
