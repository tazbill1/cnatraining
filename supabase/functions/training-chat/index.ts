import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SCENARIO_PROMPTS, VALID_SCENARIO_IDS } from "../_shared/scenarioPrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;

// Lovable AI Gateway endpoint
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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

    // Parse and validate input
    const body = await req.json();
    const { messages, scenarioId } = body;

    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Too many messages. Maximum allowed: ${MAX_MESSAGES}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Each message must have role and content" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message content too long. Maximum: ${MAX_MESSAGE_LENGTH} characters` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate scenario ID — either built-in or custom (prefixed with "custom-")
    if (!scenarioId || typeof scenarioId !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or unknown scenario identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let basePrompt: string;

    if (scenarioId.startsWith("custom-")) {
      // Custom scenario — fetch system prompt from database
      const customUuid = scenarioId.replace("custom-", "");

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(customUuid)) {
        return new Response(
          JSON.stringify({ error: "Invalid custom scenario identifier" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use service role to fetch the scenario (RLS already ensures user can only use active scenarios from their dealership via the client)
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Fetch the custom scenario and verify the user belongs to the same dealership
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("dealership_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.dealership_id) {
        return new Response(
          JSON.stringify({ error: "User has no dealership assigned" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: customScenario, error: scenarioError } = await serviceClient
        .from("custom_scenarios")
        .select("system_prompt, dealership_id, is_active")
        .eq("id", customUuid)
        .single();

      if (scenarioError || !customScenario) {
        return new Response(
          JSON.stringify({ error: "Custom scenario not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify dealership match and active status
      if (customScenario.dealership_id !== profile.dealership_id || !customScenario.is_active) {
        return new Response(
          JSON.stringify({ error: "Scenario not available" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      basePrompt = customScenario.system_prompt;
    } else {
      // Built-in scenario — use server-side allowlist
      if (!VALID_SCENARIO_IDS.has(scenarioId)) {
        return new Response(
          JSON.stringify({ error: "Invalid or unknown scenario identifier" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      basePrompt = SCENARIO_PROMPTS[scenarioId];
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use server-side system prompt — never trust client-provided prompts
    const systemPrompt = `${basePrompt}

IMPORTANT: Stay in character as the customer. Respond naturally based on the salesperson's questions. Keep responses concise (1-3 sentences typically). Show emotional reactions appropriate to your character. Speak conversationally like a real person would - use contractions, filler words occasionally, and natural speech patterns.`;

    // Convert messages to Lovable AI format (OpenAI-compatible)
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    console.log("Calling Lovable AI with", messages.length, "messages for scenario:", scenarioId, "user:", user.id);

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm not sure what to say...";

    console.log("Lovable AI response received successfully");

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Training chat error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
