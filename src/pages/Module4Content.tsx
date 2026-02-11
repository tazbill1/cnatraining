import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ModuleIntro } from "@/components/learn/ModuleIntro";
import { ModuleProgress } from "@/components/learn/ModuleProgress";
import { ModuleQuiz } from "@/components/learn/ModuleQuiz";
import { KnowledgeCheck } from "@/components/learn/KnowledgeCheck";
import { 
  phoneModuleSections, 
  phoneModuleObjectives, 
  phoneModuleOverview,
  phoneModuleKnowledgeChecks,
  phoneModuleQuiz,
  phoneSections 
} from "@/lib/phoneModuleContent";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type ViewState = "intro" | "content" | "quiz" | "complete";

export default function Module4Content() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>("intro");
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [knowledgeCheckPassed, setKnowledgeCheckPassed] = useState(false);

  const handleStartModule = () => {
    setViewState("content");
  };

  const handleSectionComplete = () => {
    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }
    setKnowledgeCheckPassed(false);

    if (currentSection < phoneModuleSections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    } else {
      setViewState("quiz");
    }
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed && user) {
      const stored = localStorage.getItem(`completed_modules_${user.id}`);
      const completedModules = stored ? JSON.parse(stored) : [];
      if (!completedModules.includes("phone-sales-fundamentals")) {
        completedModules.push("phone-sales-fundamentals");
        localStorage.setItem(
          `completed_modules_${user.id}`,
          JSON.stringify(completedModules)
        );
      }
      setViewState("complete");
    }
  };

  const handleKnowledgeCheckComplete = (correct: boolean) => {
    setKnowledgeCheckPassed(correct);
  };

  const getSectionKey = () => {
    const sectionKeys = ["firstImpression", "care", "appointment", "objections"];
    return sectionKeys[currentSection];
  };

  const getSectionContent = () => {
    const key = getSectionKey();
    return phoneSections[key];
  };

  const renderSectionContent = () => {
    const section = getSectionContent();
    if (!section) return null;

    const knowledgeCheck = phoneModuleKnowledgeChecks[section.knowledgeCheckKey];

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>

        {section.content.map((item, index) => (
          <div key={index} className="space-y-4">
            {item.type === "concept" && (
              <div className="card-premium p-6">
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            )}

            {item.type === "script" && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-foreground mb-3">
                  📝 {item.title}
                </h3>
                <div className="bg-background rounded-lg p-4 mb-4 border-l-4 border-primary">
                  <p className="text-foreground italic">{item.script}</p>
                </div>
                {item.notes && (
                  <ul className="space-y-2">
                    {item.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {item.type === "process" && (
              <div className="card-premium p-6">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  {item.title}
                </h3>
                <div className="space-y-4">
                  {item.steps?.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{step.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        {step.script && (
                          <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary/50">
                            <p className="text-sm italic text-foreground">{step.script}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.type === "tip" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-foreground mb-3">
                  💡 {item.title}
                </h3>
                <ul className="space-y-2">
                  {item.items?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-amber-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {/* Knowledge Check */}
        {knowledgeCheck && (
          <div className="mt-8">
            <KnowledgeCheck
              check={knowledgeCheck}
              onComplete={handleKnowledgeCheckComplete}
            />
          </div>
        )}
      </div>
    );
  };

  if (viewState === "intro") {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-8 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/learn")}
              className="mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Learn
            </Button>

            <ModuleIntro
              title="Module 4: Inbound Call Mastery"
              welcomeMessage="Every inbound call is a customer raising their hand — make the most of it."
              overview={phoneModuleOverview}
              objectives={phoneModuleObjectives}
              estimatedTime="15-18 min"
              onStart={handleStartModule}
            />
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (viewState === "quiz") {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-8 max-w-4xl mx-auto">
            <ModuleQuiz
              questions={phoneModuleQuiz}
              passingScore={80}
              onComplete={handleQuizComplete}
            />
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (viewState === "complete") {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-8 max-w-4xl mx-auto text-center">
            <div className="card-premium p-12">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Module Complete!
              </h1>
              <p className="text-muted-foreground mb-8">
                You've mastered Inbound Call Mastery. You're now ready to convert more inbound calls into showroom appointments!
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/learn")}>
                  Back to Learn
                </Button>
                <Button onClick={() => navigate("/scenarios")}>
                  Practice Phone Calls
                </Button>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/learn")}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>

          <ModuleProgress
            sections={phoneModuleSections}
            currentSection={currentSection}
            completedSections={completedSections}
          />

          <div className="mt-8">
            {renderSectionContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (currentSection > 0) {
                  setCurrentSection(currentSection - 1);
                  setKnowledgeCheckPassed(false);
                  window.scrollTo(0, 0);
                }
              }}
              disabled={currentSection === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleSectionComplete}
              disabled={!knowledgeCheckPassed}
              className={cn(
                !knowledgeCheckPassed && "opacity-50 cursor-not-allowed"
              )}
            >
              {currentSection === phoneModuleSections.length - 1
                ? "Take Quiz"
                : "Next Section"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {!knowledgeCheckPassed && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Complete the knowledge check above to continue
            </p>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
