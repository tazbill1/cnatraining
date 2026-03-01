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
  module1Overview,
  module1KnowledgeChecks,
  module1Quiz,
} from "@/lib/moduleContent";
import { getModuleById } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ModuleStage = "intro" | "section1" | "section2" | "section3" | "section4" | "quiz" | "saving" | "complete";

const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "section4", "quiz"];

const stageFriendlyNames: Record<ModuleStage, string> = {
  intro: "Introduction",
  section1: "Vehicle Selection",
  section2: "ACV vs Trade",
  section3: "6-Step Process",
  section4: "Presentation",
  quiz: "Final Quiz",
  saving: "Saving",
  complete: "Complete",
};

const sectionLabels = ["Intro", "Vehicle Selection", "ACV vs Trade", "6-Step Process", "Presentation", "Quiz"];

export default function ModuleContent() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stage, setStage] = useState<ModuleStage>("intro");
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeChecksPassed, setKnowledgeChecksPassed] = useState<Record<string, boolean>>({});
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedStage, setSavedStage] = useState<ModuleStage | null>(null);

  const effectiveModuleId = moduleId || "vehicle-selection-fundamentals";
  const module = getModuleById(effectiveModuleId);

  // Check for saved progress on mount
  useEffect(() => {
    if (!module) return;
    const saved = localStorage.getItem(`module_${effectiveModuleId}_current_stage`) as ModuleStage | null;
    if (saved && saved !== "intro" && saved !== "complete" && saved !== "saving") {
      setSavedStage(saved);
      setShowResumeDialog(true);
    }
  }, [effectiveModuleId, module]);

  // Persist stage changes
  useEffect(() => {
    if (stage !== "intro" && stage !== "complete" && stage !== "saving") {
      localStorage.setItem(`module_${effectiveModuleId}_current_stage`, stage);
    }
  }, [stage, effectiveModuleId]);

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
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex > 0) {
      setStage(stageOrder[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleQuizComplete = async (passed: boolean, score: number) => {
    if (passed && user) {
      setStage("saving");
      try {
        // Save to Supabase
        const { error } = await supabase.from("module_completions").upsert(
          {
            user_id: user.id,
            module_id: module.id,
            quiz_score: score,
          },
          { onConflict: "user_id,module_id" }
        );

        if (error) throw error;

        // Also save to localStorage as fallback cache
        const storageKey = `completed_modules_${user.id}`;
        const stored = localStorage.getItem(storageKey);
        const completed = stored ? JSON.parse(stored) : [];
        if (!completed.includes(module.id)) {
          completed.push(module.id);
          localStorage.setItem(storageKey, JSON.stringify(completed));
        }

        localStorage.removeItem(`module_${effectiveModuleId}_current_stage`);
        setStage("complete");
        toast.success("Module completed! Great job!");
      } catch (error) {
        const storageKey = `completed_modules_${user.id}`;
        const stored = localStorage.getItem(storageKey);
        const completed = stored ? JSON.parse(stored) : [];
        if (!completed.includes(module.id)) {
          completed.push(module.id);
          localStorage.setItem(storageKey, JSON.stringify(completed));
        }
        localStorage.removeItem(`module_${effectiveModuleId}_current_stage`);
        setStage("complete");
        toast.error("Progress saved locally but couldn't sync to server.");
      }
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
      saving: 5,
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
            welcomeMessage="Vehicle selection isn't about showing cars. It's about understanding what drives the decision—and guiding customers to vehicles that deliver on their expectations."
            overview={module1Overview}
            objectives={module1Objectives}
            estimatedTime="10-12 minutes"
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
        return (
          <div className="space-y-8">
            <PresentationSection />
            <KnowledgeCheck
              check={module1KnowledgeChecks.section4}
              onComplete={(passed) => handleKnowledgeCheckComplete("section4", passed)}
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
              questions={module1Quiz}
              passingScore={80}
              onComplete={handleQuizComplete}
            />
          </div>
        );

      case "saving":
        return (
          <div className="text-center space-y-6 py-12">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
              <span className="text-3xl">💾</span>
            </div>
            <p className="text-muted-foreground">Saving your progress...</p>
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

  const showNavigation = stage !== "intro" && stage !== "quiz" && stage !== "saving" && stage !== "complete";

  const handleResume = () => {
    if (savedStage) {
      setStage(savedStage);
      // Mark all prior sections as completed
      const idx = stageOrder.indexOf(savedStage);
      const completed = Array.from({ length: idx - 1 }, (_, i) => i + 1);
      setCompletedSections(completed);
    }
    setShowResumeDialog(false);
  };

  const handleStartOver = () => {
    localStorage.removeItem(`module_${effectiveModuleId}_current_stage`);
    setSavedStage(null);
    setShowResumeDialog(false);
  };

  return (
    <AuthGuard>
      <AppLayout>
        <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resume where you left off?</AlertDialogTitle>
              <AlertDialogDescription>
                You were on <strong>{savedStage ? stageFriendlyNames[savedStage] : ""}</strong>. Would you like to pick up where you left off?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleStartOver}>Start Over</AlertDialogCancel>
              <AlertDialogAction onClick={handleResume}>Resume</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
