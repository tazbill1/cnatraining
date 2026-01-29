import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleIntro } from "@/components/learn/ModuleIntro";
import { ModuleProgress } from "@/components/learn/ModuleProgress";
import { KnowledgeCheck } from "@/components/learn/KnowledgeCheck";
import { ModuleQuiz } from "@/components/learn/ModuleQuiz";
import { FramingSection } from "@/components/learn/sections/FramingSection";
import { EvaluationSection } from "@/components/learn/sections/EvaluationSection";
import { DisclosureSection } from "@/components/learn/sections/DisclosureSection";
import {
  module2Objectives,
  module2Overview,
  module2KnowledgeChecks,
  module2Quiz,
} from "@/lib/module2Content";
import { getModuleById } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ModuleStage = "intro" | "section1" | "section2" | "section3" | "quiz" | "complete";

const sectionLabels = ["Intro", "Framing", "Evaluation", "Disclosure", "Quiz"];

export default function Module2Content() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stage, setStage] = useState<ModuleStage>("intro");
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeChecksPassed, setKnowledgeChecksPassed] = useState<Record<string, boolean>>({});

  const module = getModuleById("trade-appraisal-process");

  useEffect(() => {
    if (!module) {
      navigate("/learn");
    }
  }, [module, navigate]);

  if (!module) {
    return null;
  }

  const handleStart = () => {
    setStage("section1");
  };

  const handleKnowledgeCheckComplete = (sectionKey: string, passed: boolean) => {
    setKnowledgeChecksPassed({ ...knowledgeChecksPassed, [sectionKey]: passed });
  };

  const handleNextSection = () => {
    const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "quiz"];
    const currentIndex = stageOrder.indexOf(stage);
    
    if (currentIndex >= 1 && currentIndex <= 3) {
      setCompletedSections([...completedSections, currentIndex]);
    }
    
    if (currentIndex < stageOrder.length - 1) {
      setStage(stageOrder[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousSection = () => {
    const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "quiz"];
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex > 0) {
      setStage(stageOrder[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed && user) {
      const storageKey = `completed_modules_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      const completed = stored ? JSON.parse(stored) : [];
      if (!completed.includes(module.id)) {
        completed.push(module.id);
        localStorage.setItem(storageKey, JSON.stringify(completed));
      }
      setStage("complete");
      toast.success("Module completed! Great job!");
    }
  };

  const handleFinish = () => {
    navigate("/learn");
  };

  const getCurrentSectionIndex = () => {
    const stageMap: Record<ModuleStage, number> = {
      intro: 0,
      section1: 1,
      section2: 2,
      section3: 3,
      quiz: 4,
      complete: 4,
    };
    return stageMap[stage];
  };

  const renderContent = () => {
    switch (stage) {
      case "intro":
        return (
          <ModuleIntro
            title={module.title}
            welcomeMessage="The trade appraisal isn't a negotiation — it's a process. Learn to set expectations, evaluate consistently, and disclose with confidence."
            overview={module2Overview}
            objectives={module2Objectives}
            estimatedTime="12-15 minutes"
            onStart={handleStart}
          />
        );

      case "section1":
        return (
          <div className="space-y-8">
            <FramingSection />
            <KnowledgeCheck
              check={module2KnowledgeChecks.section1}
              onComplete={(passed) => handleKnowledgeCheckComplete("section1", passed)}
            />
          </div>
        );

      case "section2":
        return (
          <div className="space-y-8">
            <EvaluationSection />
            <KnowledgeCheck
              check={module2KnowledgeChecks.section2}
              onComplete={(passed) => handleKnowledgeCheckComplete("section2", passed)}
            />
          </div>
        );

      case "section3":
        return (
          <div className="space-y-8">
            <DisclosureSection />
            <KnowledgeCheck
              check={module2KnowledgeChecks.section3}
              onComplete={(passed) => handleKnowledgeCheckComplete("section3", passed)}
            />
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Final Quiz</h2>
              <p className="text-muted-foreground">
                Answer at least 80% correctly to complete this module.
              </p>
            </div>
            <ModuleQuiz
              questions={module2Quiz}
              passingScore={80}
              onComplete={handleQuizComplete}
            />
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6 py-12">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <span className="text-5xl">🎉</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Module Complete!
              </h2>
              <p className="text-muted-foreground">
                You've successfully completed {module.title}.
              </p>
            </div>
            <Button size="lg" onClick={handleFinish}>
              Return to Learn
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const showNavigation = stage !== "intro" && stage !== "quiz" && stage !== "complete";

  return (
    <AuthGuard>
      <AppLayout>
        <div className="h-full flex flex-col">
          {/* Header with Progress */}
          <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/learn")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Learn
                </Button>
                <span className="text-sm text-muted-foreground">
                  {module.title}
                </span>
              </div>
              {stage !== "intro" && stage !== "complete" && (
                <ModuleProgress
                  sections={sectionLabels}
                  currentSection={getCurrentSectionIndex()}
                  completedSections={completedSections}
                />
              )}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 py-8">
              {renderContent()}

              {/* Navigation Buttons */}
              {showNavigation && (
                <div className="flex justify-between mt-12 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousSection}
                    disabled={stage === "section1"}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNextSection} className="gap-2">
                    {stage === "section3" ? "Take Quiz" : "Next Section"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
