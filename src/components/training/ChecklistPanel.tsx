import { Check, Circle } from "lucide-react";
import { cnaChecklist } from "@/lib/checklist";
import { cn } from "@/lib/utils";
import { Scenario } from "@/lib/scenarios";
import { Progress } from "@/components/ui/progress";

interface ChecklistPanelProps {
  scenario: Scenario;
  checklistState: Record<string, boolean>;
  elapsedTime: string;
  onEndSession: () => void;
}

export function ChecklistPanel({
  scenario,
  checklistState,
  elapsedTime,
  onEndSession,
}: ChecklistPanelProps) {
  const completedCount = Object.values(checklistState).filter(Boolean).length;
  const progress = Math.round((completedCount / cnaChecklist.length) * 100);

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Scenario Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <scenario.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{scenario.name}</h3>
            <p className="text-xs text-muted-foreground">{scenario.difficulty}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{scenario.description}</p>
      </div>

      {/* Timer */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Elapsed Time</span>
          <span className="timer-display text-primary">{elapsedTime}</span>
        </div>
      </div>

      {/* Checklist Progress */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">CNA Progress</span>
          <span className="text-sm text-primary font-semibold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} of {cnaChecklist.length} items completed
        </p>
      </div>

      {/* Checklist Items */}
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-sm font-semibold mb-3">CNA Checklist</h4>
        <div className="space-y-1">
          {cnaChecklist.map((item) => {
            const isComplete = checklistState[item.id];
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300",
                  isComplete
                    ? "bg-success/10"
                    : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                    isComplete
                      ? "bg-success text-success-foreground"
                      : "border-2 border-muted-foreground/30"
                  )}
                >
                  {isComplete && <Check className="w-3 h-3" />}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors",
                    isComplete ? "text-success font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* End Session Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onEndSession}
          className="w-full py-3 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
