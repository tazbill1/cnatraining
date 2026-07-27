import { ShieldAlert } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { useProductQuestions } from "@/hooks/useProductQuestions";

export default function WrongClaimDrill() {
  const { questions, vehicles, isLoading } = useProductQuestions("wrong_claim");

  const subtitle = vehicles.length
    ? `Three claims are true, one isn't. Find the false statement before the clock runs out (${vehicles.join(", ")}).`
    : "Three claims are true, one isn't. Find the false statement before the clock runs out.";

  return (
    <StreakDrill
      title="Spot the Wrong Claim"
      subtitle={subtitle}
      icon={ShieldAlert}
      questions={questions}
      loading={isLoading}
      emptyMessage="No product questions have been added for your dealership yet."
      bestStreakKey="wrong_claim_best_streak"
      secondsPerQuestion={20}
      correctLabel="Caught it — that claim would have burned trust"
    />
  );
}
