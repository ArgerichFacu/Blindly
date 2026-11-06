// Una sesión dura lo que vive este runtime. No se reinicia por background,
// navegación, logout o cambio de cuenta. No guarda identificadores en disco.
export type AnuncioPreparado = {
  listo: () => boolean;
  mostrar: (alAbrir: () => void) => Promise<"cerrado" | "fallo">;
  destruir: () => void;
};
export type EntradaValidada = {
  sala: { estado: string };
  ingresoNuevo?: boolean;
};
export class SesionPublicidad {
  private mostrado = false;
  private presentando = false;
  private bloqueada = false;
  constructor(private cargar: (permitido: () => boolean) => Promise<AnuncioPreparado | null>) {}
  bloquear() { this.bloqueada = true; }

  abrir(permitido: () => boolean) {
    let vigente = true, huboError = false, presentando = false;
    let anuncio: AnuncioPreparado | null = null;
    const puede = () => vigente && !huboError && !this.mostrado && !this.presentando && !this.bloqueada && permitido();
    // No se espera esta promesa desde ninguna operación de sala.
    const destruir = (ad: AnuncioPreparado | null) => { try { ad?.destruir(); } catch { /* SDK opcional. */ } };
    if (puede()) void Promise.resolve().then(() => this.cargar(puede)).then(cargado => {
      if (!puede()) destruir(cargado);
      else anuncio = cargado;
    }).catch(() => {});
    const cancelar = () => {
      vigente = false;
      if (!presentando) { destruir(anuncio); anuncio = null; }
    };
    return {
      cancelar,
      // Después de un error de sala se renuncia a monetizar esta sesión.
      error: () => { this.bloqueada = true; huboError = true; cancelar(); },
      confirmar: () => ({ vigente: puede(), usado: false }),
      trasValidar: async (intento: { vigente: boolean; usado: boolean }, entrada: EntradaValidada) => {
        let listo: AnuncioPreparado | null = null;
        let reservado = false;
        try {
          if (intento.usado) return;
          intento.usado = true;
          if (!intento.vigente || !puede() || entrada.ingresoNuevo !== true || entrada.sala.estado !== "esperando") return;
          listo = anuncio;
          if (!listo?.listo()) return;
          // La reserva impide concurrencia; sólo OPENED consume una impresión.
          this.presentando = true;
          presentando = true;
          reservado = true;
          const resultado = await listo.mostrar(() => { this.mostrado = true; });
          if (resultado !== "cerrado") this.bloqueada = true;
        } catch { this.bloqueada = true; /* Un fallo incierto no es una impresión. */ }
        finally {
          if (reservado) { this.presentando = false; presentando = false; }
          destruir(listo); if (listo) anuncio = null;
        }
      },
    };
  }
}
