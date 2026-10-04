import { asegurarSesion } from "./sesion";
import { supabase } from "./supabase";

type EstadoPlusServidor = {
  activo: boolean;
  vence_en: string | null;
};

async function codigoFuncion(error: unknown) {
  const contexto = (
    error as { context?: { json?: () => Promise<{ code?: string }> } }
  ).context;
  const respuesta = contexto?.json
    ? await contexto.json().catch(() => null)
    : null;
  return respuesta?.code ?? "PLUS_NO_VERIFICADO";
}

export async function sincronizarPlusServidor(): Promise<EstadoPlusServidor> {
  await asegurarSesion();
  const { data, error } = await supabase.functions.invoke("sincronizar-plus", {
    method: "POST",
  });
  if (error) throw new Error(await codigoFuncion(error));
  if (typeof data?.activo !== "boolean") throw new Error("PLUS_NO_VERIFICADO");
  return {
    activo: data.activo,
    vence_en: typeof data.vence_en === "string" ? data.vence_en : null,
  };
}
