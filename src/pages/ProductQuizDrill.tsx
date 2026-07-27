import { Gauge } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { useProductQuestions } from "@/hooks/useProductQuestions";

export default function ProductQuizDrill() {
  const { questions, vehicles, isLoading } = useProductQuestions("quiz");

  const subtitle = vehicles.length
    ? `Beat the clock on ${vehicles.join(", ")}. 15 seconds a question — build your streak.`
    : "Beat the clock. 15 seconds a question — build your streak.";

  return (
    <StreakDrill
      title="Timed Product Quiz"
      subtitle={subtitle}
      icon={Gauge}
      questions={questions}
      loading={isLoading}
      emptyMessage="No product questions have been added for your dealership yet."
      bestStreakKey="product_quiz_best_streak"
      secondsPerQuestion={15}
      correctLabel="Product knowledge on point"
    />
  );
}
