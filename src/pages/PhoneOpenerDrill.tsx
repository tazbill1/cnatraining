import { PhoneCall } from "lucide-react";
import { StreakDrill } from "@/components/drills/StreakDrill";
import { phoneOpenerDrillQuestions } from "@/lib/phoneOpenerDrillQuestions";

export default function PhoneOpenerDrill() {
  return (
    <StreakDrill
      title="Phone Opener Streak Drill"
      subtitle="The first 30 seconds of an inbound call. Pick the best opening move and build your streak."
      icon={PhoneCall}
      questions={phoneOpenerDrillQuestions}
      bestStreakKey="phone_opener_drill_best_streak"
      correctLabel="Great open"
    />
  );
}
