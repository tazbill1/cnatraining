import { MessageCircleQuestion } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { cricMatchQuestions } from "@/lib/cricMatchQuestions";

export default function CricMatchDrill() {
  return (
    <StreakDrill
      title="C.R.I.C. Category Match"
      subtitle="Read what the customer said. Budget, Decision, or Deal? Build your streak."
      icon={MessageCircleQuestion}
      questions={cricMatchQuestions}
      bestStreakKey="cric_match_best_streak"
      correctLabel="Nailed it"
    />
  );
}
