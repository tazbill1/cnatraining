import { Clock, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LearningObjective } from "@/lib/moduleContent";

interface ModuleIntroProps {
  title: string;
  welcomeMessage: string;
  overview?: string;
  objectives: LearningObjective[];
  estimatedTime: string;
  onStart: () => void;
}

export function ModuleIntro({
  title,
  welcomeMessage,
  overview,
  objectives,
  estimatedTime,
  onStart,
}: ModuleIntroProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{welcomeMessage}</p>
      </div>

      {/* Module Overview */}
      {overview && (
        <Card className="border-muted">
          <CardContent className="p-4 md:p-6">
            <h2 className="font-semibold text-foreground mb-2 md:mb-3">Module Overview</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{overview}</p>
          </CardContent>
        </Card>
      )}

      {/* Learning Objectives */}
      <Card className="border-primary/20">
        <CardContent className="p-4 md:p-6">
          <h2 className="font-semibold text-foreground mb-3 md:mb-4">
            What you'll learn
          </h2>
          <div className="space-y-3">
            {objectives.map((objective) => (
              <div key={objective.id} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm md:text-base text-muted-foreground">{objective.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Estimate */}
      <div className="flex items-center justify-center gap-2 text-sm md:text-base text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Estimated time: {estimatedTime}</span>
      </div>

      {/* Start Button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={onStart} className="px-8 w-full sm:w-auto">
          Begin Module
        </Button>
      </div>
    </div>
  );
}
