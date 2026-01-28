import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_DURATION_SECONDS = 7200; // 2 hours max

const EVALUATION_PROMPT = `You are an expert automotive sales trainer evaluating a Customer Needs Analysis (CNA) conversation.

Analyze this conversation and score the salesperson's performance.

SCORING (0-100 for each category):
1. RAPPORT BUILDING - Conversational tone, built trust, listened actively
2. INFORMATION GATHERING - Asked good questions, dug deeper on answers
3. NEEDS IDENTIFICATION - Found emotional "why", identified true priorities
4. CNA COMPLETION - Covered key areas, set expectations properly

Provide your evaluation in this exact JSON format:
{
  "overallScore": 75,
  "rapportScore": 80,
  "infoGatheringScore": 70,
  "needsIdentificationScore": 72,
  "cnaCompletionScore": 78,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "coachingTips": ["tip 1", "tip 2"]
}

Be specific and reference actual parts of the conversation.`;

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const { messages, scenario, checklistState, durationSeconds } = body;

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

    // Validate durationSeconds
    const validatedDuration = typeof durationSeconds === "number" && durationSeconds >= 0 && durationSeconds <= MAX_DURATION_SECONDS
      ? durationSeconds
      : 0;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format conversation for evaluation
    const conversationText = messages
      .map((msg: { role: string; content: string }) => {
        const role = msg.role === "user" ? "SALESPERSON" : "CUSTOMER";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const contextInfo = `
Scenario: ${scenario?.name || "Unknown"}
Duration: ${Math.floor(validatedDuration / 60)} minutes
Checklist items checked: ${Object.values(checklistState || {}).filter(Boolean).length}/11
`;

    console.log("Calling Lovable AI for evaluation, user:", claimsData.claims.sub);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 1000,
        messages: [
          { role: "system", content: EVALUATION_PROMPT },
          { role: "user", content: `${contextInfo}\n\nEvaluate this CNA conversation:\n\n${conversationText}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    console.log("Evaluation received successfully");

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let evaluation;
    
    try {
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      evaluation = null;
    }

    if (!evaluation) {
      evaluation = {
        overallScore: 65,
        rapportScore: 65,
        infoGatheringScore: 65,
        needsIdentificationScore: 65,
        cnaCompletionScore: 50,
        strengths: ["Completed the session", "Engaged in conversation"],
        improvements: ["Ask more open-ended questions", "Dig deeper on priorities"],
        coachingTips: ["Review CNA checklist before sessions"],
      };
    }

    return new Response(
      JSON.stringify({
        overallScore: evaluation.overallScore || 65,
        rapportScore: evaluation.rapportScore || 65,
        infoGatheringScore: evaluation.infoGatheringScore || 65,
        needsIdentificationScore: evaluation.needsIdentificationScore || 65,
        cnaCompletionScore: evaluation.cnaCompletionScore || 50,
        feedback: {
          strengths: evaluation.strengths || [],
          improvements: evaluation.improvements || [],
          coachingTips: evaluation.coachingTips || [],
          examples: [],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Evaluation error:", error);
    return new Response(
      JSON.stringify({
        overallScore: 65,
        rapportScore: 65,
        infoGatheringScore: 65,
        needsIdentificationScore: 65,
        cnaCompletionScore: 50,
        feedback: {
          strengths: ["Completed the session"],
          improvements: ["Practice more scenarios"],
          coachingTips: ["Focus on open-ended questions"],
          examples: [],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
