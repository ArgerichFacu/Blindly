import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { AppState, Linking } from "react-native";
import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
} from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
import {
  PLUS_DISPONIBLE,
  PLUS_ENTITLEMENT,
  prepararCompras,
  tieneEntitlementPlus,
} from "./plus";
import { sincronizarPlusServidor } from "./plusServidor";

type EstadoPlus = {
  disponible: boolean;
  cargando: boolean;
  activo: boolean;
  vencimiento: string | null;
  error: unknown;
  comprar: () => Promise<void>;
  restaurar: () => Promise<void>;
  gestionar: () => Promise<void>;
  refrescar: () => Promise<void>;
};

const ContextoPlus = createContext<EstadoPlus>({
  disponible: false,
  cargando: false,
  activo: false,
  vencimiento: null,
  error: null,
  comprar: async () => {},
  restaurar: async () => {},
  gestionar: async () => {},
  refrescar: async () => {},
});

export function PlusProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [cargando, setCargando] = useState(PLUS_DISPONIBLE);
  const [error, setError] = useState<unknown>(null);
  const generacion = useRef(0), usuario = useRef<string | null>(null), montado = useRef(true);

  async function cargar(usuarioId?: string) {
    if (!PLUS_DISPONIBLE) {
      setCargando(false);
      return;
    }
    const turno = ++generacion.current;
    setCargando(true);
    setError(null);
    try {
      const id = usuarioId ?? (await asegurarSesion()).id;
      if (turno !== generacion.current || !montado.current) return;
      if (usuario.current !== id) setInfo(null);
      usuario.current = id;
      const nuevaInfo = await prepararCompras(id);
      if (turno !== generacion.current || !montado.current) return;
      setInfo(nuevaInfo);
      await sincronizarPlusServidor();
    } catch (e) {
      if (turno === generacion.current && montado.current) { setInfo(null); setError(e); }
    } finally {
      if (turno === generacion.current && montado.current) setCargando(false);
    }
  }

  useEffect(() => {
    montado.current = true;
    let vivo = true;
    let listener: CustomerInfoUpdateListener | null = null;
    if (!PLUS_DISPONIBLE) return;
    listener = (nueva) => {
      // Volver a consultar con el UUID actual evita usar un evento de otra
      // identidad durante logIn/logOut o restauración de compras.
      const turno = generacion.current;
      if (vivo) void Purchases.getAppUserID().then(id => {
        if (!vivo || turno !== generacion.current || id !== usuario.current) return;
        setInfo(nueva);
        void sincronizarPlusServidor().catch(e => {
          if (vivo && turno === generacion.current) setError(e);
        });
      }).catch(e => { if (vivo && turno === generacion.current) setError(e); });
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    const inicio = setTimeout(() => {
      if (vivo) void cargar();
    }, 0);
    const estado = AppState.addEventListener("change", siguiente => {
      if (vivo && siguiente === "active") void cargar();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!sesion?.user.id) {
        generacion.current++; usuario.current = null;
        setInfo(null);
        return;
      }
      if (usuario.current !== sesion.user.id) { generacion.current++; setInfo(null); }
      setTimeout(() => {
        if (vivo) void cargar(sesion.user.id);
      }, 0);
    });
    return () => {
      vivo = false;
      montado.current = false;
      estado.remove();
      clearTimeout(inicio);
      subscription.unsubscribe();
      if (listener) Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  async function ejecutar(operacion: () => Promise<unknown>) {
    const turno = ++generacion.current;
    setCargando(true);
    setError(null);
    try {
      await operacion();
      if (turno !== generacion.current || !montado.current) return;
      const nueva = await Purchases.getCustomerInfo();
      if (turno !== generacion.current || !montado.current) return;
      setInfo(nueva);
      await sincronizarPlusServidor();
    } catch (e) {
      if (turno === generacion.current && montado.current) { setInfo(null); setError(e); }
      throw e;
    } finally {
      if (turno === generacion.current && montado.current) setCargando(false);
    }
  }

  const valor: EstadoPlus = {
    disponible: PLUS_DISPONIBLE,
    cargando,
    activo: tieneEntitlementPlus(info),
    vencimiento:
      info?.entitlements.active[PLUS_ENTITLEMENT]?.expirationDate ?? null,
    error,
    comprar: () =>
      ejecutar(() =>
        RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: PLUS_ENTITLEMENT,
          displayCloseButton: true,
        }),
      ),
    restaurar: () => ejecutar(() => Purchases.restorePurchases()),
    gestionar: async () => {
      if (!info?.managementURL) throw new Error("PLUS_SIN_GESTION");
      await Linking.openURL(info.managementURL);
    },
    refrescar: () => cargar(),
  };

  return <ContextoPlus.Provider value={valor}>{children}</ContextoPlus.Provider>;
}

export function usePlus() {
  return useContext(ContextoPlus);
}
