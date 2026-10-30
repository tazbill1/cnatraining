import { Clock } from "lucide-react";
import { Scenario } from "@/lib/scenarios";
import { scenarioLabel } from "@/lib/scenarioLabels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ScenarioCardProps {
  scenario: Scenario;
  onClick: () => void;
  showCategory?: boolean;
  isCustom?: boolean;
}

export function ScenarioCard({ scenario, onClick, showCategory = false, isCustom = false }: ScenarioCardProps) {
  const difficultyClass = {
    beginner: "difficulty-beginner",
    intermediate: "difficulty-intermediate",
    advanced: "difficulty-advanced",
  }[scenario.difficulty];

  return (
    <Button variant="ghost"
      onClick={onClick}
      className="scenario-card text-left w-full group h-auto whitespace-normal justify-start font-normal"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <scenario.icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {scenario.name}
            </h3>
            {(showCategory || isCustom) && (
              <Badge variant="secondary" className="text-xs">
                {scenarioLabel(scenario.category)}
              </Badge>
            )}
          </div>
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
    </Button>
  );
}
