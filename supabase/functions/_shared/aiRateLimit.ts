import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireAIRateLimit(userId: string, functionName: string, corsHeaders: Record<string, string>) {
  const service = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data, error } = await service.rpc("consume_ai_request", { _user_id: userId, _function_name: functionName });
  if (error || !data || typeof data.allowed !== "boolean") {
    console.error("Unable to verify AI request limit", error?.message);
    return new Response(JSON.stringify({ error: "Unable to verify AI usage. Please try again later." }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (data.allowed) return null;
  return new Response(JSON.stringify({ error: data.period === "day"
    ? "You've reached your daily AI limit of 1,000 requests. Please try again when your usage resets."
    : "You've reached 30 AI requests in a minute. Please wait a moment and try again." }), {
    status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(data.retry_after ?? 60) },
  });
}