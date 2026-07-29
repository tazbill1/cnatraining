import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "no auth" }), { status: 401, headers: corsHeaders });

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "invalid" }), { status: 401, headers: corsHeaders });

    const { data: roles } = await userClient.from("user_roles").select("role").eq("user_id", user.id);
    const isSuper = (roles || []).some((r: any) => r.role === "super_admin");
    const isManager = (roles || []).some((r: any) => r.role === "manager");
    if (!isSuper && !isManager) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password;
    const fullName = body.full_name || "";
    const role = body.role || "salesperson";
    let dealershipId = body.dealership_id || null;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password required" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(url, svc);

    // Managers can only create users in their own dealership
    if (!isSuper) {
      const { data: prof } = await admin.from("profiles").select("dealership_id").eq("user_id", user.id).maybeSingle();
      dealershipId = prof?.dealership_id ?? null;
    }

    // Seed invitation so the new-user trigger assigns dealership + role
    await admin.from("invitations").delete().eq("email", email);
    await admin.from("invitations").insert({
      email,
      dealership_id: dealershipId,
      role,
      status: "accepted",
      invited_by: user.id,
    });

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: corsHeaders });
    }

    // Make sure profile/role landed correctly even if trigger defaults differed
    if (created?.user) {
      await admin.from("profiles").update({ dealership_id: dealershipId, full_name: fullName || undefined })
        .eq("user_id", created.user.id);
      await admin.from("user_roles").delete().eq("user_id", created.user.id);
      await admin.from("user_roles").insert({ user_id: created.user.id, role });
    }

    return new Response(JSON.stringify({ success: true, user_id: created?.user?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: corsHeaders });
  }
});
