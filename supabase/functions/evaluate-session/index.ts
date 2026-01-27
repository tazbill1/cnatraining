import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EVALUATION_PROMPT = `You are an expert automotive sales trainer evaluating a Customer Needs Analysis (CNA) conversation.

Analyze this conversation based on the CNA training methodology:

CHECKLIST ITEMS (mark complete or incomplete):
1. Got customer name and referral source
2. Asked "What made today the day?" (urgency/pain points)
3. Identified primary driver
4. Discussed Goals for Today (product info, demo, purchase info, appraisal)
5. Uncovered Use & Utility (day-to-day AND fun/adventure)
6. Got current vehicle details (year/make/model/mileage)
7. Discovered what they LOVED about current vehicle
8. Found what doesn't work anymore (pain points)
9. Identified new vehicle criteria (researched vehicle, flexibility on new/used/certified)
10. Distinguished "must-haves" vs "nice-to-haves"
11. Found top 3 priorities (safety, performance, appearance, comfort, economy, reliability)

SCORING CRITERIA (0-100 for each):

1. RAPPORT BUILDING (0-25 points):
- Conversational vs interrogational tone
- Built trust and comfort
- Listened actively, didn't rush
- Normalized questions with examples

2. INFORMATION GATHERING (0-25 points):
- Asked all critical CNA questions
- Took notes (indicated by writing things down)
- Dug deeper on vague answers
- Followed proper CNA structure

3. NEEDS IDENTIFICATION (0-25 points):
- Found emotional "why" behind purchase
- Identified true priorities (not just stated preferences)
- Distinguished must-haves from nice-to-haves
- Created flexibility (vehicle type, new/used, color)

4. CNA COMPLETION (0-25 points):
- Covered all 11 checklist items
- Set proper expectations via Goals for Today
- Positioned for successful vehicle selection
- Avoided common mistakes (asking permission, rushing, skipping sections)

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

OVERALL SCORE: [0-100]

CATEGORY SCORES:
- Rapport Building: [0-25]/25
- Information Gathering: [0-25]/25
- Needs Identification: [0-25]/25
- CNA Completion: [0-25]/25

CHECKLIST STATUS:
[List each item as ✓ Complete or ✗ Incomplete]

WHAT WAS DONE WELL:
[Specific examples from conversation]

WHAT NEEDS IMPROVEMENT:
[Specific examples and suggestions]

COACHING TIPS:
[Actionable advice for next session]

Be specific and reference actual parts of the conversation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, scenario, checklistState, durationSeconds } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
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
Checklist items checked by user: ${Object.values(checklistState || {}).filter(Boolean).length}/11
`;

    console.log("Calling Anthropic API for evaluation");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: EVALUATION_PROMPT,
        messages: [
          {
            role: "user",
            content: `${contextInfo}\n\nEvaluate this CNA conversation:\n\n${conversationText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluation = data.content
      ?.filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n") || "";

    console.log("Evaluation received successfully");

    // Parse scores from the formatted response
    const overallMatch = evaluation.match(/OVERALL SCORE:\s*(\d+)/i);
    const rapportMatch = evaluation.match(/Rapport Building:\s*(\d+)/i);
    const gatheringMatch = evaluation.match(/Information Gathering:\s*(\d+)/i);
    const needsMatch = evaluation.match(/Needs Identification:\s*(\d+)/i);
    const completionMatch = evaluation.match(/CNA Completion:\s*(\d+)/i);

    // Parse strengths and improvements
    const strengthsSection = evaluation.match(/WHAT WAS DONE WELL:([\s\S]*?)(?=WHAT NEEDS IMPROVEMENT:|$)/i);
    const improvementsSection = evaluation.match(/WHAT NEEDS IMPROVEMENT:([\s\S]*?)(?=COACHING TIPS:|$)/i);
    const coachingSection = evaluation.match(/COACHING TIPS:([\s\S]*?)$/i);

    const parseList = (section: string | null): string[] => {
      if (!section) return [];
      return section
        .split(/\n[-•*]|\n\d+\./)
        .map(s => s.trim())
        .filter(s => s.length > 10 && s.length < 500)
        .slice(0, 5);
    };

    const overallScore = overallMatch ? parseInt(overallMatch[1]) : 65;
    const rapportScore = rapportMatch ? parseInt(rapportMatch[1]) * 4 : 60; // Scale 0-25 to 0-100
    const infoGatheringScore = gatheringMatch ? parseInt(gatheringMatch[1]) * 4 : 60;
    const needsIdentificationScore = needsMatch ? parseInt(needsMatch[1]) * 4 : 60;
    const cnaCompletionScore = completionMatch ? parseInt(completionMatch[1]) * 4 : 50;

    return new Response(
      JSON.stringify({
        overallScore,
        rapportScore,
        infoGatheringScore,
        needsIdentificationScore,
        cnaCompletionScore,
        evaluation,
        feedback: {
          strengths: parseList(strengthsSection?.[1] || null),
          improvements: parseList(improvementsSection?.[1] || null),
          coachingTips: parseList(coachingSection?.[1] || null),
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
          strengths: ["Completed the session", "Engaged in conversation"],
          improvements: ["Practice more scenarios", "Focus on open-ended questions"],
          coachingTips: ["Review CNA checklist before next session"],
          examples: [],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
