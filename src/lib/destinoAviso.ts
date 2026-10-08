const uuid = (valor: unknown): valor is string => typeof valor === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
export type SeccionClub = "ranking" | "fecha" | "rivalidades";
export function seccionClub(valor: unknown): SeccionClub | null {
  return valor === "ranking" || valor === "fecha" || valor === "rivalidades" ? valor : null;
}
// Nunca interpreta URLs arbitrarias de un payload push como destino de navegación.
export function destinoAviso(datos: unknown) {
  if (!datos || typeof datos !== "object") return null;
  const d = datos as Record<string, unknown>, seccion = seccionClub(d.seccion);
  if (!uuid(d.liga) || !seccion || (d.temporada != null && !uuid(d.temporada))) return null;
  return { pathname: "/liga" as const, params: { id: d.liga, seccion, ...(uuid(d.temporada) ? { temporada: d.temporada } : {}) } };
}
