import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface ModuleProgressProps {
  sections: string[];
  currentSection: number;
  completedSections: number[];
}

export function ModuleProgress({
  sections,
  currentSection,
  completedSections,
}: ModuleProgressProps) {
  const progressPercent = Math.round((currentSection / (sections.length - 1)) * 100);

  return (
    <div className="py-3">
      {/* Mobile: simplified progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{sections[currentSection]}</span>
          <span>{currentSection + 1} / {sections.length}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop: full step indicators */}
      <div className="hidden sm:flex items-center justify-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
        {sections.map((section, index) => {
          const isCompleted = completedSections.includes(index);
          const isCurrent = index === currentSection;

          return (
            <div key={section} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "text-[10px] md:text-xs max-w-[60px] md:max-w-[80px] text-center leading-tight truncate",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {section}
                </span>
              </div>
              {index < sections.length - 1 && (
                <div
                  className={cn(
                    "w-6 md:w-10 lg:w-12 h-0.5 mx-0.5 md:mx-1 shrink-0",
                    completedSections.includes(index) ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
