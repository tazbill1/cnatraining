import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Play } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "@/components/learn/VideoPlayer";
import { PracticeScenario, PracticeScenarioData } from "@/components/learn/PracticeScenario";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Section {
  id: string;
  title: string;
  content_type: string;
  content_html: string | null;
  video_url: string | null;
  sort_order: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: { text: string; correct?: boolean }[];
  explanation: string | null;
  sort_order: number;
}

interface DBPracticeScenario {
  id: string;
  difficulty: string;
  title: string;
  customer_setup: string;
  customer_quote: string;
  decision_points: any[];
  is_active: boolean;
}

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_title: string | null;
  sections: Section[];
  quiz_questions: QuizQuestion[];
  practice_scenarios: DBPracticeScenario[];
}

export default function DealershipModuleContent() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0); // 0 = intro/video, 1..n = sections, last = quiz
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const dbId = moduleId || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: mod, error } = await supabase
        .from("dealership_modules")
        .select("*")
        .eq("id", dbId)
        .single();

      if (error || !mod) {
        toast.error("Module not found");
        navigate("/learn");
        return;
      }

      const [secRes, quizRes, practiceRes] = await Promise.all([
        supabase
          .from("dealership_module_sections")
          .select("*")
          .eq("module_id", dbId)
          .order("sort_order"),
        supabase
          .from("dealership_quiz_questions")
          .select("*")
          .eq("module_id", dbId)
          .order("sort_order"),
        supabase
          .from("dealership_practice_scenarios")
          .select("*")
          .eq("module_id", dbId)
          .eq("is_active", true)
          .order("sort_order"),
      ]);

      setModule({
        ...mod,
        sections: secRes.data || [],
        quiz_questions: (quizRes.data || []).map((q: { id: string; question: string; options: unknown; explanation: string | null; sort_order: number }) => ({
          ...q,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        })),
        practice_scenarios: (practiceRes.data || []) as unknown as DBPracticeScenario[],
      });
      setLoading(false);
    }
    load();
  }, [dbId]);

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (!module) return null;

  const hasVideo = !!module.video_url;
  const sections = module.sections;
  const hasQuiz = module.quiz_questions.length > 0;
  const practiceScenarios = module.practice_scenarios || [];
  const hasPractice = practiceScenarios.length > 0;

  // Stages: [intro/video, ...sections, ...practice, quiz?]
  const stages: { type: "intro" | "section" | "practice" | "quiz"; title: string; index?: number }[] = [];
  if (hasVideo || module.description) {
    stages.push({ type: "intro", title: module.video_title || "Introduction" });
  }
  sections.forEach((s, i) => stages.push({ type: "section", title: s.title, index: i }));
  if (hasPractice) {
    practiceScenarios.forEach((ps, i) => stages.push({
      type: "practice",
      title: `Practice: ${ps.title}`,
      index: i,
    }));
  }
  if (hasQuiz) stages.push({ type: "quiz", title: "Knowledge Check" });

  const totalStages = stages.length;
  const current = stages[currentStage] || stages[0];

  const handleComplete = async () => {
    if (!user) return;
    const moduleKey = `dealership-${dbId}`;
    try {
      await supabase.from("module_completions").upsert(
        {
          user_id: user.id,
          module_id: moduleKey,
          dealership_id: profile?.dealership_id || null,
          quiz_score: hasQuiz ? calculateScore() : null,
        },
        { onConflict: "user_id,module_id" }
      );
      toast.success("Module completed!");
      navigate("/learn");
    } catch {
      toast.error("Failed to save completion.");
    }
  };

  const calculateScore = () => {
    if (!module.quiz_questions.length) return 0;
    let correct = 0;
    module.quiz_questions.forEach((q) => {
      const selected = quizAnswers[q.id];
      if (selected !== undefined && q.options[selected]?.correct) correct++;
    });
    return Math.round((correct / module.quiz_questions.length) * 100);
  };

  const handleNext = () => {
    if (currentStage < totalStages - 1) {
      setCurrentStage((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStage > 0) setCurrentStage((s) => s - 1);
    else navigate("/learn");
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-sm text-muted-foreground">
                {currentStage + 1} / {totalStages}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStage + 1) / totalStages) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">{module.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">{current.title}</p>

          {/* Intro / Video stage */}
          {current.type === "intro" && (
            <div className="space-y-6">
              {module.description && (
                <div className="card-premium p-6">
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
              )}
              {hasVideo && (
                <VideoPlayer
                  videoUrl={module.video_url!}
                  title={module.video_title || module.title}
                  onComplete={() => {}}
                />
              )}
            </div>
          )}

          {/* Section content */}
          {current.type === "section" && current.index !== undefined && (
            <div className="space-y-6">
              {sections[current.index].video_url && (
                <VideoPlayer
                  videoUrl={sections[current.index].video_url!}
                  title={sections[current.index].title}
                  onComplete={() => {}}
                />
              )}
              {sections[current.index].content_html && (
                <div
                  className="card-premium p-6 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sections[current.index].content_html! }}
                />
              )}
              {!sections[current.index].content_html && !sections[current.index].video_url && (
                <div className="card-premium p-6 text-center text-muted-foreground">
                  Content coming soon for this section.
                </div>
              )}
            </div>
          )}

          {/* Practice scenario stage */}
          {current.type === "practice" && current.index !== undefined && (() => {
            const ps = practiceScenarios[current.index];
            const scenarioData: PracticeScenarioData = {
              id: ps.id,
              title: ps.title,
              customerSetup: ps.customer_setup,
              customerQuote: ps.customer_quote,
              decisionPoints: (ps.decision_points || []).map((dp: any) => ({
                id: dp.id,
                prompt: dp.prompt,
                context: dp.context,
                options: (dp.options || []).map((o: any) => ({
                  id: o.id,
                  text: o.text,
                  quality: o.quality,
                  feedback: o.feedback,
                  points: o.points,
                })),
              })),
            };
            return (
              <div className="space-y-4">
                <Badge variant="outline" className="capitalize">{ps.difficulty}</Badge>
                <PracticeScenario scenario={scenarioData} />
              </div>
            );
          })()}

          {/* Quiz stage */}
          {current.type === "quiz" && (
            <div className="space-y-6">
              {module.quiz_questions.map((q, qi) => (
                <div key={q.id} className="card-premium p-6">
                  <p className="font-medium text-foreground mb-4">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt: any, oi: number) => {
                      const selected = quizAnswers[q.id] === oi;
                      const showResult = quizSubmitted;
                      const isCorrect = opt.correct;
                      return (
                        <button
                          key={oi}
                          onClick={() => {
                            if (quizSubmitted) return;
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: oi }));
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            showResult && selected && isCorrect
                              ? "border-success bg-success/10"
                              : showResult && selected && !isCorrect
                              ? "border-destructive bg-destructive/10"
                              : showResult && isCorrect
                              ? "border-success/50 bg-success/5"
                              : selected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-sm">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && q.explanation && (
                    <p className="mt-3 text-sm text-muted-foreground italic">{q.explanation}</p>
                  )}
                </div>
              ))}
              {!quizSubmitted && (
                <Button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < module.quiz_questions.length}
                  className="w-full"
                >
                  Submit Answers
                </Button>
              )}
              {quizSubmitted && (
                <div className="card-premium p-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
                  <p className="text-lg font-semibold text-foreground">
                    Score: {calculateScore()}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStage === 0 ? "Back to Learn" : "Previous"}
            </Button>
            <Button onClick={handleNext}>
              {currentStage === totalStages - 1 ? "Complete Module" : "Continue"}
              {currentStage < totalStages - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
