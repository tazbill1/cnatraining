import { Calendar, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { scenarios } from "@/lib/scenarios";

interface RecentSessionCardProps {
  scenarioType: string;
  date: Date;
  score: number;
  durationSeconds: number;
}

export function RecentSessionCard({
  scenarioType,
  date,
  score,
  durationSeconds,
}: RecentSessionCardProps) {
  const scenario = scenarios.find((s) => s.id === scenarioType);
  const Icon = scenario?.icon || Trophy;

  const getScoreClass = (score: number) => {
    if (score >= 90) return "score-excellent";
    if (score >= 75) return "score-good";
    if (score >= 60) return "score-needs-work";
    return "score-practice";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {scenario?.name || scenarioType}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {date.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(durationSeconds)}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "text-lg font-bold px-3 py-1 rounded-lg",
          getScoreClass(score)
        )}
      >
        {score}
      </div>
    </div>
  );
}
