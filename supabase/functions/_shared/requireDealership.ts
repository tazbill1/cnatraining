import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireDealership(
  client: SupabaseClient,
  userId: string,
  corsHeaders: Record<string, string>,
) {
  const [profileResult, roleResult] = await Promise.all([
    client.from("profiles").select("dealership_id").eq("user_id", userId).maybeSingle(),
    client.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  const profile = profileResult.data;
  const isSuperAdmin = roleResult.data === true;
  const lookupFailed = profileResult.error || roleResult.error;
  const errorResponse = lookupFailed
    ? new Response(JSON.stringify({ error: "Unable to verify dealership access. Please try again." }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
    : !profile?.dealership_id && !isSuperAdmin
    ? new Response(JSON.stringify({ error: "Your account is not assigned to a dealership yet. Contact your manager." }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
    : null;
  return { profile, isSuperAdmin, errorResponse };
}