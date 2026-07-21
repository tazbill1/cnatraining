import { Target } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { spacedMatchQuestions } from "@/lib/spacedMatchQuestions";

export default function SpacedMatchDrill() {
  return (
    <StreakDrill
      title="S.P.A.C.E.D. Match"
      subtitle="Read the F.A.B. statement. Match it to the correct S.P.A.C.E.D. need. Build your streak."
      icon={Target}
      questions={spacedMatchQuestions}
      bestStreakKey="spaced_match_best_streak"
      correctLabel="Right on target"
    />
  );
}
