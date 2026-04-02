import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ModuleIntro } from "@/components/learn/ModuleIntro";
import { ModuleProgress } from "@/components/learn/ModuleProgress";
import { KnowledgeCheck } from "@/components/learn/KnowledgeCheck";
import { ModuleQuiz } from "@/components/learn/ModuleQuiz";
import { BaseStatementContextSection } from "@/components/learn/sections/BaseStatementContextSection";
import { useModuleAccessGuard } from "@/hooks/useModuleAccessGuard";
import { BaseStatementScriptSection } from "@/components/learn/sections/BaseStatementScriptSection";
import { BaseStatementPillarsSection } from "@/components/learn/sections/BaseStatementPillarsSection";
import {
  baseStatementObjectives,
  baseStatementOverview,
  baseStatementKnowledgeChecks,
  baseStatementQuiz,
} from "@/lib/baseStatementContent";
import { getModuleById } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";
import { toast } from "sonner";

type ModuleStage = "intro" | "section1" | "section2" | "section3" | "quiz" | "complete";

const sectionLabels = ["Intro", "Purpose & Context", "Script Part 1", "Pillars & Close", "Quiz"];

function CustomScriptSection({ scriptText, dealershipName, part }: { scriptText: string; dealershipName?: string | null; part: "1" | "2" }) {
  // Split the script roughly in half by paragraphs for the two section views
  const paragraphs = scriptText.split(/\n\n+/).filter(p => p.trim());
  const mid = Math.ceil(paragraphs.length / 2);
  const displayParagraphs = part === "1" ? paragraphs.slice(0, mid) : paragraphs.slice(mid);
  // If only one part has content, show all in part 1
  const finalParagraphs = displayParagraphs.length > 0 ? displayParagraphs : (part === "1" ? paragraphs : []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-foreground">
            {part === "1" ? "Your Dealership Script" : "Your Dealership Script (continued)"}
          </h2>
        </div>
        <Badge variant="secondary" className="mb-3">
          {dealershipName || "Your Dealership"} Custom Script
        </Badge>
        <p className="text-muted-foreground leading-relaxed">
          {part === "1"
            ? "This is the customized base statement script for your store. Learn it, practice it, and make it yours."
            : "Continue with the second half of your dealership's custom script."}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground text-lg">📝 {part === "1" ? "Script" : "Script (continued)"}</h3>
          <div className="bg-card rounded-lg p-5 border">
            {finalParagraphs.map((p, i) => (
              <p key={i} className="text-foreground italic leading-relaxed mb-3 last:mb-0">{p}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BaseStatementContent() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { settings } = useDealershipSettings();
  const { isChecking, isAllowed } = useModuleAccessGuard("base-statement");
  const [stage, setStage] = useState<ModuleStage>("intro");
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeChecksPassed, setKnowledgeChecksPassed] = useState<Record<string, boolean>>({});

  const module = getModuleById("base-statement");
  const hasCustomScript = !!(settings?.custom_base_statement && settings.custom_base_statement.trim());
  const dealershipName = profile?.dealership_name;

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
      if (!completed.includes("base-statement")) {
        completed.push("base-statement");
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
            title={module?.title || "Module 1: The Base Statement"}
            welcomeMessage="The Base Statement is how you set the tone for everything. Before asking a single question, this script tells the customer: this place is different, and you're in good hands."
            overview={baseStatementOverview}
            objectives={baseStatementObjectives}
            estimatedTime="8-10 minutes"
            onStart={handleStart}
          />
        );

      case "section1":
        return (
          <div className="space-y-8">
            <BaseStatementContextSection />
            <KnowledgeCheck
              check={baseStatementKnowledgeChecks.section1}
              onComplete={(passed) => handleKnowledgeCheckComplete("section1", passed)}
            />
          </div>
        );

      case "section2":
        return (
          <div className="space-y-8">
            {hasCustomScript ? (
              <CustomScriptSection
                scriptText={settings!.custom_base_statement!}
                dealershipName={dealershipName}
                part="1"
              />
            ) : (
              <BaseStatementScriptSection />
            )}
            <KnowledgeCheck
              check={baseStatementKnowledgeChecks.section2}
              onComplete={(passed) => handleKnowledgeCheckComplete("section2", passed)}
            />
          </div>
        );

      case "section3":
        return (
          <div className="space-y-8">
            {hasCustomScript ? (
              <CustomScriptSection
                scriptText={settings!.custom_base_statement!}
                dealershipName={dealershipName}
                part="2"
              />
            ) : (
              <BaseStatementPillarsSection />
            )}
            <KnowledgeCheck
              check={baseStatementKnowledgeChecks.section3}
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
              questions={baseStatementQuiz}
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
                You've mastered the Base Statement. Now practice delivering it!
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
                  {module?.title || "The Base Statement"}
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
