import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { asegurarSesion } from "./sesion";
import { identidadUsuario } from "./identidad";
import { misLigas, detalleLiga, type ResumenLiga, type DetalleLiga } from "./ligas";
import { elegirLigaHome } from "./seleccionLiga";
import { useLigaEnVivo } from "./useLigaEnVivo";
export const claveUltimaLiga = (usuario: string) => `blindly.ultima-liga.v1:${usuario}`;
export function useClubes(soloHome = false) {
    const [datos, setDatos] = useState<{
        usuario: string;
        protegida: boolean;
        ligas: ResumenLiga[];
        detalles: Record<string, DetalleLiga>;
        elegida: string | null;
    } | null>(null);
    const [error, setError] = useState<unknown>(null), [revision, setRevision] = useState(0);
    useFocusEffect(useCallback(() => {
        void revision;
        let activo = true;
        setError(null);
        void (async () => {
            const usuario = await asegurarSesion(), protegida = identidadUsuario(usuario).recuperable;
            // Nunca mostrar datos de otro usuario después de recuperar una cuenta.
            if (activo)
                setDatos(anterior => anterior?.usuario === usuario.id ? anterior : null);
            const ligas = protegida ? await misLigas() : [];
            const ultima = await AsyncStorage.getItem(claveUltimaLiga(usuario.id));
            const elegida = elegirLigaHome(ligas, ultima);
            const solicitadas = soloHome ? (elegida ? [elegida] : []) : ligas;
            const resultados = await Promise.allSettled(solicitadas.map(l => detalleLiga(l.id)));
            const detalles: Record<string, DetalleLiga> = {};
            resultados.forEach((r, i) => { if (r.status === "fulfilled")
                detalles[solicitadas[i].id] = r.value; });
            if (activo) {
                setDatos({ usuario: usuario.id, protegida, ligas, detalles, elegida: elegida?.id ?? null });
                const fallo = resultados.find(r => r.status === "rejected");
                if (fallo?.status === "rejected")
                    setError(fallo.reason);
            }
        })().catch(e => { if (activo)
            setError(e); });
        return () => { activo = false; };
    }, [revision, soloHome]));
    const recargar = useCallback(() => setRevision(v => v + 1), []);
    const observada = datos?.elegida ? datos.detalles[datos.elegida] : null;
    useLigaEnVivo(soloHome ? observada?.liga.id : undefined, observada?.temporada?.id ?? null, recargar);
    return { datos, error, recargar };
}
