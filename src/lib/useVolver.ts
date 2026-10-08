import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

// Register only while this secondary screen is focused. The main menu keeps
// Android's normal exit behaviour; screens above it always consume Back.
export function useVolver(activado = true) {
  const router = useRouter();
  const volver = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (!activado || Platform.OS !== "android") return;
      const escucha = BackHandler.addEventListener("hardwareBackPress", () => {
        volver();
        return true;
      });
      return () => escucha.remove();
    }, [activado, volver]),
  );
  return volver;
}
