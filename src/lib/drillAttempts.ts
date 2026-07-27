import { supabase } from "@/integrations/supabase/client";

export interface DrillAttemptInput {
  drillKey: string;
  questionId: string;
  topic?: string | null;
  vehicle?: string | null;
  isCorrect: boolean;
}

let cachedUserId: string | null = null;
let cachedDealershipId: string | null = null;

async function resolveIdentity() {
  if (cachedUserId) return { userId: cachedUserId, dealershipId: cachedDealershipId };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, dealershipId: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("dealership_id")
    .eq("user_id", user.id)
    .maybeSingle();
  cachedUserId = user.id;
  cachedDealershipId = profile?.dealership_id ?? null;
  return { userId: cachedUserId, dealershipId: cachedDealershipId };
}

/** Records a single question answer so the Progress page can surface weak topics. */
export async function logDrillAttempt(input: DrillAttemptInput) {
  try {
    const { userId, dealershipId } = await resolveIdentity();
    if (!userId) return;
    await supabase.from("drill_question_attempts").insert({
      user_id: userId,
      dealership_id: dealershipId,
      drill_key: input.drillKey,
      question_id: input.questionId,
      topic: input.topic ?? null,
      vehicle: input.vehicle ?? null,
      is_correct: input.isCorrect,
    });
  } catch (e) {
    console.warn("logDrillAttempt failed", e);
  }
}
