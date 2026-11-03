export const CLAVE_INICIO = "blindly.inicio.v2";
export const CLAVE_INICIO_ANTERIOR = "blindly.inicio.v1";
export type EleccionInicio = "invitado" | "cuenta";
export type DatosInicio = {
  version: 2;
  eleccion: EleccionInicio | null;
  identidad: string | null;
  fase: "bienvenida" | "tutorial" | "terminado";
  paso: 0 | 1 | 2 | 3;
};
type AlmacenInicio = {
  getItem: (clave: string) => Promise<string | null>;
  setItem: (clave: string, valor: string) => Promise<void>;
};
const inicial: DatosInicio = {
  version: 2,
  eleccion: null,
  identidad: null,
  fase: "bienvenida",
  paso: 0,
};
export function leerInicio(texto: string | null): DatosInicio {
  try {
    const d = texto ? JSON.parse(texto) : null;
    if (
      d?.version === 2 &&
      (d.identidad === null || (typeof d.identidad === "string" && d.identidad.length > 0)) &&
      (d.eleccion === null || ["invitado", "cuenta"].includes(d.eleccion)) &&
      [0, 1, 2, 3].includes(d.paso) &&
      ["bienvenida", "tutorial", "terminado"].includes(d.fase)
    )
      return { version: 2, eleccion: d.eleccion, identidad: d.identidad, fase: d.fase, paso: d.paso };
  } catch {
    /* Un registro inválido reinicia solo la introducción, nunca la sesión. */
  }
  return { ...inicial };
}

// La elección de invitado de v1 no prueba que haya visto el acceso de v33.
// Se conserva el tutorial, incluso terminado, sin tocar ningún dato de Auth.
export function migrarInicio(texto: string | null): DatosInicio {
  try {
    const d = texto ? JSON.parse(texto) : null;
    if (d?.version === 1 && [0, 1, 2, 3].includes(d.paso) &&
      ["bienvenida", "tutorial", "terminado"].includes(d.fase))
      return { ...inicial, fase: d.fase, paso: d.paso };
  } catch { /* Sólo se migra el inicio local válido. */ }
  return { ...inicial };
}

export function necesitaAcceso(datos: DatosInicio | null, usuarioId: string, protegida: boolean) {
  return !protegida && !(datos?.eleccion === "invitado" && datos.identidad === usuarioId);
}

// No contiene auth: elegir invitado o leer el tutorial no crea ni cambia un usuario.
export function crearInicio(almacen: AlmacenInicio) {
  let estado: { datos: DatosInicio | null; error: boolean; ocupado: boolean } =
    { datos: null, error: false, ocupado: false };
  let carga: Promise<boolean> | null = null;
  const listeners = new Set<() => void>();
  function publicar(cambios: Partial<typeof estado>) {
    estado = { ...estado, ...cambios };
    listeners.forEach((fn) => fn());
  }
  function cargar(): Promise<boolean> {
    if (estado.datos) return Promise.resolve(true);
    if (carga) return carga;
    publicar({ error: false });
    carga = almacen
      .getItem(CLAVE_INICIO)
      .then(async (texto) => {
        const datos = texto !== null ? leerInicio(texto) : migrarInicio(await almacen.getItem(CLAVE_INICIO_ANTERIOR));
        if (texto === null) await almacen.setItem(CLAVE_INICIO, JSON.stringify(datos));
        publicar({ datos });
        return true;
      })
      .catch(() => {
        publicar({ error: true });
        return false;
      })
      .finally(() => {
        carga = null;
      });
    return carga;
  }
  async function guardar(
    cambio: (d: DatosInicio) => DatosInicio,
  ): Promise<boolean> {
    if (estado.ocupado) return false;
    publicar({ ocupado: true, error: false });
    try {
      if (!(await cargar()) || !estado.datos) return false;
      const datos = cambio(estado.datos);
      await almacen.setItem(CLAVE_INICIO, JSON.stringify(datos));
      publicar({ datos });
      return true;
    } catch {
      publicar({ error: true });
      return false;
    } finally {
      publicar({ ocupado: false });
    }
  }
  return {
    getSnapshot: () => estado,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    cargar,
    elegir: (eleccion: EleccionInicio, identidad: string) => {
      if (!identidad) return Promise.resolve(false);
      return guardar((d) => ({ ...d, eleccion, identidad,
        fase: d.fase === "bienvenida" ? "tutorial" : d.fase }));
    },
    avanzar: () =>
      guardar((d) =>
        d.fase !== "tutorial"
          ? d
          : d.paso === 3
            ? { ...d, fase: "terminado" }
            : { ...d, paso: (d.paso + 1) as 1 | 2 | 3 },
      ),
    retroceder: () =>
      guardar((d) =>
        d.fase === "tutorial" && d.paso > 0
          ? { ...d, paso: (d.paso - 1) as 0 | 1 | 2 }
          : d,
      ),
    terminar: () =>
      guardar((d) => (d.fase === "tutorial" ? { ...d, fase: "terminado" } : d)),
  };
}
