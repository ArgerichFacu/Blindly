import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ code: "METODO_INVALIDO" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer "))
    return json({ code: "SESION_REQUERIDA" }, 401);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = authorization.slice(7);

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } =
    await authClient.auth.getUser(token);
  if (authError || !authData.user)
    return json({ code: "SESION_REQUERIDA" }, 401);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userId = authData.user.id;

  const [comoJugador, comoHost] = await Promise.all([
    admin
      .from("jugadores")
      .select("sala:salas!inner(id,estado)")
      .eq("user_id", userId)
      .in("sala.estado", ["jugando", "pausado"])
      .limit(1),
    admin
      .from("salas")
      .select("id")
      .eq("host_id", userId)
      .in("estado", ["jugando", "pausado"])
      .limit(1),
  ]);

  if (comoJugador.error || comoHost.error)
    return json({ code: "CUENTA_NO_ELIMINADA" }, 500);
  if ((comoJugador.data?.length ?? 0) > 0 || (comoHost.data?.length ?? 0) > 0)
    return json({ code: "PARTIDA_ACTIVA_CUENTA" }, 409);

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return json({ code: "CUENTA_NO_ELIMINADA" }, 500);

  return json({ ok: true });
});
