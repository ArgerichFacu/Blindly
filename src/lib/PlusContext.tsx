import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Linking } from "react-native";
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

  async function cargar(usuarioId?: string) {
    if (!PLUS_DISPONIBLE) {
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const id = usuarioId ?? (await asegurarSesion()).id;
      setInfo(await prepararCompras(id));
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let vivo = true;
    let listener: CustomerInfoUpdateListener | null = null;
    if (!PLUS_DISPONIBLE) return;
    listener = (nueva) => {
      if (vivo) setInfo(nueva);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    const inicio = setTimeout(() => {
      if (vivo) void cargar();
    }, 0);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!sesion?.user.id) {
        setInfo(null);
        return;
      }
      setTimeout(() => {
        if (vivo) void cargar(sesion.user.id);
      }, 0);
    });
    return () => {
      vivo = false;
      clearTimeout(inicio);
      subscription.unsubscribe();
      if (listener) Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  async function ejecutar(operacion: () => Promise<unknown>) {
    setCargando(true);
    setError(null);
    try {
      await operacion();
      setInfo(await Purchases.getCustomerInfo());
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setCargando(false);
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
