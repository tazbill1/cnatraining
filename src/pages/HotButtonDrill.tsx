import { Ear } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { hotButtonQuestions } from "@/lib/hotButtonQuestions";

export default function HotButtonDrill() {
  return (
    <StreakDrill
      title="Hot Button Detector"
      subtitle="Listen to what the customer says. Tag the S.P.A.C.E.D. hot button behind it."
      icon={Ear}
      questions={hotButtonQuestions}
      bestStreakKey="hot_button_best_streak"
      correctLabel="You heard it"
    />
  );
}
