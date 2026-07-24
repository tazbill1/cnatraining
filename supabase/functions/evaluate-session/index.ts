import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_DURATION_SECONDS = 7200;

const CNA_EVALUATION_PROMPT = `You are an expert automotive sales trainer evaluating a Customer Needs Analysis (CNA) conversation.

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
- A one-sentence coaching tip

Provide your evaluation in this exact JSON format:
{
  "overallScore": 75,
  "categories": {
    "rapport": { "score": 80, "label": "Rapport Building", "strengths": [], "improvements": [], "tip": "" },
    "infoGathering": { "score": 70, "label": "Information Gathering", "strengths": [], "improvements": [], "tip": "" },
    "needsIdentification": { "score": 72, "label": "Needs Identification", "strengths": [], "improvements": [], "tip": "" },
    "cnaCompletion": { "score": 78, "label": "CNA Completion", "strengths": [], "improvements": [], "tip": "" }
  },
  "overallTip": "One key takeaway for the salesperson to focus on next session"
}

Be specific and reference actual parts of the conversation. Use encouraging but honest language.`;

const PHONE_EVALUATION_PROMPT = `You are an expert automotive sales phone coach evaluating an inbound sales call.

The call should follow the Phone Skills framework (Module 1):
1. NAME — Did the rep get the caller's name early and use it?
2. INFORMATION — Did the rep gather what they needed (vehicle, timeline, trade, etc.) before giving info?
3. ENGAGING — Was the rep warm, energetic, conversational? Did they listen? Did they personalize?
4. CALL TO ACTION — Did the rep close for a specific appointment (either/or time) and make any micro-commitments?

ALSO ASSESS (Module 3 — Tailor Your Process):
- Identify which personality type the caller behaved like: "driver", "expressive", "amiable", or "analytical".
- Judge whether the rep adapted their pace, tone, and ask to that type. Return adapted: true/false with a one-sentence note.

ALSO PROVIDE MOMENTS (for the transcript replay):
- Pick 3–6 specific salesperson turns that stand out (good or bad). Index them by their position (0-based) in the SALESPERSON-only turns in the transcript order. Label each moment with the framework element it relates to ("name", "information", "engaging", "cta", or "tailoring"), a sentiment ("positive" or "negative"), and a one-sentence note.

Return ONLY this JSON shape, no markdown:
{
  "overallScore": 78,
  "categories": {
    "name": { "score": 85, "label": "Name", "strengths": [], "improvements": [], "tip": "" },
    "information": { "score": 70, "label": "Information", "strengths": [], "improvements": [], "tip": "" },
    "engaging": { "score": 80, "label": "Engaging", "strengths": [], "improvements": [], "tip": "" },
    "cta": { "score": 75, "label": "Call to Action", "strengths": [], "improvements": [], "tip": "" }
  },
  "personalityType": {
    "type": "driver",
    "label": "Driver",
    "cue": "Caller talked fast and led with price.",
    "adapted": true,
    "adaptationNote": "You matched their pace and went straight to an either/or appointment ask."
  },
  "moments": [
    { "salespersonTurnIndex": 1, "element": "name", "sentiment": "positive", "note": "Got the name in the first exchange." },
    { "salespersonTurnIndex": 3, "element": "cta", "sentiment": "negative", "note": "Quoted a price instead of asking for the appointment." }
  ],
  "overallTip": "One key takeaway focused on the weakest framework element."
}

Scores: 0-100. Be specific and reference actual lines. Be honest but constructive.`;

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

