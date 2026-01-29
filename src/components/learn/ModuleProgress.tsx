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
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {sections.map((section, index) => {
        const isCompleted = completedSections.includes(index);
        const isCurrent = index === currentSection;

        return (
          <div key={section} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                isCompleted && "bg-green-500 text-white",
                isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < sections.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-1",
                  completedSections.includes(index) ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
