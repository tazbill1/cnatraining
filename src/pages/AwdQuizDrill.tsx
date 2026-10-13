import { Mountain } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { useProductQuestions } from "@/hooks/useProductQuestions";

export default function AwdQuizDrill() {
  const { questions, isLoading } = useProductQuestions("awd_quiz");

  return (
    <StreakDrill
      title="Subaru AWD Know-How"
      subtitle="Symmetrical AWD vs. the competition. 20 questions, 15 seconds each — build your streak."
      icon={Mountain}
      questions={questions}
      loading={isLoading}
      emptyMessage="No AWD questions have been added for your dealership yet."
      bestStreakKey="awd_quiz_best_streak"
      questionsPerRound={20}
      secondsPerQuestion={15}
      correctLabel="AWD knowledge on point"
    />
  );
}
