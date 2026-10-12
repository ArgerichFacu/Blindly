import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { AppState, Linking } from "react-native";
import Purchases, { type CustomerInfo, type CustomerInfoUpdateListener } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";
import { PLUS_DISPONIBLE, PLUS_ENTITLEMENT, prepararCompras, prepararIdentidadCompra, obtenerOfertaPlus, tieneEntitlementPlus } from "./plus";
import { sincronizarPlusServidor } from "./plusServidor";
import { PLUS_DEMO } from "./plusDemo";
import {
  activarFounder, consultarFounder, guardarInteresFounder, guardarWaitlistFounder,
  registrarVistaFounder, exigirPagosReales, cacheFounder, estadoFounderVigente,
  CACHE_FOUNDER_MS, ahoraMonotono, type CacheFounder, type EstadoFounder, type FuentePlus, type PlanPlus,
} from "./founderPlus";

type EstadoPlus = {
  demostracion?: boolean; disponible: boolean; cargando: boolean; activo: boolean;
  gestionable: boolean; vencimiento: string | null; error: unknown; tipoAcceso: FuentePlus;
  identidad: string | null;
  trial: EstadoFounder | null; trialDisponible: boolean; trialExpiraEn: string | null;
  trialRestanteMs: number; pagosRealesActivos: boolean; lanzamientoDisponible: boolean;
  comprar: () => Promise<void>; restaurar: () => Promise<void>; gestionar: () => Promise<void>;
  refrescar: () => Promise<void>; iniciarPrueba: () => Promise<void>;
  registrarVista: () => Promise<void>; registrarInteres: (plan: PlanPlus) => Promise<void>;
  registrarWaitlist: () => Promise<boolean>;
};
const ContextoPlus = createContext<EstadoPlus>({
  disponible: false, cargando: false, activo: false, gestionable: false, vencimiento: null,
  error: null, tipoAcceso: "FREE", identidad: null, trial: null, trialDisponible: false, trialExpiraEn: null,
  trialRestanteMs: 0, pagosRealesActivos: false, lanzamientoDisponible: false,
  comprar: async () => {}, restaurar: async () => {}, gestionar: async () => {}, refrescar: async () => {},
  iniciarPrueba: async () => {}, registrarVista: async () => {}, registrarInteres: async () => {}, registrarWaitlist: async () => false,
});
export function PlusProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [cargando, setCargando] = useState(!PLUS_DEMO), [revisionPlay, setRevisionPlay] = useState(false);
  const [remoto, setRemoto] = useState<EstadoFounder | null>(null), [instante, setInstante] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const [cacheVisible, setCacheVisible] = useState<CacheFounder | null>(null);
  const [identidad, setIdentidad] = useState<string | null>(null);
  const generacion = useRef(0), usuario = useRef<string | null>(null), montado = useRef(true), operando = useRef(false);
  const cache = useRef<CacheFounder | null>(null), listener = useRef<CustomerInfoUpdateListener | null>(null);
  const recargaPendiente = useRef(false);
  function terminarOperacion(turno: number) {
    operando.current = false;
    if (turno === generacion.current && montado.current) setCargando(false);
    if (recargaPendiente.current && montado.current) {
      recargaPendiente.current = false;
      setTimeout(() => { if (montado.current) void cargar(); }, 0);
    }
  }
  function limpiar() { cache.current = null; setCacheVisible(null); setIdentidad(null); setRemoto(null); setInfo(null); setRevisionPlay(false); }
  function adoptar(estado: EstadoFounder, id: string) {
    cache.current = cacheFounder(estado, id); setInstante(ahoraMonotono()); setCacheVisible(cache.current); setIdentidad(id); setRemoto(estado); setRevisionPlay(estado.access_source === "PLAY_REVIEW");
  }
  function quitarListener() {
    if (listener.current) { Purchases.removeCustomerInfoUpdateListener(listener.current); listener.current = null; }
  }
  function escucharCompras() {
    if (listener.current) return;
    listener.current = nueva => {
      const turno = generacion.current;
      void Purchases.getAppUserID().then(id => {
        if (!montado.current || turno !== generacion.current || id !== usuario.current) return;
        setInfo(nueva);
        void sincronizarPlusServidor().catch(e => { if (montado.current && turno === generacion.current) setError(e); });
      }).catch(e => { if (montado.current && turno === generacion.current) setError(e); });
    };
    Purchases.addCustomerInfoUpdateListener(listener.current);
  }
  async function cargar(usuarioId?: string) {
    if (PLUS_DEMO) { setCargando(false); return; }
    if (operando.current) { recargaPendiente.current = true; return; }
    const turno = ++generacion.current; setCargando(true); setError(null);
    try {
      const id = usuarioId ?? (await asegurarSesion()).id;
      if (turno !== generacion.current || !montado.current) return;
      if (usuario.current !== id) limpiar();
      usuario.current = id;
      const estado = await consultarFounder();
      if (turno !== generacion.current || !montado.current) return;
      adoptar(estado, id);
      if (!estado.real_payments_enabled || !PLUS_DISPONIBLE || estado.access_source === "PLAY_REVIEW") {
        quitarListener(); setInfo(null); return;
      }
      const nuevaInfo = await prepararCompras(id);
      if (turno !== generacion.current || !montado.current) return;
      setInfo(nuevaInfo); escucharCompras(); await sincronizarPlusServidor();
    } catch (e) {
      if (turno === generacion.current && montado.current) {
        setInstante(ahoraMonotono());
        setInfo(null); setRevisionPlay(false); setError(e);
        // Sólo el trial ya comprobado admite caché breve, dentro de su plazo.
        if (cache.current?.estado.access_source !== "FOUNDER_TRIAL") { cache.current = null; setCacheVisible(null); setRemoto(null); }
        quitarListener();
      }
    } finally { if (turno === generacion.current && montado.current) setCargando(false); }
  }
  useEffect(() => {
    montado.current = true; let vivo = true;
    if (PLUS_DEMO) return;
    const inicio = setTimeout(() => { if (vivo) void cargar(); }, 0);
    const intervalo = setInterval(() => { if (vivo && AppState.currentState === "active") void cargar(); }, 60_000);
    const estado = AppState.addEventListener("change", siguiente => {
      if (!vivo) return;
      if (siguiente === "active") void cargar();
      else { generacion.current++; limpiar(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!sesion?.user.id) { generacion.current++; usuario.current = null; limpiar(); return; }
      if (usuario.current !== sesion.user.id) { generacion.current++; limpiar(); }
      setTimeout(() => { if (vivo) void cargar(sesion.user.id); }, 0);
    });
    const invalidar = () => { generacion.current++; };
    return () => {
      vivo = false; montado.current = false; invalidar(); estado.remove();
      clearTimeout(inicio); clearInterval(intervalo); subscription.unsubscribe(); quitarListener();
    };
    // Las referencias guardan la identidad/operación vigente para todos los eventos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (PLUS_DEMO || !remoto || !cache.current) return;
    const c = cache.current, ahora = ahoraMonotono();
    const demora = Math.max(1, Math.min(c.recibido + CACHE_FOUNDER_MS - ahora,
      remoto.active ? c.limiteTrial - ahora : CACHE_FOUNDER_MS));
    const timer = setTimeout(() => setInstante(ahoraMonotono()), demora);
    return () => clearTimeout(timer);
  }, [remoto]);
  async function operacionFounder(accion: () => Promise<EstadoFounder>) {
    if (PLUS_DEMO) throw new Error("PLUS_NO_CONFIGURADO");
    if (operando.current) throw new Error("PLUS_OPERACION_EN_CURSO");
    operando.current = true; const turno = ++generacion.current; setCargando(true); setError(null);
    try {
      const actual = await asegurarSesion();
      if (turno !== generacion.current || !montado.current) return null;
      if (usuario.current !== actual.id) limpiar(); usuario.current = actual.id;
      const estado = await accion();
      if (turno !== generacion.current || !montado.current || usuario.current !== actual.id) return null;
      adoptar(estado, actual.id); return estado;
    } catch (e) { if (turno === generacion.current && montado.current) setError(e); throw e; }
    finally { terminarOperacion(turno); }
  }
  async function ejecutar(operacion: (vigente: () => boolean) => Promise<unknown>) {
    if (PLUS_DEMO || !PLUS_DISPONIBLE) throw new Error("PLUS_NO_CONFIGURADO");
    if (operando.current) throw new Error("PLUS_OPERACION_EN_CURSO");
    operando.current = true; const turno = ++generacion.current; setCargando(true); setError(null);
    try {
      const actual = await asegurarSesion();
      const vigente = () => turno === generacion.current && montado.current && usuario.current === actual.id;
      if (turno !== generacion.current || !montado.current) return;
      await exigirPagosReales();
      if (turno !== generacion.current || !montado.current) return;
      await prepararIdentidadCompra(actual);
      if (turno !== generacion.current || !montado.current) return;
      usuario.current = actual.id; await operacion(vigente);
      if (!vigente()) return;
      const nueva = await Purchases.getCustomerInfo();
      if (!vigente()) return;
      setInfo(nueva); await sincronizarPlusServidor();
      if (!vigente()) return;
      const estado = await consultarFounder();
      if (!vigente()) return;
      adoptar(estado, actual.id); escucharCompras();
    } catch (e) { if (turno === generacion.current && montado.current) { setInfo(null); setError(e); } throw e; }
    finally { terminarOperacion(turno); }
  }
  // El tiempo es un input explícito del render, también para React Compiler.
  const estado = PLUS_DEMO ? null : estadoFounderVigente(cacheVisible, identidad, instante);
  const comercialDisponible = !PLUS_DEMO && PLUS_DISPONIBLE && estado?.real_payments_enabled === true;
  const revision = revisionPlay && estado?.access_source === "PLAY_REVIEW";
  const pagado = estado?.access_source === "REVENUECAT_PAID" || (comercialDisponible && tieneEntitlementPlus(info));
  const tipoAcceso: FuentePlus = PLUS_DEMO ? "PLUS_DEMO" : revision ? "PLAY_REVIEW" : pagado ? "REVENUECAT_PAID" : estado?.active ? "FOUNDER_TRIAL" : "FREE";
  const valor: EstadoPlus = {
    demostracion: PLUS_DEMO, disponible: comercialDisponible, cargando, activo: tipoAcceso !== "FREE", tipoAcceso, identidad,
    gestionable: comercialDisponible && !!info?.managementURL,
    vencimiento: tipoAcceso === "FOUNDER_TRIAL" ? estado?.expires_at ?? null : info?.entitlements.active[PLUS_ENTITLEMENT]?.expirationDate ?? estado?.paid_expires_at ?? null,
    error, trial: estado, trialDisponible: estado?.eligible === true, trialExpiraEn: estado?.expires_at ?? null,
    trialRestanteMs: estado?.restante ?? 0, pagosRealesActivos: estado?.real_payments_enabled === true,
    lanzamientoDisponible: estado !== null,
    comprar: () => ejecutar(async vigente => {
      const offering = await obtenerOfertaPlus(); if (!vigente()) return;
      await exigirPagosReales(); if (!vigente()) return;
      const resultado = await RevenueCatUI.presentPaywallIfNeeded({ offering, requiredEntitlementIdentifier: PLUS_ENTITLEMENT, displayCloseButton: true });
      if (resultado === PAYWALL_RESULT.ERROR) throw new Error("PLUS_ERROR_COMPRA");
    }),
    restaurar: () => ejecutar(async vigente => { await exigirPagosReales(); if (vigente()) await Purchases.restorePurchases(); }),
    gestionar: async () => {
      if (!info?.managementURL) throw new Error("PLUS_SIN_GESTION");
      const url = info.managementURL;
      await ejecutar(async vigente => { await exigirPagosReales(); if (vigente()) await Linking.openURL(url); });
    },
    refrescar: () => cargar(), iniciarPrueba: async () => { await operacionFounder(activarFounder); },
    registrarVista: async () => { if (!PLUS_DEMO) { await asegurarSesion(); await registrarVistaFounder(); } },
    registrarInteres: async plan => { await operacionFounder(() => guardarInteresFounder(plan)); },
    registrarWaitlist: async () => (await operacionFounder(guardarWaitlistFounder))?.contactable === true,
  };
  return <ContextoPlus.Provider value={valor}>{children}</ContextoPlus.Provider>;
}
export function usePlus() { return useContext(ContextoPlus); }
