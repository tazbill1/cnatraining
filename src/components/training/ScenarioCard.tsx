import { Clock } from "lucide-react";
import { Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const difficultyClass = {
    beginner: "difficulty-beginner",
    intermediate: "difficulty-intermediate",
    advanced: "difficulty-advanced",
  }[scenario.difficulty];

  return (
    <button
      onClick={onClick}
      className="scenario-card text-left w-full group"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <scenario.icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {scenario.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {scenario.description}
          </p>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                difficultyClass
              )}
            >
              {scenario.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {scenario.estimatedTime}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
