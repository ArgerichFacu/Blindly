import { SesionNativa } from "../components/SesionNativa";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { TemaProvider } from "../lib/TemaContext";
import { PreferenciasProvider } from "../lib/Preferencias";
import { PantallaCarga } from "../components/PantallaCarga";
import { PlusProvider } from "../lib/PlusContext";
import { InicioProvider } from "../lib/InicioContext";
import { AvisosNativos } from "../components/AvisosNativos";
export const unstable_settings = { anchor: "index" };
if (Platform.OS !== "web")
  void SplashScreen.preventAutoHideAsync().catch(() => {});
export default function RootLayout() {
  const [lista, setLista] = useState(false);
  const alCargar = useCallback(() => setLista(true), []);
  const alMostrar = useCallback(() => {
    if (lista && Platform.OS !== "web")
      void SplashScreen.hideAsync().catch(() => {});
  }, [lista]);
  return (
    <PlusProvider>
      <TemaProvider>
        <PreferenciasProvider>
          <InicioProvider>
            <SesionNativa />
            {lista ? (
              <View style={{ flex: 1 }} onLayout={alMostrar}>
                <AvisosNativos />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#0A1713" },
                  }}
                />
              </View>
            ) : (
              <PantallaCarga onLoadEnd={alCargar} />
            )}
          </InicioProvider>
        </PreferenciasProvider>
      </TemaProvider>
    </PlusProvider>
  );
}
