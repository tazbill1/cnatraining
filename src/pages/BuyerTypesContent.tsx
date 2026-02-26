import { useState } from "react";
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
import { BuyerTypeIntroSection } from "@/components/learn/sections/BuyerTypeIntroSection";
import { AnalystBuyerSection } from "@/components/learn/sections/AnalystBuyerSection";
import { NegotiatorBuyerSection } from "@/components/learn/sections/NegotiatorBuyerSection";
import { EmotionalBuyerSection } from "@/components/learn/sections/EmotionalBuyerSection";
import { LoyalBuyerSection } from "@/components/learn/sections/LoyalBuyerSection";
import { UrgentBuyerSection } from "@/components/learn/sections/UrgentBuyerSection";
import {
  buyerTypesObjectives,
  buyerTypesOverview,
  buyerTypesKnowledgeChecks,
  buyerTypesQuiz,
} from "@/lib/buyerTypesContent";
import { getModuleById } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ModuleStage = "intro" | "section1" | "section2" | "section3" | "section4" | "section5" | "section6" | "quiz" | "complete";

const sectionLabels = ["Intro", "Why It Matters", "The Analyst", "The Negotiator", "The Emotional", "The Loyal", "The Urgent", "Quiz"];

export default function BuyerTypesContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stage, setStage] = useState<ModuleStage>("intro");
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeChecksPassed, setKnowledgeChecksPassed] = useState<Record<string, boolean>>({});

  const module = getModuleById("buyer-types");

  const handleStart = () => {
    setStage("section1");
  };

  const handleKnowledgeCheckComplete = (sectionKey: string, passed: boolean) => {
    setKnowledgeChecksPassed({ ...knowledgeChecksPassed, [sectionKey]: passed });
  };

  const stageOrder: ModuleStage[] = ["intro", "section1", "section2", "section3", "section4", "section5", "section6", "quiz"];

  const handleNextSection = () => {
    const currentIndex = stageOrder.indexOf(stage);
    if (currentIndex >= 1 && currentIndex <= 6) {
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

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed && user) {
      const storageKey = `completed_modules_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      const completed = stored ? JSON.parse(stored) : [];
      if (!completed.includes("buyer-types")) {
        completed.push("buyer-types");
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
      section5: 5,
      section6: 6,
      quiz: 7,
      complete: 7,
    };
    return stageMap[stage];
  };

  const renderContent = () => {
    switch (stage) {
      case "intro":
        return (
          <ModuleIntro
            title={module?.title || "Module 1: Understanding Buyer Types"}
            welcomeMessage="Not every customer shops the same way. Learning to read buyer behavior and adapt your approach is one of the most powerful skills you can develop on the sales floor."
            overview={buyerTypesOverview}
            objectives={buyerTypesObjectives}
            estimatedTime="15-18 minutes"
            onStart={handleStart}
          />
        );

      case "section1":
        return <BuyerTypeIntroSection />;

      case "section2":
        return (
          <div className="space-y-8">
            <AnalystBuyerSection />
            <KnowledgeCheck
              check={buyerTypesKnowledgeChecks.section1}
              onComplete={(passed) => handleKnowledgeCheckComplete("section1", passed)}
            />
          </div>
        );

      case "section3":
        return (
          <div className="space-y-8">
            <NegotiatorBuyerSection />
            <KnowledgeCheck
              check={buyerTypesKnowledgeChecks.section2}
              onComplete={(passed) => handleKnowledgeCheckComplete("section2", passed)}
            />
          </div>
        );

      case "section4":
        return (
          <div className="space-y-8">
            <EmotionalBuyerSection />
            <KnowledgeCheck
              check={buyerTypesKnowledgeChecks.section3}
              onComplete={(passed) => handleKnowledgeCheckComplete("section3", passed)}
            />
          </div>
        );

      case "section5":
        return (
          <div className="space-y-8">
            <LoyalBuyerSection />
            <KnowledgeCheck
              check={buyerTypesKnowledgeChecks.section4}
              onComplete={(passed) => handleKnowledgeCheckComplete("section4", passed)}
            />
          </div>
        );

      case "section6":
        return (
          <div className="space-y-8">
            <UrgentBuyerSection />
            <KnowledgeCheck
              check={buyerTypesKnowledgeChecks.section5}
              onComplete={(passed) => handleKnowledgeCheckComplete("section5", passed)}
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
              questions={buyerTypesQuiz}
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
              <h2 className="text-3xl font-bold text-foreground mb-2">Module Complete!</h2>
              <p className="text-muted-foreground">
                You now understand the 5 buyer types. Head to Practice to test your skills with each one!
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
          <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/learn")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Learn
                </Button>
                <span className="text-sm text-muted-foreground">
                  {module?.title || "Module 1: Understanding Buyer Types"}
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

          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 py-8">
              {renderContent()}

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
                    {stage === "section6" ? "Take Quiz" : "Next Section"}
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
