import { Search } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { spotTheMistakeDrillQuestions } from "@/lib/spotTheMistakeDrillQuestions";

export default function SpotTheMistakeDrill() {
  return (
    <StreakDrill
      title="Spot the Mistake"
      subtitle="Read the showroom scenario and identify what the salesperson did wrong."
      icon={Search}
      questions={spotTheMistakeDrillQuestions}
      bestStreakKey="spot_the_mistake_drill_best_streak"
      correctLabel="Nailed it"
    />
  );
}
