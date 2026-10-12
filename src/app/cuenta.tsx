import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { User } from "@supabase/supabase-js";
import { View, type ScrollView } from "react-native";
import { Pantalla, Texto, Tarjeta, Campo, Boton, Etiqueta } from "../components/Controles";
import { LogoBlindly } from "../components/LogoBlindly";
import { asegurarSesion, crearClaveRecuperacion, recuperarConClave, cuentaConClave, eliminarCuenta } from "../lib/sesion";
import { registrarEmail, confirmarEmailPassword, entrarEmail, cerrarSesion, solicitarReset, guardarPassword, continuarGoogle, validarPassword, leerPendiente } from "../lib/autenticacion";
import { supabase } from "../lib/supabase";
import { usePreferencias } from "../lib/Preferencias";
import { usePlus } from "../lib/PlusContext";
import { useInicio } from "../lib/InicioContext";
type Modo = "login" | "registro" | "verificar" | "reset" | "password" | "cuenta" | "legacy";
export default function Cuenta() {
  const { t, mensajeError } = usePreferencias(), router = useRouter(), plus = usePlus(), inicio = useInicio();
  const { inicio: origen, volver, liga, codigo: codigoClub, nombre: nombreMesa, seccion, temporada, accion } = useLocalSearchParams<{ inicio?: string; volver?: string; liga?: string; codigo?: string; nombre?: string; seccion?: string; temporada?: string; accion?: string }>();
  const desdeInicio = origen === "1";
  const contextoAuth = useMemo(() => ({ inicio: origen, volver, liga, codigo: codigoClub, nombre: nombreMesa, seccion, temporada }), [origen, volver, liga, codigoClub, nombreMesa, seccion, temporada]);
  const [usuario, setUsuario] = useState<User | null>(null), [modo, setModo] = useState<Modo>(accion === "password" ? "password" : "login"),
    [email, setEmail] = useState(""), [nombre, setNombre] = useState(""), [password, setPassword] = useState(""), [confirmacion, setConfirmacion] = useState(""),
    [codigo, setCodigo] = useState(""), [clave, setClave] = useState(""), [claveGenerada, setClaveGenerada] = useState(""),
    [ocupado, setOcupado] = useState(false), [error, setError] = useState<unknown>(null), [aviso, setAviso] = useState(""),
    [seguridad, setSeguridad] = useState(false), [confirmarBorrado, setConfirmarBorrado] = useState(false), [revision, setRevision] = useState(0);
  const cerrojo = useRef(false), vivo = useRef(true), ultimoUsuario = useRef<string | null>(null), googleInicial = useRef(false);
  const scroll = useRef<ScrollView | null>(null);
  useEffect(() => {
    if (error || aviso) scroll.current?.scrollTo({ y: 0, animated: true });
  }, [error, aviso]);
  const plusActual = useRef(plus);
  useEffect(() => { plusActual.current = plus; }, [plus]);
  const googleConectado = usuario?.identities?.some(i => i.provider === "google") ?? false;
  const regresar = () => {
    if (volver === "unirse" && codigoClub && /^[A-Z2-9]{5}$/.test(codigoClub)) router.replace({ pathname: "/unirse", params: { codigo: codigoClub, nombre: nombreMesa?.slice(0,30) ?? "" } });
    else if (volver === "liga" && liga) router.replace({ pathname: "/liga", params: { id: liga, seccion, temporada } });
    else if (volver === "liga-unirse" && codigoClub && /^[A-F0-9]{20}$/.test(codigoClub)) router.replace({ pathname: "/liga-unirse", params: { codigo: codigoClub } });
    else if (volver && ["ligas","puntuacion","plus","head-to-head","liga-nueva"].includes(volver)) router.replace(`/${volver}` as "/ligas");
    else router.replace("/");
  };
  useEffect(() => {
    vivo.current = true;
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (vivo.current) {
        const id = sesion?.user.id ?? null;
        if (ultimoUsuario.current !== id) { setPassword(""); setConfirmacion(""); }
        ultimoUsuario.current = id; setUsuario(sesion?.user ?? null);
      }
    });
    return () => { vivo.current = false; data.subscription.unsubscribe(); };
  }, []);
  const ejecutar = useCallback(async (fn: () => Promise<void>) => {
    if (cerrojo.current) return;
    cerrojo.current = true; setOcupado(true); setError(null); setAviso("");
    try { await fn(); } catch (e) { if (vivo.current) setError(e); }
    finally { cerrojo.current = false; if (vivo.current) setOcupado(false); }
  }, []);
  const listo = useCallback(async (u: User) => {
    if (!vivo.current) return;
    setUsuario(u); setModo("cuenta"); setPassword(""); setConfirmacion(""); setCodigo(""); setClave("");
    await plusActual.current.refrescar();
  }, []);
  useFocusEffect(useCallback(() => {
    let activo = true;
    void asegurarSesion().then(async u => {
      if (!activo) return;
      ultimoUsuario.current = u.id; setUsuario(u); setNombre(String(u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? ""));
      const pendiente = await leerPendiente();
      if (!activo) return;
      if (accion === "password") setModo("password");
      else if (pendiente?.tipo === "email-link" && pendiente.usuario === u.id) { setEmail(pendiente.email ?? ""); setModo("verificar"); }
      else setModo(u.is_anonymous ? "login" : "cuenta");
      if (!u.is_anonymous && !cuentaConClave(u)) setEmail(u.email ?? "");
      if (accion === "google" && !googleInicial.current) {
        googleInicial.current = true;
        await ejecutar(async () => { const nueva = await continuarGoogle(true, contextoAuth); if(nueva) await listo(nueva); });
      }
    }).catch(e => { if (activo) setError(e); });
    return () => { activo = false; };
    // revision fuerza una recarga explícita con Reintentar; no es un dato auth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, accion, contextoAuth, ejecutar, listo]));
  function cambiarModo(nuevo: Modo) { setModo(nuevo); setError(null); setAviso(""); setPassword(""); setConfirmacion(""); setCodigo(""); }
  const campoEmail = <Campo etiqueta={t("Email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" editable={!ocupado}/>;
  const camposPassword = <><Campo etiqueta={t("Contraseña")} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete={modo === "login" ? "current-password" : "new-password"} editable={!ocupado}/>{modo !== "login" && <Campo etiqueta={t("Confirmar contraseña")} value={confirmacion} onChangeText={setConfirmacion} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" editable={!ocupado}/>}</>;
  const google = (vincular = true) => void ejecutar(async () => { const u = await continuarGoogle(vincular, contextoAuth); if (u) await listo(u); });
  return <Pantalla scrollRef={scroll} titulo={t(usuario && !usuario.is_anonymous && modo === "cuenta" ? "Mi cuenta" : "Acceso")} subtitulo={t("Tu mesa de poker, conectada.")}>
    {!!error && <Tarjeta><Texto accessibilityLiveRegion="assertive">{mensajeError(error)}</Texto><Boton titulo={t("Reintentar")} secundario disabled={ocupado} onPress={() => { setError(null); setRevision(v=>v+1); }}/></Tarjeta>}
    {!!aviso && <Tarjeta><Texto accessibilityLiveRegion="polite">{t(aviso)}</Texto></Tarjeta>}
    {!usuario ? <Texto>{t("Cargando…")}</Texto> : <>
      {modo === "login" && <Tarjeta>
        <View style={{ alignItems: "center", gap: 12 }}><LogoBlindly ancho={180}/><Etiqueta>{t("POKER ENTRE AMIGOS")}</Etiqueta></View>
        <Boton titulo={t("Continuar con Google")} disabled={ocupado} onPress={() => google(true)}/>
        <Boton titulo={t("Ya tengo una cuenta Google")} secundario compacto disabled={ocupado} onPress={() => google(false)}/>
        <Texto suave style={{ textAlign: "center" }}>{t("o")}</Texto>{campoEmail}{camposPassword}
        <Boton titulo={t(ocupado ? "Cargando…" : "Iniciar sesión")} disabled={ocupado || !email || !password} onPress={() => void ejecutar(async()=>listo(await entrarEmail(email,password)))}/>
        <Boton titulo={t("¿Olvidaste tu contraseña?")} secundario compacto disabled={ocupado} onPress={()=>cambiarModo("reset")}/>
        <Texto suave>{t("¿No tenés cuenta?")}</Texto><Boton titulo={t("Crear cuenta")} secundario disabled={ocupado} onPress={()=>cambiarModo("registro")}/>
      </Tarjeta>}
      {modo === "registro" && <Tarjeta>
        <Texto style={{ fontSize:22,fontWeight:"700" }}>{t("Guardar mi progreso")}</Texto>
        <Texto suave>{t("Tu identidad, puntos y clubes se conservan. Verificá tu email para protegerlos.")}</Texto>
        {cuentaConClave(usuario) && <Texto>{t("Al vincular email y contraseña, la clave anterior dejará de servir. Conservás tu identidad y tus datos.")}</Texto>}
        <Campo etiqueta={t("Nombre")} value={nombre} onChangeText={setNombre} maxLength={30} autoComplete="name" editable={!ocupado}/>{campoEmail}{camposPassword}
        <Texto suave>{t("Usá al menos 8 caracteres. Nunca compartas tu contraseña.")}</Texto>
        <Boton titulo={t(ocupado ? "Cargando…" : "Crear cuenta")} disabled={ocupado || !email || !nombre || !password || !confirmacion} onPress={()=>void ejecutar(async()=>{ validarPassword(password,confirmacion); const r=await registrarEmail(email,nombre,contextoAuth); setEmail(r.email); setModo("verificar"); })}/>
        <Boton titulo={t("Cancelar")} secundario disabled={ocupado} onPress={()=>cambiarModo(usuario.is_anonymous?"login":"cuenta")}/>
      </Tarjeta>}
      {modo === "verificar" && <Tarjeta>
        <Texto style={{fontWeight:"700"}}>{t("Verificá tu email")}</Texto><Texto suave>{email}</Texto>
        <Texto>{t("Ingresá el código del correo o abrí el enlace en este mismo dispositivo. Luego guardá tu contraseña.")}</Texto>
        <Campo etiqueta={t("Código de verificación")} value={codigo} onChangeText={setCodigo} keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} editable={!ocupado}/>{camposPassword}
        <Boton titulo={t("Verificar y guardar contraseña")} disabled={ocupado || !codigo || !password || !confirmacion} onPress={()=>void ejecutar(async()=>listo(await confirmarEmailPassword(email,codigo,password,confirmacion)))}/>
      </Tarjeta>}
      {modo === "reset" && <Tarjeta><Texto>{t("Restablecer contraseña")}</Texto>{campoEmail}<Boton titulo={t("Enviar enlace de recuperación")} disabled={ocupado||!email} onPress={()=>void ejecutar(async()=>{ await solicitarReset(email,contextoAuth); setAviso("Si existe una cuenta con ese email, recibirás un enlace de recuperación. Abrilo en este mismo dispositivo."); })}/><Boton titulo={t("Volver")} secundario disabled={ocupado} onPress={()=>cambiarModo(usuario.is_anonymous?"login":"cuenta")}/></Tarjeta>}
      {modo === "password" && <Tarjeta><Texto>{t("Nueva contraseña")}</Texto>{camposPassword}<Boton titulo={t("Guardar contraseña")} disabled={ocupado||!password||!confirmacion} onPress={()=>void ejecutar(async()=>{await listo(await guardarPassword(password,confirmacion));setAviso("Contraseña actualizada.");})}/><Boton titulo={t("Cancelar")} secundario disabled={ocupado} onPress={()=>cambiarModo("cuenta")}/></Tarjeta>}
      {modo === "cuenta" && <>
        <Tarjeta><Texto style={{fontSize:24,fontWeight:"700"}}>{usuario.user_metadata?.display_name || usuario.user_metadata?.full_name || t("Jugador")}</Texto>
          {!cuentaConClave(usuario) && <Texto suave>{usuario.email}</Texto>}
          <Etiqueta activa>{t(googleConectado ? "Google conectado" : cuentaConClave(usuario) ? "Cuenta legacy protegida" : "Email verificado")}</Etiqueta>
          <Texto>{t(plus.activo?"PLUS ACTIVO":"Free")}</Texto>
          {plus.gestionable && <Boton titulo={t("Administrar suscripción")} secundario disabled={ocupado} onPress={()=>void ejecutar(plus.gestionar)}/>}
          {cuentaConClave(usuario) && <><Texto suave>{t("Podés añadir Google o email a tu identidad existente.")}</Texto><Boton titulo={t("Crear cuenta con email")} secundario disabled={ocupado} onPress={()=>cambiarModo("registro")}/></>}
        </Tarjeta>
        <Tarjeta><Texto style={{fontWeight:"700"}}>{t("Seguridad")}</Texto>
          <Boton titulo={t("Métodos de acceso")} secundario disabled={ocupado} onPress={()=>setSeguridad(v=>!v)}/>
          {seguridad && <>{!googleConectado && <Boton titulo={t("Continuar con Google")} disabled={ocupado} onPress={()=>google(true)}/>}
            {!cuentaConClave(usuario) && <Boton titulo={t("Cambiar contraseña")} secundario disabled={ocupado} onPress={()=>cambiarModo("reset")}/>}</>}
          <Boton titulo={t("Opciones avanzadas · clave de recuperación")} secundario compacto disabled={ocupado} onPress={()=>cambiarModo("legacy")}/>
          <Boton titulo={t("Cerrar sesión")} secundario disabled={ocupado} onPress={()=>void ejecutar(async()=>{ const u=await cerrarSesion(); setUsuario(u);setModo("login");setSeguridad(false); })}/>
        </Tarjeta>
      </>}
      {modo === "legacy" && <Tarjeta><Texto style={{fontWeight:"700"}}>{t("Clave de recuperación · legacy")}</Texto><Texto suave>{t("Para cuentas creadas con la versión anterior. No necesitás una clave para usar Google o email.")}</Texto>
        {usuario.is_anonymous && <><Campo etiqueta={t("Clave de recuperación")} value={clave} onChangeText={setClave} secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!ocupado}/><Boton titulo={t("Recuperar mi cuenta")} disabled={ocupado||!clave} onPress={()=>void ejecutar(async()=>listo(await recuperarConClave(clave)))}/></>}
        {(cuentaConClave(usuario) || usuario.is_anonymous) && <><Texto selectable style={{fontSize:12}}>{usuario.id}</Texto><Boton titulo={t("Crear una clave nueva")} secundario disabled={ocupado} onPress={()=>void ejecutar(async()=>{const r=await crearClaveRecuperacion(setClaveGenerada);await listo(r.usuario);setModo("legacy");setClaveGenerada(r.clave);})}/>{!!claveGenerada && <><Texto selectable>{claveGenerada}</Texto><Texto>{t("Guardala ahora en un lugar seguro. Blindly no puede mostrarla de nuevo; crear otra reemplaza la anterior.")}</Texto></>}</>}
        <Boton titulo={t("Volver")} secundario disabled={ocupado} onPress={()=>cambiarModo(usuario.is_anonymous?"login":"cuenta")}/>
      </Tarjeta>}
      {usuario.is_anonymous && modo === "login" && <><Tarjeta><Texto suave>{t("Estás jugando como invitado. Guardá tu progreso cuando quieras.")}</Texto><Boton titulo={t("Jugar como invitado")} secundario disabled={ocupado} onPress={()=>void ejecutar(async()=>{ if (desdeInicio) { if(await inicio.elegir("invitado"))router.dismissTo("/"); } else regresar(); })}/></Tarjeta><Boton titulo={t("Opciones avanzadas · clave de recuperación")} secundario compacto disabled={ocupado} onPress={()=>cambiarModo("legacy")}/></>}
      {!usuario.is_anonymous && desdeInicio && <Boton titulo={t("Continuar con esta cuenta")} disabled={ocupado||inicio.ocupado} onPress={()=>void ejecutar(async()=>{ if(await inicio.elegir("cuenta"))router.dismissTo("/"); })}/>}
      {!usuario.is_anonymous && !desdeInicio && <Boton titulo={t(volver?"Continuar con esta cuenta":"Volver al inicio")} secundario disabled={ocupado} onPress={regresar}/>}
      {(modo === "cuenta" || modo === "legacy" || (usuario.is_anonymous && modo === "login")) && <Tarjeta style={{borderColor:"#B91C1C"}}><Texto style={{fontWeight:"700"}}>{t("Zona peligrosa")}</Texto><Texto suave>{t("Elimina tu identidad, tus puntos y tu historial. No se puede deshacer.")}</Texto><Texto suave>{t("Eliminar tu cuenta no cancela tu suscripción de Apple o Google. Administrala antes de borrar la cuenta.")}</Texto>
        {confirmarBorrado ? <><Boton titulo={t("Eliminar definitivamente")} disabled={ocupado} onPress={()=>void ejecutar(async()=>{await eliminarCuenta();setUsuario(null);router.replace("/");})}/><Boton titulo={t("Cancelar")} secundario disabled={ocupado} onPress={()=>setConfirmarBorrado(false)}/></> : <Boton titulo={t("Eliminar mi cuenta")} secundario disabled={ocupado} onPress={()=>setConfirmarBorrado(true)}/>}</Tarjeta>}
    </>}
  </Pantalla>;
}
