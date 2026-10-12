import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (code: string, status: number) => new Response(JSON.stringify({ code }), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});

// El correo .invalid fue creado por Blindly, nunca por el jugador.
// Sólo confirma ese factor interno. El nuevo correo sigue requiriendo el
// enlace/OTP enviado por Supabase; no se cambia password ni UUID aquí.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json("METODO_INVALIDO", 405);
  const bearer = req.headers.get("Authorization");
  if (!bearer?.startsWith("Bearer ")) return json("SESION_REQUERIDA", 401);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const identificada = await anon.auth.getUser(bearer.slice(7));
    if (identificada.error || !identificada.data.user) return json("SESION_REQUERIDA", 401);
    const id = identificada.data.user.id;
    const interno = `${id}@recovery.blindly.invalid`;
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith("@recovery.blindly.invalid")) return json("EMAIL_INVALIDO", 400);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const actual = await admin.auth.admin.getUserById(id);
    const u = actual.data.user;
    if (actual.error || !u || u.is_anonymous !== false || !u.email_confirmed_at) return json("SESION_REQUERIDA", 401);
    // Idempotencia si el nuevo email ya terminó de verificarse en otra ventana.
    if (u.email?.toLowerCase() === email) return json("OK", 200);
    if (u.email !== interno || u.new_email?.toLowerCase() !== email) return json("CUENTA_YA_VINCULADA", 409);
    const generado = await admin.auth.admin.generateLink({ type: "email_change_current", email: interno, newEmail: email });
    const hash = generado.data.properties?.hashed_token;
    if (generado.error || generado.data.user?.id !== id || !hash) return json("AUTH_NO_COMPLETADO", 500);
    const factor = await anon.auth.verifyOtp({ type: "email_change", token_hash: hash });
    if (factor.error) return json("AUTH_NO_COMPLETADO", 500);
    // No devolver tokens, enlace ni sesión de Admin al cliente.
    return json("OK", 200);
  } catch {
    return json("AUTH_NO_COMPLETADO", 500);
  }
});
