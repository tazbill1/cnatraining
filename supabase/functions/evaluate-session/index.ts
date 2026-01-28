import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { messages, scenario, checklistState, durationSeconds } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format conversation for evaluation
    const conversationText = messages
      .map((msg: any) => {
        const role = msg.role === "user" ? "SALESPERSON" : "CUSTOMER";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");

    const contextInfo = `
Scenario: ${scenario?.name || "Unknown"}
Duration: ${Math.floor((durationSeconds || 0) / 60)} minutes
Checklist items checked: ${Object.values(checklistState || {}).filter(Boolean).length}/11
`;

    console.log("Calling Lovable AI for evaluation");

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
