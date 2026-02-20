import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_DURATION_SECONDS = 7200;

const EVALUATION_PROMPT = `You are an expert automotive sales trainer evaluating a Customer Needs Analysis (CNA) conversation.

Analyze this conversation and score the salesperson's performance.

SCORING (0-100 for each category):
1. RAPPORT BUILDING - Greeting, base statement delivery, community connection, conversational tone, built trust
2. INFORMATION GATHERING - Asked good questions, dug deeper on answers, covered key areas
3. NEEDS IDENTIFICATION - Found emotional "why", identified true priorities, uncovered pain points
4. CNA COMPLETION - Covered all checklist items, set expectations, smooth transitions

For each category, provide:
- A score (0-100)
- 1-2 specific strengths referencing actual conversation moments
- 1-2 specific improvements with actionable coaching advice

Also provide an overall coaching tip.

Provide your evaluation in this exact JSON format:
{
  "overallScore": 75,
  "categories": {
    "rapport": {
      "score": 80,
      "label": "Rapport Building",
      "strengths": ["Specific strength referencing conversation"],
      "improvements": ["Specific actionable improvement"],
      "tip": "One sentence coaching tip for this category"
    },
    "infoGathering": {
      "score": 70,
      "label": "Information Gathering",
      "strengths": ["Specific strength"],
      "improvements": ["Specific improvement"],
      "tip": "Coaching tip"
    },
    "needsIdentification": {
      "score": 72,
      "label": "Needs Identification",
      "strengths": ["Specific strength"],
      "improvements": ["Specific improvement"],
      "tip": "Coaching tip"
    },
    "cnaCompletion": {
      "score": 78,
      "label": "CNA Completion",
      "strengths": ["Specific strength"],
      "improvements": ["Specific improvement"],
      "tip": "Coaching tip"
    }
  },
  "overallTip": "One key takeaway for the salesperson to focus on next session"
}

Be specific and reference actual parts of the conversation. Use encouraging but honest language.`;

function validateRequest(body: Record<string, unknown>) {
  const { messages, durationSeconds } = body;

  if (!Array.isArray(messages)) {
    return { valid: false, error: "Invalid messages format", status: 400 };
  }
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages. Maximum: ${MAX_MESSAGES}`, status: 400 };
  }
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return { valid: false, error: "Each message must have role and content", status: 400 };
    }
    if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message content too long. Maximum: ${MAX_MESSAGE_LENGTH} characters`, status: 400 };
    }
  }

  const validatedDuration = typeof durationSeconds === "number" && durationSeconds >= 0 && durationSeconds <= MAX_DURATION_SECONDS
    ? durationSeconds : 0;

  return { valid: true, validatedDuration };
}

function buildFallbackEvaluation() {
  const fallbackCategory = (label: string) => ({
    score: 65,
    label,
    strengths: ["Completed the session"],
    improvements: ["Practice more to improve"],
    tip: "Focus on being conversational and natural",
  });

  return {
    overallScore: 65,
    categories: {
      rapport: fallbackCategory("Rapport Building"),
      infoGathering: fallbackCategory("Information Gathering"),
      needsIdentification: fallbackCategory("Needs Identification"),
      cnaCompletion: { ...fallbackCategory("CNA Completion"), score: 50 },
    },
    overallTip: "Keep practicing — consistency is key to improvement.",
    // Legacy fields for backward compat
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
  };
}

function formatResponse(evaluation: Record<string, unknown>) {
  const cats = evaluation.categories as Record<string, Record<string, unknown>> | undefined;
  const rapport = cats?.rapport as Record<string, unknown> | undefined;
  const info = cats?.infoGathering as Record<string, unknown> | undefined;
  const needs = cats?.needsIdentification as Record<string, unknown> | undefined;
  const cna = cats?.cnaCompletion as Record<string, unknown> | undefined;

  // Collect all strengths/improvements for legacy fields
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  for (const cat of [rapport, info, needs, cna]) {
    if (cat?.strengths) allStrengths.push(...(cat.strengths as string[]));
    if (cat?.improvements) allImprovements.push(...(cat.improvements as string[]));
  }

  return {
    overallScore: evaluation.overallScore || 65,
    categories: evaluation.categories || {},
    overallTip: evaluation.overallTip || "",
    // Legacy compat
    rapportScore: (rapport?.score as number) || 65,
    infoGatheringScore: (info?.score as number) || 65,
    needsIdentificationScore: (needs?.score as number) || 65,
    cnaCompletionScore: (cna?.score as number) || 50,
    feedback: {
      strengths: allStrengths.length > 0 ? allStrengths : ["Completed the session"],
      improvements: allImprovements.length > 0 ? allImprovements : ["Practice more"],
      coachingTips: evaluation.overallTip ? [evaluation.overallTip as string] : [],
      examples: [],
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: validation.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, scenario, checklistState } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const conversationText = messages
      .map((msg: { role: string; content: string }) => {
        const role = msg.role === "user" ? "SALESPERSON" : "CUSTOMER";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const contextInfo = `
Scenario: ${scenario?.name || "Unknown"}
Duration: ${Math.floor((validation.validatedDuration || 0) / 60)} minutes
Checklist items checked: ${Object.values(checklistState || {}).filter(Boolean).length}/16
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
        max_tokens: 1500,
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    console.log("Evaluation received successfully");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let evaluation;
    try {
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      evaluation = null;
    }

    if (!evaluation || !evaluation.categories) {
      return new Response(JSON.stringify(buildFallbackEvaluation()),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(formatResponse(evaluation)),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Evaluation error:", error);
    return new Response(JSON.stringify(buildFallbackEvaluation()),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
