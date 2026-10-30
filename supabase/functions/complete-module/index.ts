import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.25.76";
import { requireDealership } from "../_shared/requireDealership.ts";
import { legacyQuizKeys } from "../_shared/staticScoreKeys.ts";
import { quizPercentage } from "../_shared/scoreValidation.ts";

const Body = z.object({ moduleId: z.string().min(1).max(100), answers: z.record(z.union([z.string().max(100), z.number().int().min(0).max(100)])).default({}) }).strict();
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    if (!parsed.success) return reply({ error: "Invalid course completion request" }, 400);
    const { moduleId, answers } = parsed.data;
    let questions: { id: string; choices: { id: string; correct: boolean }[] }[];
    let dealershipId = access.profile?.dealership_id ?? null;
    if (moduleId.startsWith("dealership-")) {
      const id = moduleId.slice("dealership-".length);
      if (!z.string().uuid().safeParse(id).success) return reply({ error: "Invalid course" }, 400);
      const { data: module, error } = await admin.from("dealership_modules").select("dealership_id,is_active").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!module?.is_active || (!access.isSuperAdmin && module.dealership_id !== dealershipId)) return reply({ error: "Course not available" }, 403);
      dealershipId = module.dealership_id;
      const { data: rows, error: quizError } = await admin.from("dealership_quiz_questions").select("id,options").eq("module_id", id);
      if (quizError) throw quizError;
      questions = (rows || []).map((q) => ({ id: q.id, choices: (Array.isArray(q.options) ? q.options : []).map((o: { correct?: boolean }, index: number) => ({ id: String(index), correct: o.correct === true })) }));
    } else {
      const bank = legacyQuizKeys[moduleId as keyof typeof legacyQuizKeys];
      if (!bank) return reply({ error: "Unknown course" }, 400);
      const { data: settings, error } = await admin.from("dealership_settings").select("enabled_module_ids").eq("dealership_id", dealershipId).maybeSingle();
      if (error) throw error;
      if (!access.isSuperAdmin && settings?.enabled_module_ids && !settings.enabled_module_ids.includes(moduleId)) return reply({ error: "Course not available" }, 403);
      questions = Object.entries(bank).map(([id, choices]) => ({ id, choices }));
    }
    let score: number | null;
    try { score = quizPercentage(questions, Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, String(answer)]))); }
    catch (error) { return reply({ error: error instanceof Error ? error.message : "Invalid answers" }, 400); }
    if (score !== null && score < 80) return reply({ error: "Score at least 80% to complete this course.", quizScore: score }, 400);
    const { error } = await admin.from("module_completions").upsert({ user_id: user.id, module_id: moduleId, dealership_id: dealershipId, quiz_score: score, completed_at: new Date().toISOString() }, { onConflict: "user_id,module_id" });
    if (error) throw error;
    return reply({ success: true, quizScore: score });
  } catch (error) {
    console.error("complete-module failed", error);
    return reply({ error: "Unable to save course completion. Please try again." }, 500);
  }
});