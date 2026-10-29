import { SesionNativa } from "../components/SesionNativa";
import { Stack, ThemeProvider, DarkTheme } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { TemaProvider, useTema } from "../lib/TemaContext";
import { PreferenciasProvider, usePreferencias } from "../lib/Preferencias";
import { PantallaCarga } from "../components/PantallaCarga";
import { PlusProvider } from "../lib/PlusContext";
import { InicioProvider } from "../lib/InicioContext";
import { AvisosNativos } from "../components/AvisosNativos";
export const unstable_settings = { anchor: "(principal)" };
if (Platform.OS !== "web")
  void SplashScreen.preventAutoHideAsync().catch(() => {});
export function ContenidoApp() {
  const { tema, listo: temaListo } = useTema(), { listo: preferenciasListas } = usePreferencias();
  const hidratado = temaListo && preferenciasListas;
  const [lista, setLista] = useState(false);
  const alCargar = useCallback(() => setLista(true), []);
  useEffect(() => {
    if (!hidratado || Platform.OS === "web") return;
    let vivo = true;
    void SystemUI.setBackgroundColorAsync(tema.fondo).catch(() => {}).then(() => {
      if (vivo && lista) void SplashScreen.hideAsync().catch(() => {});
    });
    return () => { vivo = false; };
  }, [lista, hidratado, tema.fondo]);
  return <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: tema.fondo, card: tema.fondoTarjeta, text: tema.textoFuerte, primary: tema.acento, border: tema.borde } }}>
    <View style={{ flex: 1, backgroundColor: hidratado ? tema.fondo : "#0D1011" }}>
      <StatusBar style="light" />
      <SesionNativa />
      {hidratado && (lista ? <><AvisosNativos /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tema.fondo } }} /></> : <PantallaCarga onLoadEnd={alCargar} />)}
    </View>
  </ThemeProvider>;
}
export default function RootLayout() {
  return (
    <PlusProvider>
      <TemaProvider>
        <PreferenciasProvider>
          <InicioProvider>
            <ContenidoApp />
          </InicioProvider>
        </PreferenciasProvider>
      </TemaProvider>
    </PlusProvider>
  );
}
