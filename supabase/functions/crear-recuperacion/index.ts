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

function secreto() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
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

  const user = authData.user;
  const emailInterno = `${user.id}@recovery.blindly.invalid`;
  if (!user.is_anonymous && user.email !== emailInterno)
    return json({ code: "CUENTA_YA_VINCULADA" }, 409);

  const password = secreto();
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email: emailInterno,
    password,
    email_confirm: true,
    user_metadata: {
      ...user.user_metadata,
      recovery_method: "blindly_key_v1",
    },
  });
  if (error) return json({ code: "CLAVE_NO_CREADA" }, 500);

  return json({ clave: `BLINDLY1:${user.id}:${password}` });
});
