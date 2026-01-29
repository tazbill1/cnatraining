import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleIntro } from "@/components/learn/ModuleIntro";
import { ModuleProgress } from "@/components/learn/ModuleProgress";
import { KnowledgeCheck } from "@/components/learn/KnowledgeCheck";
import { ModuleQuiz } from "@/components/learn/ModuleQuiz";
import { VehicleSelectionSection } from "@/components/learn/sections/VehicleSelectionSection";
import { ACVSection } from "@/components/learn/sections/ACVSection";
import { TradeValueSection } from "@/components/learn/sections/TradeValueSection";
import { PresentationSection } from "@/components/learn/sections/PresentationSection";
import {
  module1Objectives,
  module1KnowledgeChecks,
  module1Quiz,
} from "@/lib/moduleContent";
import { getModuleById } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ModuleStage = "intro" | "section1" | "section2" | "section3" | "section4" | "quiz" | "complete";

const sectionLabels = ["Intro", "Vehicle Selection", "ACV vs Trade", "6-Step Process", "Presentation", "Quiz"];

export default function ModuleContent() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stage, setStage] = useState<ModuleStage>("intro");
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeChecksPassed, setKnowledgeChecksPassed] = useState<Record<string, boolean>>({});

  const module = getModuleById(moduleId || "");

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
    const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "section4", "quiz"];
    const currentIndex = stageOrder.indexOf(stage);
    
    if (currentIndex >= 1 && currentIndex <= 4) {
      setCompletedSections([...completedSections, currentIndex]);
    }
    
    if (currentIndex < stageOrder.length - 1) {
      setStage(stageOrder[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousSection = () => {
    const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "section4", "quiz"];
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex > 0) {
      setStage(stageOrder[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed && user) {
      // Mark module as complete
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
      section4: 4,
      quiz: 5,
      complete: 5,
    };
    return stageMap[stage];
  };

  const renderContent = () => {
    switch (stage) {
      case "intro":
        return (
          <ModuleIntro
            title={module.title}
            welcomeMessage="Let's master the fundamentals of vehicle selection and trade appraisal"
            objectives={module1Objectives}
            estimatedTime={module.estimatedTime}
            onStart={handleStart}
          />
        );

      case "section1":
        return (
          <div className="space-y-8">
            <VehicleSelectionSection />
            <KnowledgeCheck
              check={module1KnowledgeChecks.section1}
              onComplete={(passed) => handleKnowledgeCheckComplete("section1", passed)}
            />
          </div>
        );

      case "section2":
        return (
          <div className="space-y-8">
            <ACVSection />
            <KnowledgeCheck
              check={module1KnowledgeChecks.section2}
              onComplete={(passed) => handleKnowledgeCheckComplete("section2", passed)}
            />
          </div>
        );

      case "section3":
        return (
          <div className="space-y-8">
            <TradeValueSection />
            <KnowledgeCheck
              check={module1KnowledgeChecks.section3}
              onComplete={(passed) => handleKnowledgeCheckComplete("section3", passed)}
            />
          </div>
        );

      case "section4":
        return <PresentationSection />;

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
              questions={module1Quiz}
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
                    {stage === "section4" ? "Take Quiz" : "Next Section"}
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
