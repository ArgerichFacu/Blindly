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
    return <Tabs backBehavior="initialRoute" screenOptions={{ headerShown: false, tabBarActiveTintColor: tema.acento, tabBarInactiveTintColor: tema.textoSuave, tabBarHideOnKeyboard: true, tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }, tabBarStyle: { backgroundColor: tema.fondo, borderTopColor: tema.borde, height: 60 + insets.bottom, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 6) } }}>
    {pantallas.map(([name, titulo, icono]) => <Tabs.Screen key={name} name={name} options={{ title: t(titulo), tabBarIcon: ({ color }) => <Icono nombre={icono} color={String(color)}/> }}/>)}
  </Tabs>;
}
