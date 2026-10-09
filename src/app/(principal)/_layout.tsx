import { View } from "react-native";
import { Acabado } from "../../components/Superficie";
import { velo } from "../../lib/visual";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icono, type NombreIcono } from "../../components/Icono";
import { Introduccion } from "../../components/Introduccion";
import { useInicio } from "../../lib/InicioContext";
import { usePreferencias } from "../../lib/Preferencias";
import { useTema } from "../../lib/TemaContext";
export const unstable_settings = { initialRouteName: "index" };
export default function Principal() {
    const { tema } = useTema(), { t } = usePreferencias(), inicio = useInicio(), insets = useSafeAreaInsets();
    if (inicio.datos?.fase !== "terminado")
        return <Introduccion />;
    const pantallas: [
        string,
        string,
        NombreIcono
    ][] = [["index", "Inicio", "inicio"], ["ligas", "Ligas", "ligas"], ["perfil", "Perfil", "perfil"], ["opciones", "Config", "config"]];
    return <Tabs backBehavior="initialRoute" screenOptions={{ headerShown: false, tabBarActiveTintColor: tema.acento, tabBarInactiveTintColor: tema.textoSuave, tabBarHideOnKeyboard: true, tabBarBackground: () => <Acabado />, tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }, tabBarStyle: { backgroundColor: tema.fondoTarjeta, boxShadow: "0 -4px 20px rgba(0,0,0,.28)", borderTopColor: velo(tema.acento, "30"), height: 66 + insets.bottom, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 6) } }}>
    {pantallas.map(([name, titulo, icono]) => <Tabs.Screen key={name} name={name} options={{ title: t(titulo), tabBarIcon: ({ color, focused }) => <View style={{ minWidth: 46, height: 30, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: focused ? velo(tema.acento, "16") : "transparent", borderWidth: 1, borderColor: focused ? velo(tema.acento, "30") : "transparent" }}><Icono nombre={icono} color={String(color)} size={21}/></View> }}/>)}
  </Tabs>;
}
