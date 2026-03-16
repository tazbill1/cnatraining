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

type ModuleStage = "intro" | "section1" | "section2" | "section3" | "quiz" | "saving" | "complete";

const MODULE_ID = "trade-appraisal-process";

const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "practice", "quiz"];

const stageFriendlyNames: Record<ModuleStage, string> = {
  intro: "Introduction",
  section1: "Framing the Conversation",
  section2: "Vehicle Evaluation",
  section3: "Purchase Disclosure & AEAIR",
  practice: "Practice Scenario",
  quiz: "Final Quiz",
  saving: "Saving",
  complete: "Complete",
};

const sectionLabels = ["Intro", "Framing", "Evaluation", "Disclosure", "Practice", "Quiz"];

export default function Module2Content() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [stage, setStage] = useState<ModuleStage>("intro");
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeChecksPassed, setKnowledgeChecksPassed] = useState<Record<string, boolean>>({});
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedStage, setSavedStage] = useState<ModuleStage | null>(null);

  const module = getModuleById(MODULE_ID);

  // Check for saved progress on mount
  useEffect(() => {
    if (!module) return;
    const saved = localStorage.getItem(`module_${MODULE_ID}_current_stage`) as ModuleStage | null;
    if (saved && saved !== "intro" && saved !== "complete" && saved !== "saving") {
      setSavedStage(saved);
      setShowResumeDialog(true);
    }
  }, [module]);

  // Persist stage changes
  useEffect(() => {
    if (stage !== "intro" && stage !== "complete" && stage !== "saving") {
      localStorage.setItem(`module_${MODULE_ID}_current_stage`, stage);
    }
  }, [stage]);

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
    if (currentIndex >= 1 && currentIndex <= 3) {
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
        const { error } = await supabase.from("module_completions").upsert(
          { user_id: user.id, module_id: module.id, quiz_score: score, dealership_id: profile?.dealership_id || null },
          { onConflict: "user_id,module_id" }
        );
        if (error) throw error;

        const storageKey = `completed_modules_${user.id}`;
        const stored = localStorage.getItem(storageKey);
        const completed = stored ? JSON.parse(stored) : [];
        if (!completed.includes(module.id)) {
          completed.push(module.id);
          localStorage.setItem(storageKey, JSON.stringify(completed));
        }

        localStorage.removeItem(`module_${MODULE_ID}_current_stage`);
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
        localStorage.removeItem(`module_${MODULE_ID}_current_stage`);
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
      practice: 4,
      quiz: 5,
      saving: 5,
      complete: 5,
    };
    return stageMap[stage];
  };

  const handleResume = () => {
    if (savedStage) {
      setStage(savedStage);
      const idx = stageOrder.indexOf(savedStage);
      const completed = Array.from({ length: idx - 1 }, (_, i) => i + 1);
      setCompletedSections(completed);
    }
    setShowResumeDialog(false);
  };

  const handleStartOver = () => {
    localStorage.removeItem(`module_${MODULE_ID}_current_stage`);
    setSavedStage(null);
    setShowResumeDialog(false);
  };

  const renderContent = () => {
    switch (stage) {
      case "intro":
        return (
          <ModuleIntro
            title={module.title}
            welcomeMessage="Master the complete trade appraisal workflow from initial conversation to final disclosure"
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

      case "practice":
        return (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Practice Scenario</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Apply what you've learned in a realistic customer interaction. This is optional but recommended before the quiz.
              </p>
            </div>
            <PracticeScenario scenario={module2PracticeScenario} />
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button variant="outline" onClick={handlePreviousSection} className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              <Button onClick={handleNextSection} className="gap-2 w-full sm:w-auto">
                <span>Take Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Final Quiz</h2>
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
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto">
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

  const showNavigation = stage !== "intro" && stage !== "quiz" && stage !== "saving" && stage !== "complete" && stage !== "practice";

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
              {stage !== "intro" && stage !== "complete" && stage !== "saving" && (
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
            <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
              {renderContent()}

              {/* Navigation Buttons */}
              {showNavigation && (
                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 md:mt-12 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousSection}
                    disabled={stage === "section1"}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  <Button onClick={handleNextSection} className="gap-2 w-full sm:w-auto">
                    <span>{stage === "section3" ? "Practice Scenario" : "Next Section"}</span>
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
