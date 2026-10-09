import type { ResumenLiga } from "./ligas";
// Una preferencia explícita vigente gana; después, la liga activa más reciente.
export function elegirLigaHome(ligas: ResumenLiga[], ultima: string | null) {
    const activas = ligas.filter(l => l.estado === "activa");
    return activas.find(l => l.id === ultima) ?? activas.slice().sort((a, b) => (b.ultima_partida ?? "").localeCompare(a.ultima_partida ?? "") || a.id.localeCompare(b.id))[0] ?? null;
}
