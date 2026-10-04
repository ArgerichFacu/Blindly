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

type EntitlementRevenueCat = {
  expires_date?: string | null;
  product_identifier?: string;
};

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
  const revenueCatSecret = Deno.env.get("REVENUECAT_SECRET_KEY") ?? "";
  if (!revenueCatSecret)
    return json({ code: "PLUS_SERVIDOR_NO_CONFIGURADO" }, 503);

  const token = authorization.slice(7);
  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } =
    await authClient.auth.getUser(token);
  if (authError || !authData.user)
    return json({ code: "SESION_REQUERIDA" }, 401);

  const userId = authData.user.id;
  const respuesta = await fetch(
    "https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(userId),
    { headers: { Authorization: "Bearer " + revenueCatSecret } },
  );

  let entitlement: EntitlementRevenueCat | null = null;
  if (respuesta.status === 200) {
    const cuerpo = await respuesta.json();
    entitlement =
      (cuerpo?.subscriber?.entitlements?.blindly_plus as
        | EntitlementRevenueCat
        | undefined) ?? null;
  } else if (respuesta.status !== 404) {
    console.error("RevenueCat rechazó la consulta", respuesta.status);
    return json({ code: "PLUS_NO_VERIFICADO" }, 502);
  }

  const venceEn = entitlement?.expires_date ?? null;
  const activo =
    !!entitlement &&
    (venceEn === null || new Date(venceEn).getTime() > Date.now());
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: guardarError } = await admin.from("accesos_plus").upsert(
    {
      user_id: userId,
      activo,
      entitlement: "blindly_plus",
      vence_en: venceEn,
      verificado_en: new Date().toISOString(),
      entorno: "unknown",
    },
    { onConflict: "user_id" },
  );
  if (guardarError) {
    console.error("No se pudo guardar el acceso Plus", guardarError.message);
    return json({ code: "PLUS_NO_VERIFICADO" }, 500);
  }

  return json({ activo, vence_en: venceEn });
});
