import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireDealership } from "../_shared/requireDealership.ts";
import { requireAIRateLimit } from "../_shared/aiRateLimit.ts";
import { gatewayErrorResponse, missingAIKeyResponse } from "../_shared/aiGatewayErrors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_TEXT_LENGTH = 1000;

const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/audio/speech";

// Map the app's friendly voice names to Gemini prebuilt voices
const VOICE_MAP: Record<string, string> = {
  "alloy": "Kore",     // firm
  "echo": "Charon",    // informative male
  "fable": "Sulafat",  // warm
  "onyx": "Alnilam",   // firm male
  "nova": "Aoede",     // breezy female
  "shimmer": "Leda",   // youthful female
};
const DEFAULT_VOICE = "Kore";

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
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
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
    const rateError = await requireAIRateLimit(user.id, "speak", corsHeaders);
    if (rateError) return rateError;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) return missingAIKeyResponse(corsHeaders);

    const body = await req.json();
    const { text, voice } = body;

    // Validate text
    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "No text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long. Maximum: ${MAX_TEXT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voiceName = (voice && VOICE_MAP[voice]) ? VOICE_MAP[voice] : DEFAULT_VOICE;

    console.log("Generating speech via gateway TTS for text:", text.substring(0, 50) + "...", "user:", user.id);

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SPEECH_MODEL,
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    });

    if (!response.ok) return gatewayErrorResponse(response, corsHeaders);

    // Complete audio file (WAV, 24kHz 16-bit mono); returned as a single body
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Speech generation error:", error);
    console.error("Speech generation error details:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
