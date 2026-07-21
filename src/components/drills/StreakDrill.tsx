import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, CheckCircle2, XCircle, RotateCcw, type LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { saveDrillScore } from "@/lib/drillScores";

export interface DrillChoice {
  text: string;
  correct: boolean;
  why: string;
}

export interface DrillItem {
  id: string;
  /** Optional context/setup shown above the prompt (e.g. a mini scenario). */
  scenario?: string;
  /** Label above the prompt. Defaults to "Customer says:". */
  promptLabel?: string;
  /** The prompt the learner is reacting to. */
  prompt: string;
  choices: DrillChoice[];
}

interface StreakDrillProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  questions: DrillItem[];
  bestStreakKey: string;
  questionsPerRound?: number;
  backTo?: string;
  correctLabel?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface ShuffledQuestion extends DrillItem {
  shuffledChoices: DrillChoice[];
}

export function StreakDrill({
  title,
  subtitle,
  icon: Icon,
  questions: pool,
  bestStreakKey,
  questionsPerRound = 10,
  backTo = "/scenarios",
  correctLabel = "Nice work",
}: StreakDrillProps) {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const buildRound = () => {
    const picked = shuffle(pool).slice(0, Math.min(questionsPerRound, pool.length));
    return picked.map((q) => ({ ...q, shuffledChoices: shuffle(q.choices) }));
  };

  useEffect(() => {
    setQuestions(buildRound());
    const stored = Number(localStorage.getItem(bestStreakKey) || "0");
    setBestStreak(isNaN(stored) ? 0 : stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = questions[index];
  const total = questions.length;

  const handleSelect = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    const isCorrect = current.shuffledChoices[choiceIdx].correct;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((c) => c + 1);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem(bestStreakKey, String(newStreak));
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setFinished(true);
      saveDrillScore(bestStreakKey, streak);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setQuestions(buildRound());
    setIndex(0);
    setSelected(null);
    setStreak(0);
    setCorrectCount(0);
    setFinished(false);
  };

  const progress = useMemo(
    () => (total ? ((index + (selected !== null ? 1 : 0)) / total) * 100 : 0),
    [index, selected, total]
  );

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(backTo)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
          </Button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
          </div>

          {!finished && current && (
            <>
              <div className="flex items-center justify-between mb-3 gap-4">
                <div className="text-sm text-muted-foreground">
                  Question {index + 1} of {total}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <Flame className="w-4 h-4" />
                    {streak}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    Best: {bestStreak}
                  </div>
                </div>
              </div>
              <Progress value={progress} className="mb-6 h-2" />

              <Card className="p-5 sm:p-6 mb-4">
                {current.scenario && (
                  <div className="mb-4 p-3 rounded-lg bg-muted border border-border">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                      Scenario
                    </div>
                    <p className="text-sm sm:text-base text-foreground/90 leading-snug">
                      {current.scenario}
                    </p>
                  </div>
                )}

                <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                  {current.promptLabel || "Customer says:"}
                </div>
                <p className="text-lg sm:text-xl font-medium text-foreground mb-6 leading-snug">
                  {current.prompt}
                </p>

                <div className="space-y-3">
                  {current.shuffledChoices.map((choice, i) => {
                    const isSelected = selected === i;
                    const showResult = selected !== null;
                    const isCorrect = choice.correct;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={showResult}
                        className={cn(
                          "w-full text-left p-4 sm:p-4 rounded-xl border-2 transition-all",
                          "min-h-[64px] flex items-start gap-3 active:scale-[0.99]",
                          !showResult && "border-border hover:border-primary/50 hover:bg-muted/40",
                          showResult && isCorrect && "border-success bg-success/10",
                          showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                          showResult && !isSelected && !isCorrect && "border-border opacity-60"
                        )}
                      >
                        {showResult && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        )}
                        <span className="text-base sm:text-base text-foreground leading-snug">{choice.text}</span>
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <div
                    className={cn(
                      "mt-5 p-4 rounded-lg border",
                      current.shuffledChoices[selected].correct
                        ? "bg-success/10 border-success/30"
                        : "bg-muted border-border"
                    )}
                  >
                    <div className="text-xs uppercase tracking-wide font-semibold text-foreground mb-1">
                      {current.shuffledChoices[selected].correct ? correctLabel : "Why this matters"}
                    </div>
                    <p className="text-sm text-foreground/90">
                      {current.shuffledChoices[selected].why}
                    </p>
                  </div>
                )}
              </Card>

              {selected !== null && (
                <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 bg-gradient-to-t from-background via-background to-transparent sm:bg-none">
                  <Button onClick={handleNext} size="lg" className="w-full sm:w-auto min-h-[52px] text-base">
                    {index + 1 >= total ? "See Results" : "Next Question"}
                  </Button>
                </div>
              )}
            </>
          )}


          {finished && (
            <Card className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Round Complete</h2>
              <p className="text-muted-foreground mb-6">
                You got <span className="font-semibold text-foreground">{correctCount}</span> of {total} right.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                <div className="p-4 rounded-xl bg-muted">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">This Round</div>
                  <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-primary" />
                    {streak}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Best Streak</div>
                  <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5 text-primary" />
                    {bestStreak}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRestart} size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button onClick={() => navigate(backTo)} variant="outline" size="lg">
                  Back to Practice
                </Button>
              </div>
            </Card>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
