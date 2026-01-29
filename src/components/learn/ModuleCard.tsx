import { Clock, Lock, CheckCircle2 } from "lucide-react";
import { TrainingModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  module: TrainingModule;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}

export function ModuleCard({ module, isCompleted, isLocked, onClick }: ModuleCardProps) {
  const difficultyClass = {
    beginner: "difficulty-beginner",
    intermediate: "difficulty-intermediate",
    advanced: "difficulty-advanced",
  }[module.difficulty];

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "scenario-card text-left w-full group",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            isCompleted
              ? "bg-success/20"
              : isLocked
              ? "bg-muted"
              : "bg-primary/10 group-hover:bg-primary/20"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-7 h-7 text-success" />
          ) : isLocked ? (
            <Lock className="w-7 h-7 text-muted-foreground" />
          ) : (
            <module.icon className="w-7 h-7 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "font-semibold transition-colors",
                isCompleted
                  ? "text-success"
                  : isLocked
                  ? "text-muted-foreground"
                  : "text-foreground group-hover:text-primary"
              )}
            >
              {module.title}
            </h3>
            {isCompleted && (
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {module.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {module.sections.map((section, index) => (
              <span
                key={index}
                className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
              >
                {section.title}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                difficultyClass
              )}
            >
              {module.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {module.estimatedTime}
            </span>
            {isLocked && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                Prerequisites required
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
