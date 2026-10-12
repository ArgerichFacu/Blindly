// RevenueCat verifica el entitlement personal en la app normal. La demo sólo
// desbloquea la interfaz local. Esta capa es UI; las RPC
// vuelven a verificar permisos comerciales y propiedad en el servidor.
export function capacidadesPlus(estado: { activo: boolean; cargando?: boolean; error?: unknown }) {
  const premium = estado.activo === true && estado.cargando !== true && !estado.error;
  return { premium, compartirRecap: premium, personalizar: premium, botonera: premium, historial: premium, mesas: premium };
}
