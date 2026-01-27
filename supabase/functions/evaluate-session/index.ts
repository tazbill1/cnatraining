import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const completedItems = Object.values(checklistState || {}).filter(Boolean).length;
    const totalItems = 11;
    const cnaCompletionScore = Math.round((completedItems / totalItems) * 100);

    const evalPrompt = `You are an expert car sales trainer evaluating a Customer Needs Analysis (CNA) conversation.

Scenario: ${scenario?.name || "Unknown"}
Duration: ${Math.floor((durationSeconds || 0) / 60)} minutes
CNA Checklist Completed: ${completedItems}/${totalItems} items

Conversation:
${messages.map((m: any) => `${m.role === "user" ? "SALESPERSON" : "CUSTOMER"}: ${m.content}`).join("\n")}

Evaluate this conversation and provide scores (0-100) for:
1. Rapport Building - How well did they connect with the customer?
2. Information Gathering - How effectively did they ask questions?
3. Needs Identification - How well did they uncover customer needs?
4. Overall Score - Weighted average considering all factors

Also provide:
- 3 specific things they did well
- 3 areas for improvement

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": 75,
  "rapportScore": 80,
  "infoGatheringScore": 70,
  "needsIdentificationScore": 72,
  "cnaCompletionScore": ${cnaCompletionScore},
  "feedback": {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"],
    "examples": []
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: evalPrompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      overallScore: Math.round(cnaCompletionScore * 0.7 + 30),
      rapportScore: 70,
      infoGatheringScore: 70,
      needsIdentificationScore: 70,
      cnaCompletionScore,
      feedback: {
        strengths: ["Good effort", "Engaged with customer", "Asked questions"],
        improvements: ["Ask more follow-up questions", "Probe deeper on needs", "Summarize findings"],
        examples: [],
      },
    };

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
          strengths: ["Completed the session", "Engaged in conversation"],
          improvements: ["Practice more scenarios", "Focus on open-ended questions"],
          examples: [],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
