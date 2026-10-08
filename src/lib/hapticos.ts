import { AppState, Platform } from "react-native";
type Momento = "allin" | "club" | "mvp" | "titulo" | "campeon" | "fecha";
const vistos = new Set<string>();
export async function vibrarMomento(momento: Momento, habilitado: boolean, clave: string) {
  if (!habilitado || Platform.OS === "web" || AppState.currentState !== "active" || vistos.has(clave)) return;
  vistos.add(clave);
  if (vistos.size > 128) vistos.delete(vistos.values().next().value!);
  try {
    const h = await import("expo-haptics");
    if (AppState.currentState !== "active") return;
    if (Platform.OS === "android") await h.performAndroidHapticsAsync(momento === "allin" ? h.AndroidHaptics.Long_Press : h.AndroidHaptics.Confirm);
    else if (momento === "allin") await h.impactAsync(h.ImpactFeedbackStyle.Heavy);
    else await h.notificationAsync(h.NotificationFeedbackType.Success);
  } catch { /* Sin motor o desactivado en el sistema: la acción sigue funcionando. */ }
}