function buildCnaFallback() {
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

function buildPhoneFallback() {
  const cat = (label: string) => ({
    score: 65,
    label,
    strengths: ["Completed the call"],
    improvements: ["Practice the framework more"],
    tip: "Run the four-part framework on every call.",
  });
  return {
    overallScore: 65,
    categories: {
      name: cat("Name"),
      information: cat("Information"),
      engaging: cat("Engaging"),
      cta: cat("Call to Action"),
    },
    personalityType: null,
    moments: [],
    overallTip: "Keep reps short and always close for a specific either/or appointment time.",
    rapportScore: 65,
    infoGatheringScore: 65,
    needsIdentificationScore: 65,
    cnaCompletionScore: 65,
    feedback: {
      strengths: ["Completed the call"],
      improvements: ["Practice the framework more"],
      coachingTips: ["Always end with an either/or appointment ask."],
      examples: [],
    },
  };
}

function formatCnaResponse(evaluation: Record<string, unknown>) {
  const cats = evaluation.categories as Record<string, Record<string, unknown>> | undefined;
  const rapport = cats?.rapport as Record<string, unknown> | undefined;
  const info = cats?.infoGathering as Record<string, unknown> | undefined;
  const needs = cats?.needsIdentification as Record<string, unknown> | undefined;
  const cna = cats?.cnaCompletion as Record<string, unknown> | undefined;

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

function formatPhoneResponse(evaluation: Record<string, unknown>) {
  const cats = evaluation.categories as Record<string, Record<string, unknown>> | undefined;
  const name = cats?.name as Record<string, unknown> | undefined;
  const information = cats?.information as Record<string, unknown> | undefined;
  const engaging = cats?.engaging as Record<string, unknown> | undefined;
  const cta = cats?.cta as Record<string, unknown> | undefined;

  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  for (const cat of [name, information, engaging, cta]) {
    if (cat?.strengths) allStrengths.push(...(cat.strengths as string[]));
    if (cat?.improvements) allImprovements.push(...(cat.improvements as string[]));
  }

  return {
    overallScore: evaluation.overallScore || 65,
    categories: evaluation.categories || {},
    personalityType: evaluation.personalityType || null,
    moments: Array.isArray(evaluation.moments) ? evaluation.moments : [],
    overallTip: evaluation.overallTip || "",
    // Map phone categories into legacy score columns so the DB columns stay populated.
    rapportScore: (engaging?.score as number) || 65,
    infoGatheringScore: (information?.score as number) || 65,
    needsIdentificationScore: (name?.score as number) || 65,
    cnaCompletionScore: (cta?.score as number) || 65,
    feedback: {
      strengths: allStrengths.length > 0 ? allStrengths : ["Completed the call"],
      improvements: allImprovements.length > 0 ? allImprovements : ["Practice more calls"],
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: validation.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, scenario, checklistState, effectiveChecklistIds } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isPhone = scenario?.category === "phone";

    // For phone scoring, also tag the salesperson turn index so the AI can reference it in `moments`.
    let salespersonTurnCounter = 0;
    const conversationText = messages
      .map((msg: { role: string; content: string }) => {
        if (msg.role === "user") {
          const tag = isPhone ? ` [salesperson_turn_index=${salespersonTurnCounter++}]` : "";
          return `SALESPERSON${tag}: ${msg.content}`;
        }
        return `CUSTOMER: ${msg.content}`;
      })
      .join("\n\n");

    // Score only against the items the rep was expected to hit at this difficulty.
    const effectiveIds: string[] = Array.isArray(effectiveChecklistIds) ? effectiveChecklistIds : [];
    const effectiveTotal = effectiveIds.length;
    const checklistCompleted = effectiveTotal > 0
      ? effectiveIds.filter((id) => checklistState?.[id]).length
      : Object.values(checklistState || {}).filter(Boolean).length;
    const denom = effectiveTotal > 0 ? effectiveTotal : 16;
    const difficultyNote = scenario?.difficulty ? ` (difficulty: ${scenario.difficulty})` : "";
    const contextInfo = isPhone
      ? `Scenario: ${scenario?.name || "Unknown"}${difficultyNote}\nDuration: ${Math.floor((validation.validatedDuration || 0) / 60)} minutes\n`
      : `Scenario: ${scenario?.name || "Unknown"}${difficultyNote}\nDuration: ${Math.floor((validation.validatedDuration || 0) / 60)} minutes\nChecklist items checked: ${checklistCompleted}/${denom}\n`;

    const systemPrompt = isPhone ? PHONE_EVALUATION_PROMPT : CNA_EVALUATION_PROMPT;
    const userTask = isPhone
      ? `${contextInfo}\nEvaluate this inbound phone call:\n\n${conversationText}`
      : `${contextInfo}\nEvaluate this CNA conversation:\n\n${conversationText}`;

    console.log(`Calling Lovable AI for ${isPhone ? "phone" : "CNA"} evaluation, user: ${user.id}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 2000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userTask },
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
      return new Response(JSON.stringify(isPhone ? buildPhoneFallback() : buildCnaFallback()),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const formatted = isPhone ? formatPhoneResponse(evaluation) : formatCnaResponse(evaluation);
    return new Response(JSON.stringify(formatted),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Evaluation error:", error);
    // Best-effort log of the server-side stack trace to bug_reports for stack-trace visibility.
    try {
      const err = error instanceof Error ? error : new Error(String(error));
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      let userId: string | null = null;
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const authed = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data } = await authed.auth.getUser();
        userId = data.user?.id ?? null;
      }
      if (userId) {
        await serviceClient.from("bug_reports").insert({
          user_id: userId,
          source: "auto-edge",
          error_type: err.name || "Error",
          error_message: err.message,
          error_stack: err.stack ?? null,
          error_context: { function: "evaluate-session" },
          url: req.url,
        });
      }
    } catch (logErr) {
      console.error("Failed to log error to bug_reports:", logErr);
    }
    // Best-effort fallback — we don't know scenario category here, default to CNA.
    return new Response(JSON.stringify(buildCnaFallback()),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
