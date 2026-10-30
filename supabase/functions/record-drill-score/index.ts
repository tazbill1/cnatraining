import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.25.76";
import { requireDealership } from "../_shared/requireDealership.ts";
import { staticDrillKeys } from "../_shared/staticScoreKeys.ts";
import { longestStreak } from "../_shared/scoreValidation.ts";

const productTypes: Record<string, string> = {
  product_quiz_best_streak: "quiz", wrong_claim_best_streak: "wrong_claim",
  comparison_best_streak: "comparison", awd_quiz_best_streak: "awd_quiz",
};
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), drillKey: z.string().max(100), questionIds: z.array(z.string().min(1).max(100)).min(1).max(20) }).strict(),
  z.object({ action: z.literal("finish"), runId: z.string().uuid(), answers: z.array(z.object({ questionId: z.string().min(1).max(100), choice: z.string().max(2000).nullable() }).strict()).min(1).max(20) }).strict(),
]);
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return reply({ error: "Unauthorized" }, 401);
    const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) return reply({ error: "Invalid token" }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const access = await requireDealership(admin, user.id, corsHeaders);
    if (access.errorResponse) return access.errorResponse;
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return reply({ error: "Invalid game result request" }, 400);
    const body = parsed.data;
    let key: string, ids: string[], runId: string | null = null;
    if (body.action === "start") {
      key = body.drillKey; ids = body.questionIds;
    } else {
      const { data: run, error } = await admin.from("verified_drill_runs").select("*").eq("id", body.runId).eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!run) return reply({ error: "Game round not found" }, 404);
      if (run.dealership_id !== (access.profile?.dealership_id ?? null)) return reply({ error: "Game round belongs to another dealership" }, 403);
      if (run.completed_at) return reply({ success: true, score: run.score });
      if (Date.now() - Date.parse(run.created_at) > 2 * 60 * 60 * 1000) return reply({ error: "Game round expired. Start a new round." }, 409);
      key = run.drill_key; ids = run.question_ids as string[]; runId = run.id;
    }
    const gameType = productTypes[key];
    const bank: Record<string, { text: string; correct: boolean }[]> = {};
    if (gameType) {
      let query = admin.from("product_questions").select("id,choices,dealership_id").eq("game_type", gameType).eq("is_active", true).in("id", ids);
      // A global admin may play a preview dealership; everyone else is pinned to their profile.
      if (!access.isSuperAdmin) query = query.eq("dealership_id", access.profile?.dealership_id);
      const { data, error } = await query;
      if (error) throw error;
      for (const question of data || []) {
        if (Array.isArray(question.choices)) bank[question.id] = question.choices.filter((c: unknown): c is { text: string; correct: boolean } =>
          !!c && typeof c === "object" && "text" in c && typeof c.text === "string" && "correct" in c && typeof c.correct === "boolean");
      }
    } else {
      const staticBank = staticDrillKeys[key as keyof typeof staticDrillKeys];
      if (!staticBank) return reply({ error: "Unknown game" }, 400);
      Object.assign(bank, staticBank);
    }
    const maxQuestions = ["quiz", "wrong_claim", "awd_quiz"].includes(gameType) ? 20 : 10;
    if (ids.length > maxQuestions || new Set(ids).size !== ids.length || ids.some((id) => !bank[id])) return reply({ error: "Invalid game questions" }, 400);
    if (body.action === "start") {
      const { data, error } = await admin.from("verified_drill_runs").insert({ user_id: user.id, dealership_id: access.profile?.dealership_id ?? null, drill_key: key, question_ids: ids }).select("id").single();
      if (error) throw error;
      return reply({ success: true, runId: data.id });
    }
    if (!runId) return reply({ error: "Missing round" }, 400);
    const results: boolean[] = [];
    for (const [index, answer] of body.answers.entries()) {
      if (answer.questionId !== ids[index]) return reply({ error: "Game answers do not match this round" }, 400);
      const choices = bank[answer.questionId];
      if (answer.choice === null) results.push(false);
      else {
        const choice = choices.find((c) => c.text === answer.choice);
        if (!choice) return reply({ error: "Invalid game answer" }, 400);
        results.push(choice.correct);
      }
    }
    let score: { best: number; misses: number };
    try { score = longestStreak(results); } catch (error) { return reply({ error: error instanceof Error ? error.message : "Invalid round" }, 400); }
    if (body.answers.length !== ids.length && score.misses !== 3) return reply({ error: "Finish the round before recording a score" }, 400);
    const { error } = await admin.rpc("persist_verified_drill_result", { _run_id: runId, _user_id: user.id, _score: score.best });
    if (error) throw error;
    return reply({ success: true, score: score.best });
  } catch (error) {
    console.error("record-drill-score failed", error);
    return reply({ error: "Unable to record game result. Please try again." }, 500);
  }
});