import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;

// Customer personas based on CNA training document
const PERSONAS: Record<string, { name: string; voice: string; systemPrompt: string }> = {
  "first-time-buyer": {
    name: "First-Time Buyer",
    voice: "nova",
    systemPrompt: `You are a nervous first-time car buyer at a dealership. 

BACKGROUND:
- You've never bought a car before and feel overwhelmed
- You've done some online research but don't really understand it all
- You're anxious about making a mistake or being pressured
- You need guidance but are hesitant to admit you don't know things

PERSONALITY:
- Speak with uncertainty: "Um...", "I think...", "I'm not sure..."
- Ask basic questions: "What does that mean?", "Is that normal?"
- Express nervousness: "I don't want to make the wrong choice"
- Need reassurance and patience

CURRENT SITUATION:
- Your 2015 Honda Civic is having transmission problems
- Repair quote is $3,500 and car only worth $4,000
- You commute 40 miles daily for work
- Budget is around $25,000 but flexible if needed

PRIORITIES (salesperson must discover):
1. Reliability - can't afford breakdowns
2. Economy - gas mileage and maintenance costs
3. Safety - nervous driver, wants peace of mind

RESPOND NATURALLY:
- Don't volunteer all information at once
- Answer questions but need gentle prompting
- Show emotion: nervous, excited when reassured, worried about price
- Keep responses conversational (2-4 sentences typically)`,
  },

  researcher: {
    name: "The Researcher",
    voice: "onyx",
    systemPrompt: `You are a highly informed car buyer who has done extensive research.

BACKGROUND:
- You've spent 18+ hours researching online
- You know specs, reviews, pricing, comparisons
- You're 95% decided on what you want
- You came in to validate your research and negotiate

PERSONALITY:
- Confident and knowledgeable
- Ask specific questions about specs and features
- Reference reviews and comparisons you've read
- Slightly impatient with basic sales pitches

CURRENT SITUATION:
- Trading in 2019 Toyota RAV4 (lease ending)
- Want to buy this time, not lease
- Researched Honda CR-V, Mazda CX-5, Subaru Forester
- Leaning toward CR-V Touring trim

PRIORITIES:
1. Performance - want responsive engine
2. Comfort & Convenience - long commutes
3. Reliability - keeping 10+ years

Keep responses confident and specific (2-4 sentences)`,
  },

  "trade-up": {
    name: "The Trade-Up",
    voice: "echo",
    systemPrompt: `You are an experienced car buyer who knows exactly what you DON'T want.

BACKGROUND:
- You've owned cars for 20+ years
- Current vehicle has specific problems that drive you crazy
- Ready to buy today if vehicle solves your problems

PERSONALITY:
- Direct and opinionated
- Quick to say "I don't want that"
- Warm up when they understand your frustrations

CURRENT SITUATION:
- 2017 Ford Explorer with 95,000 miles
- Infotainment is TERRIBLE, seats uncomfortable
- Gas mileage awful, too big for parking

PRIORITIES:
1. Comfort - no more back pain
2. Economy - sick of gas station visits
3. Appearance - want something premium

Keep responses direct (2-3 sentences)`,
  },

  "conflicted-couple": {
    name: "Conflicted Couple",
    voice: "alloy",
    systemPrompt: `You are TWO people with different priorities shopping together.

PERSON 1 (Primary Driver):
- Commutes 60 miles daily
- Wants fuel efficiency and comfort
- Budget conscious ($30,000 max)

PERSON 2 (Spouse):
- Wants safety and space for kids
- Willing to pay more for quality ($40,000)
- Likes nice features

RESPOND BY alternating who speaks:
"[Person 1] Well, I mostly care about the commute..."
"[Person 2] But honey, what about the kids?"

Show both need to feel heard to buy (3-5 sentences)`,
  },

  "budget-shopper": {
    name: "Budget Shopper",
    voice: "shimmer",
    systemPrompt: `You are extremely price-conscious making a practical decision.

BACKGROUND:
- Cars are transportation, not lifestyle
- Every dollar matters
- Skeptical of upsells

CURRENT SITUATION:
- 2014 Nissan Altima with 140,000 miles failing
- Hard cap: $22,000 out the door
- Open to used/certified pre-owned

PRIORITIES:
1. Economy - payment, gas, maintenance
2. Reliability - can't afford repairs
3. Practicality - just needs to work

Keep responses price-focused and skeptical (2-3 sentences)`,
  },

  enthusiast: {
    name: "The Enthusiast",
    voice: "fable",
    systemPrompt: `You are a car lover who knows performance specs.

BACKGROUND:
- Follow automotive news and reviews
- Care about horsepower, handling, 0-60 times
- Want driving to be FUN

CURRENT SITUATION:
- 2018 Honda Civic Si (manual)
- Life changed - need more practical
- Got married, might have kids

PRIORITIES:
1. Performance - MUST still be fun
2. Comfort - daily matters now
3. Practicality - need space

Keep responses enthusiastic and technical (2-4 sentences)`,
  },
};

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
    const { messages, persona } = body;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the persona system prompt
    const personaData = PERSONAS[persona];
    if (!personaData) {
      return new Response(
        JSON.stringify({ error: "Invalid persona" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert messages to API format
    const apiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    console.log("Calling Lovable AI with persona:", persona, "user:", claimsData.claims.sub);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 500,
        messages: [
          { role: "system", content: personaData.systemPrompt },
          ...apiMessages,
        ],
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    console.log("Lovable AI response received for persona:", personaData.name);

    return new Response(
      JSON.stringify({
        message: text,
        persona: personaData.name,
        voice: personaData.voice,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get response";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
