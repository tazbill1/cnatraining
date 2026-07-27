import { Swords } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { useProductQuestions } from "@/hooks/useProductQuestions";

export default function ComparisonDrill() {
  const { questions, vehicles, isLoading } = useProductQuestions("comparison");

  const subtitle = vehicles.length
    ? `The customer is cross-shopping. Show the ${vehicles.join(", ")} advantage — honestly — before the clock runs out.`
    : "The customer is cross-shopping. Show your advantage — honestly — before the clock runs out.";


  return (
    <StreakDrill
      title="Us vs Them"
      subtitle={subtitle}
      icon={Swords}
      questions={questions}
      loading={isLoading}
      emptyMessage="No comparison questions have been added for your dealership yet."
      bestStreakKey="comparison_best_streak"
      secondsPerQuestion={20}
      correctLabel="Confident, honest comparison"
    />
  );
}
