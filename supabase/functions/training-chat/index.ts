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

// Decode and verify JWT using HMAC-SHA256
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication — verify token via Supabase Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    // Parse and validate input
    const body = await req.json();
    const { messages, scenarioId, difficulty } = body;
    const wantStream = body.stream === true;
    const validDifficulties = new Set(["beginner", "intermediate", "advanced"]);
    const safeDifficulty = validDifficulties.has(difficulty) ? difficulty : "intermediate";

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

      // Fetch the custom scenario and verify access
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("dealership_id")
        .eq("user_id", userId)
        .single();

      // Check if user is a super_admin (can access any dealership's scenarios)
      const { data: isSuperAdmin } = await serviceClient
        .rpc("has_role", { _user_id: userId, _role: "super_admin" });

      if (!profile?.dealership_id && !isSuperAdmin) {
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

      // Super admins can access any active scenario; others must match dealership
      if (!customScenario.is_active) {
        return new Response(
          JSON.stringify({ error: "Scenario not available" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!isSuperAdmin && customScenario.dealership_id !== profile?.dealership_id) {
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

    // Difficulty directives — scale customer behavior so beginners can succeed
    // and advanced roleplays actually pressure-test the rep.
    const difficultyBlock = safeDifficulty === "beginner" ? `

=== DIFFICULTY: BEGINNER ===
Your job is to help the salesperson SUCCEED and build confidence.
- Be friendly, cooperative, and open. Answer questions willingly.
- If you have a concern or objection, raise it ONCE. As soon as the salesperson gives any reasonable response, accept it warmly and move forward.
- Volunteer small helpful details (needs, use case) when it keeps the conversation flowing.
- Never stack objections. Never dig in. Reward good process with clear yeses.` : safeDifficulty === "advanced" ? `

=== DIFFICULTY: ADVANCED ===
You are skeptical, guarded, and time-pressed. Test the salesperson's composure.
- Lead with your objection or concern up front — surface it in your very first or second reply.
- Do NOT concede easily. Require multiple solid, specific responses before you soften. Repeat the concern in different words. Push back on vague answers.
- Reveal needs only when the salesperson earns them with good questions.
- You CAN eventually be won over — but only after real skill and patience. Never become unwinnable. When they truly nail it, acknowledge it and move forward.` : `

=== DIFFICULTY: INTERMEDIATE ===
Be realistic — cooperate when the salesperson does good work, push back when they don't.
- Raise your main objection 2-3 times, or introduce one smaller secondary concern along the way. Concede only after you hear a solid, specific response.
- Answer discovery questions accurately, but don't volunteer extra info unless asked.
- Move forward when the salesperson demonstrates they've earned it.`;

    // Use server-side system prompt — never trust client-provided prompts
    const systemPrompt = `${basePrompt}
${difficultyBlock}

IMPORTANT — HOW TO SOUND LIKE A REAL CAR BUYER:
- You are a real person, not an assistant. Never offer help, never summarize, never praise the salesperson's technique, never use sales or training jargon (CNA, rapport, objection, close, process).
- Keep replies SHORT — usually 1 sentence, max 2, under 35 words. Real customers give short answers.
- Use contractions, casual words, small hesitations ("uh", "honestly", "I mean") sometimes — not every line.
- Only answer what was asked. Don't volunteer your whole story at once.
- React to what the salesperson actually just said. If it's vague or pushy, show mild doubt or annoyance. If it's good, warm up a little.
- Remember details you've already shared and stay consistent (name, family, vehicle, budget, timing).
- Never repeat the same sentence or concern word-for-word.
- Never break character or explain yourself.
- Keep the conversation moving: if the salesperson seems stuck, gives a one-word reply, or goes quiet, nudge naturally the way a real shopper would ("So what would you suggest?", "What else should I know?", "Okay... so what's next?"). Never let the roleplay dead-end.`;

    // Convert messages to Lovable AI format (OpenAI-compatible)
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    console.log("Calling Lovable AI with", messages.length, "messages for scenario:", scenarioId, "user:", userId);

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        reasoning_effort: "minimal",
        max_tokens: 400,
        temperature: 0.9,
        stream: wantStream,
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

    if (wantStream && response.body) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Sorry, what was that?";

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
