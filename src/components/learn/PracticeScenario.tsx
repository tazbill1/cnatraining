import { useState } from "react";
import { CheckCircle2, Star, Zap, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DecisionOption {
  id: string;
  text: string;
  quality: "good" | "better" | "best";
  feedback: string;
  points: number;
}

export interface DecisionPoint {
  id: string;
  prompt: string;
  context?: string;
  options: DecisionOption[];
}

export interface PracticeScenarioData {
  id: string;
  title: string;
  customerSetup: string;
  customerQuote: string;
  decisionPoints: DecisionPoint[];
}

interface PracticeScenarioProps {
  scenario: PracticeScenarioData;
  onComplete?: (score: number, maxScore: number) => void;
}

const qualityConfig = {
  good: {
    label: "Good",
    icon: CheckCircle2,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    barColor: "bg-amber-500",
  },
  better: {
    label: "Better",
    icon: Star,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    barColor: "bg-blue-500",
  },
  best: {
    label: "Best",
    icon: Trophy,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    barColor: "bg-green-500",
  },
};

export function PracticeScenario({ scenario, onComplete }: PracticeScenarioProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, DecisionOption>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentDecision = scenario.decisionPoints[currentStep];
  const totalSteps = scenario.decisionPoints.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleSelect = (option: DecisionOption) => {
    if (showFeedback) return;
    setSelections({ ...selections, [currentDecision.id]: option });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (isLastStep) {
      setCompleted(true);
      const totalScore = Object.values(selections).reduce((sum, s) => sum + s.points, 0);
      // Add current selection if not already counted
      const maxScore = scenario.decisionPoints.reduce(
        (sum, dp) => sum + Math.max(...dp.options.map((o) => o.points)),
        0
      );
      onComplete?.(totalScore, maxScore);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const totalScore = Object.values(selections).reduce((sum, s) => sum + s.points, 0);
  const maxScore = scenario.decisionPoints.reduce(
    (sum, dp) => sum + Math.max(...dp.options.map((o) => o.points)),
    0
  );
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  if (completed) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent animate-fade-in">
        <CardContent className="p-5 md:p-8 text-center space-y-5 md:space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Scenario Complete!</h3>
            <p className="text-muted-foreground">
              You scored {totalScore} out of {maxScore} points ({scorePercent}%)
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-3">
            {scenario.decisionPoints.map((dp, i) => {
              const selection = selections[dp.id];
              if (!selection) return null;
              const config = qualityConfig[selection.quality];
              return (
                <div key={dp.id} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground w-20 text-right shrink-0">
                    Decision {i + 1}
                  </span>
                  <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border", config.bg)}>
                    <config.icon className={cn("w-3.5 h-3.5", config.color)} />
                    <span className={cn("text-xs font-medium", config.color)}>
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {scorePercent >= 80
              ? "Excellent judgment! You're ready for the quiz."
              : scorePercent >= 50
              ? "Good instincts. Review the feedback above to sharpen your approach."
              : "Review the module content and try to think about what builds trust and maintains process."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedOption = selections[currentDecision.id];

  return (
    <Card className="border-primary/30 bg-primary/5 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-primary">Practice Scenario</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Decision {currentStep + 1} of {totalSteps}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 mt-3">
          {scenario.decisionPoints.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < currentStep
                  ? "bg-primary"
                  : i === currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-5 px-4 md:px-6">
        {/* Scenario context - show on first step */}
        {currentStep === 0 && !showFeedback && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground">{scenario.customerSetup}</p>
            <div className="p-3 md:p-4 rounded-lg bg-muted/50 border border-border italic text-sm md:text-base text-foreground">
              "{scenario.customerQuote}"
            </div>
          </div>
        )}

        {/* Decision prompt */}
        <div className="animate-fade-in">
          <p className="font-medium text-foreground mb-1">{currentDecision.prompt}</p>
          {currentDecision.context && (
            <p className="text-sm text-muted-foreground mb-4">{currentDecision.context}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentDecision.options.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            const config = qualityConfig[option.quality];

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={showFeedback}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  !showFeedback && "hover:bg-muted/50 hover:border-primary/30 cursor-pointer",
                  !showFeedback && "border-border bg-background",
                  showFeedback && isSelected && config.bg,
                  showFeedback && !isSelected && "border-border bg-background opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{option.text}</p>
                    {showFeedback && isSelected && (
                      <div className="mt-3 animate-fade-in">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <config.icon className={cn("w-4 h-4", config.color)} />
                          <span className={cn("text-sm font-semibold", config.color)}>
                            {config.label} Approach
                          </span>
                          <span className={cn("text-xs ml-auto", config.color)}>
                            +{option.points} pts
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Show non-selected best option feedback */}
        {showFeedback && selectedOption?.quality !== "best" && (
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 animate-fade-in">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
              💡 The best approach:
            </p>
            <p className="text-xs text-muted-foreground">
              {currentDecision.options.find((o) => o.quality === "best")?.text}
            </p>
          </div>
        )}

        {/* Next button */}
        {showFeedback && (
          <Button onClick={handleNext} className="w-full gap-2 animate-fade-in">
            {isLastStep ? "See Results" : "Next Decision"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
