import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireDealership } from "../_shared/requireDealership.ts";
import { requireAIRateLimit } from "../_shared/aiRateLimit.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { gatewayErrorResponse, missingAIKeyResponse } from "../_shared/aiGatewayErrors.ts";
import { transcribe } from "./gatewayTranscribe.ts";



// Input validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max
const ALLOWED_AUDIO_TYPES = ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/m4a"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { errorResponse } = await requireDealership(supabase, user.id, corsHeaders);
    if (errorResponse) return errorResponse;
    const rateError = await requireAIRateLimit(user.id, "transcribe", corsHeaders);
    if (rateError) return rateError;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return missingAIKeyResponse(corsHeaders);

    // Bound the full multipart body, including chunked uploads, before buffering.
    const bodyLimit = MAX_FILE_SIZE + 1024 * 1024;
    const tooLarge = () => new Response(JSON.stringify({ error: "File too large. Maximum size: 10MB" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    if (Number(req.headers.get("content-length")) > bodyLimit) return tooLarge();
    const reader = req.body?.getReader();
    if (!reader) return new Response(JSON.stringify({ error: "No audio file provided" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > bodyLimit) { await reader.cancel(); return tooLarge(); }
      chunks.push(value);
    }
    const boundedBody = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { boundedBody.set(chunk, offset); offset += chunk.byteLength; }
    const formData = await new Response(boundedBody, { headers: { "Content-Type": req.headers.get("content-type") ?? "" } }).formData();
    const audioFile = formData.get("audio");
    if (!(audioFile instanceof File) || !audioFile.size) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type (basic check - also allowing empty type for browser-recorded audio)
    const fileType = audioFile.type.toLowerCase();
    if (fileType && !ALLOWED_AUDIO_TYPES.some(type => fileType.includes(type.split('/')[1]))) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Allowed: webm, mp3, wav, ogg, m4a" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Keep the existing complete-file upload and { text } response contract.
    const file = new File([audioFile], audioFile.name || "audio.webm", { type: audioFile.type || "audio/webm" });
    const response = await transcribe({
      baseURL: "https://ai.gateway.lovable.dev",
      apiKey,
      model: "openai/gpt-transcribe",
      maxFileBytes: MAX_FILE_SIZE,
      audioOnly: false,
    }, file, { buffered: true, language: "en", signal: req.signal });
    if (!response.ok) return gatewayErrorResponse(response, corsHeaders);
    const data = await response.json();
    if (typeof data.text !== "string") throw new Error("Invalid transcription response");

    return new Response(JSON.stringify({ text: data.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    console.error("Transcription error details:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
