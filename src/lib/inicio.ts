export const CLAVE_INICIO = "blindly.inicio.v1";
export type EleccionInicio = "invitado" | "cuenta";
export type DatosInicio = {
  version: 1;
  eleccion: EleccionInicio | null;
  fase: "bienvenida" | "tutorial" | "terminado";
  paso: 0 | 1 | 2;
};
type AlmacenInicio = {
  getItem: (clave: string) => Promise<string | null>;
  setItem: (clave: string, valor: string) => Promise<void>;
};
const inicial: DatosInicio = {
  version: 1,
  eleccion: null,
  fase: "bienvenida",
  paso: 0,
};
export function leerInicio(texto: string | null): DatosInicio {
  try {
    const d = texto ? JSON.parse(texto) : null;
    if (
      d?.version === 1 &&
      [0, 1, 2].includes(d.paso) &&
      ((d.fase === "bienvenida" && d.eleccion === null && d.paso === 0) ||
        (["tutorial", "terminado"].includes(d.fase) &&
          ["invitado", "cuenta"].includes(d.eleccion)))
    )
      return { version: 1, eleccion: d.eleccion, fase: d.fase, paso: d.paso };
  } catch {
    /* Un registro inválido reinicia solo la introducción, nunca la sesión. */
  }
  return { ...inicial };
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
      .then((texto) => {
        publicar({ datos: leerInicio(texto) });
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
    elegir: (eleccion: EleccionInicio) =>
      guardar((d) =>
        d.fase === "bienvenida"
          ? { version: 1, eleccion, fase: "tutorial", paso: 0 }
          : d,
      ),
    avanzar: () =>
      guardar((d) =>
        d.fase !== "tutorial"
          ? d
          : d.paso === 2
            ? { ...d, fase: "terminado" }
            : { ...d, paso: (d.paso + 1) as 1 | 2 },
      ),
    retroceder: () =>
      guardar((d) =>
        d.fase === "tutorial" && d.paso > 0
          ? { ...d, paso: (d.paso - 1) as 0 | 1 }
          : d,
      ),
    terminar: () =>
      guardar((d) => (d.fase === "tutorial" ? { ...d, fase: "terminado" } : d)),
  };
}
