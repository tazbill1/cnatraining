import { Flame } from "lucide-react";
import { StreakDrill, type DrillItem } from "@/components/drills/StreakDrill";
import { bypassDrillQuestions } from "@/lib/bypassDrillQuestions";

const questions: DrillItem[] = bypassDrillQuestions.map((q) => ({
  id: q.id,
  prompt: q.objection,
  promptLabel: "Customer says:",
  choices: q.choices,
}));

export default function BypassDrill() {
  return (
    <StreakDrill
      title="Bypass Streak Drill"
      subtitle="10 customer objections. Pick the best bypass response. Build the longest streak you can."
      icon={Flame}
      questions={questions}
      bestStreakKey="bypass_drill_best_streak"
    />
  );
}
