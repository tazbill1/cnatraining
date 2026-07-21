import { Handshake } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { eitherOrCloseQuestions } from "@/lib/eitherOrCloseQuestions";

export default function EitherOrCloseDrill() {
  return (
    <StreakDrill
      title="Either/Or Close Match"
      subtitle="Read the moment. Pick the strongest either/or close. Build your streak."
      icon={Handshake}
      questions={eitherOrCloseQuestions}
      bestStreakKey="either_or_close_best_streak"
      correctLabel="Locked it in"
    />
  );
}
