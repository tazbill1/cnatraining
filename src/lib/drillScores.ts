import { supabase } from "@/integrations/supabase/client";

export async function saveDrillScore(drillKey: string, lastStreak: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: existing } = await supabase
      .from("drill_scores")
      .select("id, best_streak, plays")
      .eq("user_id", user.id)
      .eq("drill_key", drillKey)
      .maybeSingle();

    if (existing) {
      await supabase.from("drill_scores").update({
        best_streak: Math.max(existing.best_streak, lastStreak),
        last_streak: lastStreak,
        plays: (existing.plays || 0) + 1,
        dealership_id: profile?.dealership_id ?? null,
      }).eq("id", existing.id);
    } else {
      await supabase.from("drill_scores").insert({
        user_id: user.id,
        dealership_id: profile?.dealership_id ?? null,
        drill_key: drillKey,
        best_streak: lastStreak,
        last_streak: lastStreak,
        plays: 1,
      });
    }
  } catch (e) {
    console.warn("saveDrillScore failed", e);
  }
}
