import { asegurarSesion } from "./sesion";
import { identidadUsuario } from "./identidad";
import { supabase } from "./supabase";

export type ResumenLiga = {
  id: string;
  nombre: string;
  estado: "activa" | "archivada";
  soy_owner: boolean;
  temporada: {
    id: string;
    nombre: string;
    estado: "activa" | "finalizada";
  } | null;
  miembros: number;
  ultima_partida: string | null;
};

export type TemporadaLiga = {
  id: string;
  liga_id: string;
  nombre: string;
  estado: "activa" | "finalizada";
  inicio: string;
  fin: string | null;
  creada_en: string;
};

export type FilaRanking = {
  posicion: number;
  user_id: string;
  nombre: string;
  partidas: number;
  victorias: number;
  podios: number;
  puntos: number;
  posicion_media: number;
};

export type PartidaLiga = {
  sala_id: string;
  codigo_sala: string;
  finalizada_en: string;
  duracion_ms: number;
  jugadores: number;
  ganador: string;
};

export type MiembroLiga = {
  user_id: string;
  nombre: string;
  activo: boolean;
  owner: boolean;
  rol: "owner" | "admin" | "member";
};

export type DetalleLiga = {
  liga: {
    id: string;
    nombre: string;
    estado: "activa" | "archivada";
    soy_owner: boolean;
    puede_administrar: boolean;
    descripcion: string;
    rol: "owner" | "admin" | "member";
  };
  temporada: TemporadaLiga | null;
  temporadas: TemporadaLiga[];
  ranking: FilaRanking[];
  movimientos?: Record<string,number>;
  partidas: PartidaLiga[];
  miembros: MiembroLiga[];
};

export type TemporadaPropia = {
  liga_id: string;
  liga_nombre: string;
  temporada_id: string;
  temporada_nombre: string;
  plus_activo: boolean;
};

async function rpc<T>(nombre: string, parametros?: Record<string, unknown>) {
  await asegurarSesion();
  const { data, error } = await supabase.rpc(nombre, parametros);
  if (error) throw error;
  return data as T;
}

async function prepararAdministracion() {
  if (!identidadUsuario(await asegurarSesion()).recuperable)
    throw new Error("CUENTA_REQUERIDA");
}
export async function actualizarClub(ligaId: string, descripcion: string) {
  await prepararAdministracion();
  await rpc<null>("actualizar_club", {
    p_liga: ligaId,
    p_descripcion: descripcion,
  });
}
export async function cambiarRolLiga(
  ligaId: string,
  usuarioId: string,
  rol: "admin" | "member",
) {
  await prepararAdministracion();
  await rpc<null>("cambiar_rol_liga", {
    p_liga: ligaId,
    p_usuario: usuarioId,
    p_rol: rol,
  });
}

export function misLigas() {
  return rpc<ResumenLiga[]>("mis_ligas");
}

export function detalleLiga(ligaId: string, temporadaId?: string | null) {
  return rpc<DetalleLiga>("detalle_liga", {
    p_liga: ligaId,
    p_temporada: temporadaId ?? null,
  });
}

export function misTemporadasPropias() {
  return rpc<TemporadaPropia[]>("mis_temporadas_propias");
}

export async function crearLiga(
  nombre: string,
  temporada: string,
  nombreOwner: string,
) {
  await prepararAdministracion();
  return rpc<{ liga_id: string; temporada_id: string }>("crear_liga", {
    p_nombre: nombre,
    p_temporada: temporada,
    p_nombre_owner: nombreOwner,
  });
}

export async function actualizarLiga(
  ligaId: string,
  nombre: string,
  archivada: boolean,
) {
  await prepararAdministracion();
  await rpc<null>("actualizar_liga", {
    p_liga: ligaId,
    p_nombre: nombre,
    p_archivada: archivada,
  });
}

export async function crearTemporada(ligaId: string, nombre: string) {
  await prepararAdministracion();
  return rpc<string>("crear_temporada", {
    p_liga: ligaId,
    p_nombre: nombre,
  });
}

export async function finalizarTemporada(temporadaId: string) {
  await prepararAdministracion();
  await rpc<null>("finalizar_temporada", { p_temporada: temporadaId });
}

export async function quitarMiembro(ligaId: string, usuarioId: string) {
  await prepararAdministracion();
  await rpc<null>("quitar_miembro", {
    p_liga: ligaId,
    p_usuario: usuarioId,
  });
}

export type InvitacionLiga = {
  liga_id: string;
  nombre: string;
  descripcion: string;
  ya_miembro: boolean;
};
export async function obtenerInvitacionLiga(ligaId: string, renovar = false) {
  await prepararAdministracion();
  return rpc<{ codigo: string; vence_en: string }>("obtener_invitacion_liga", {
    p_liga: ligaId,
    p_renovar: renovar,
  });
}
export async function consultarInvitacionLiga(codigo: string) {
  await prepararAdministracion();
  return rpc<InvitacionLiga>("consultar_invitacion_liga", { p_codigo: codigo });
}
export async function aceptarInvitacionLiga(codigo: string, nombre: string) {
  await prepararAdministracion();
  return rpc<string>("aceptar_invitacion_liga", {
    p_codigo: codigo,
    p_nombre: nombre,
  });
}
