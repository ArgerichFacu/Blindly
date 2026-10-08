import type { DetalleLiga } from "./ligas";

// Capa de capacidades recibidas del servidor; nunca usa el Plus local del admin.
// Sin respuesta/caché caducada no concede edición; la RPC vuelve a autorizar.
export function permisosClub(datos: DetalleLiga | null) {
  return {
    plus: datos?.liga.permisos?.plus === true,
    editarTitulos: datos?.liga.estado === "activa" && datos?.liga.puede_administrar === true
      && datos?.liga.permisos?.editar_titulos === true,
  };
}
