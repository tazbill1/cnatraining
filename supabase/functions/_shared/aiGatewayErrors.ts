export function missingAIKeyResponse(corsHeaders: Record<string, string>) {
  console.error("LOVABLE_API_KEY is not configured");
  return new Response(JSON.stringify({ error: "AI service is not configured. Please contact your administrator." }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function gatewayErrorResponse(response: Response, corsHeaders: Record<string, string>) {
  const body: unknown = await response.json().catch(() => null);
  const details = body && typeof body === "object" ? body : {};
  const upstreamMessage = "message" in details && typeof details.message === "string" ? details.message
    : "error" in details && typeof details.error === "string" ? details.error
    : "error" in details && details.error && typeof details.error === "object" && "message" in details.error && typeof details.error.message === "string" ? details.error.message : null;
  console.error("AI gateway request failed", { status: response.status, message: upstreamMessage });
  const message = response.status === 402
    ? "AI credits are exhausted. Please contact your administrator."
    : response.status === 429
    ? "AI is receiving too many requests. Please wait a moment and try again."
    : upstreamMessage || "AI request could not be completed. Please contact your administrator.";
  const retryAfter = response.headers.get("Retry-After");
  return new Response(JSON.stringify({ error: message }), {
    status: response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...(retryAfter ? { "Retry-After": retryAfter } : {}) },
  });
}