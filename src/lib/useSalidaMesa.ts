import { useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useRef } from "react";
import { Alert, Platform } from "react-native";
import { usePreferencias } from "./Preferencias";
import { useVolver } from "./useVolver";

export function useSalidaMesa(proteger: boolean) {
  const navigation = useNavigation();
  const { t } = usePreferencias();
  const preguntando = useRef(false);
  const volver = useVolver();

  // SDK 57 exposes the navigation hook through this compatibility entry point.
  // It covers Android Back, our header button and native stack removal/gestures.
  usePreventRemove(proteger, ({ data }) => {
    if (preguntando.current) return;
    preguntando.current = true;
    const cancelar = () => {
      preguntando.current = false;
    };
    const confirmar = () => {
      preguntando.current = false;
      navigation.dispatch(data.action);
    };
    const titulo = t("¿Salir de la mesa?");
    const mensaje = t(
      "La partida sigue en curso. Salir de esta pantalla no te retira de la mano ni pausa la mesa. Podés volver con el código de sala.",
    );
    if (Platform.OS === "web") {
      if (globalThis.confirm(`${titulo}\n\n${mensaje}`)) confirmar();
      else cancelar();
      return;
    }
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: t("Seguir en la mesa"), style: "cancel", onPress: cancelar },
        { text: t("Salir de la mesa"), onPress: confirmar },
      ],
      { cancelable: true, onDismiss: cancelar },
    );
  });
  return volver;
}
