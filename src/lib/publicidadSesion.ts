// Una sesión dura lo que vive este runtime. No se reinicia por background,
// navegación, logout o cambio de cuenta. No guarda identificadores en disco.
export type AnuncioPreparado = {
  listo: () => boolean;
  mostrar: () => Promise<void>;
  destruir: () => void;
};
export type EntradaValidada = {
  sala: { estado: string };
  ingresoNuevo?: boolean;
};
export class SesionPublicidad {
  private intentado = false;
  constructor(private cargar: (permitido: () => boolean) => Promise<AnuncioPreparado | null>) {}

  abrir(permitido: () => boolean) {
    let vigente = true, huboError = false, presentando = false;
    let anuncio: AnuncioPreparado | null = null;
    const puede = () => vigente && !huboError && !this.intentado && permitido();
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
      error: () => { this.intentado = true; huboError = true; cancelar(); },
      confirmar: () => ({ vigente: puede() }),
      trasValidar: async (intento: { vigente: boolean }, entrada: EntradaValidada) => {
        let listo: AnuncioPreparado | null = null;
        try {
          if (!intento.vigente || !puede() || entrada.ingresoNuevo !== true || entrada.sala.estado !== "esperando") return;
          listo = anuncio;
          if (!listo?.listo()) return;
          // Reserva sin await: doble toque o dos operaciones simultáneas no duplican
          // impresiones. Un fallo de show también consume el intento de esta sesión.
          this.intentado = true;
          presentando = true;
          await listo.mostrar();
        } catch { /* La sala siempre continúa, incluso si listo() falla. */ }
        finally { presentando = false; destruir(listo); if (listo) anuncio = null; }
      },
    };
  }
}
