import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Shuffle, Check, AlertCircle, TrendingUp, MessageSquare, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface CategoryFeedback {
  score: number;
  label: string;
  strengths: string[];
  improvements: string[];
  tip: string;
}

interface ResultsState {
  results: {
    sessionId: string;
    overallScore: number;
    rapportScore: number;
    infoGatheringScore: number;
    needsIdentificationScore: number;
    cnaCompletionScore: number;
    categories?: Record<string, CategoryFeedback>;
    overallTip?: string;
    feedback: {
      strengths: string[];
      improvements: string[];
      examples: string[];
    };
    conversation: Array<{ role: string; content: string }>;
    durationSeconds: number;
    scenarioType: string;
  };
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTranscript, setShowTranscript] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const state = location.state as ResultsState | undefined;

  useEffect(() => {
    if (!state?.results) setShouldRedirect(true);
  }, [state]);

  useEffect(() => {
    if (shouldRedirect) navigate("/dashboard");
  }, [shouldRedirect, navigate]);

  if (!state?.results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  const { results } = state;
  const scenario = scenarios.find((s) => s.id === results.scenarioType);
  const hasCategories = results.categories && Object.keys(results.categories).length > 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-score-excellent";
    if (score >= 75) return "text-score-good";
    if (score >= 60) return "text-score-needs-work";
    return "text-score-practice";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-score-excellent";
    if (score >= 75) return "bg-score-good";
    if (score >= 60) return "bg-score-needs-work";
    return "bg-score-practice";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 75) return "Good Job!";
    if (score >= 60) return "Needs Work";
    return "Keep Practicing";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const categoryOrder = ["rapport", "infoGathering", "needsIdentification", "cnaCompletion"];
  const categoryIcons: Record<string, string> = {
    rapport: "🤝",
    infoGathering: "🔍",
    needsIdentification: "🎯",
    cnaCompletion: "📋",
  };

  // Fallback to legacy layout if no categories
  const scoreCategories = hasCategories
    ? categoryOrder.map((key) => ({
        key,
        label: results.categories![key]?.label || key,
        score: results.categories![key]?.score || 0,
      }))
    : [
        { key: "rapport", label: "Rapport Building", score: results.rapportScore },
        { key: "infoGathering", label: "Information Gathering", score: results.infoGatheringScore },
        { key: "needsIdentification", label: "Needs Identification", score: results.needsIdentificationScore },
        { key: "cnaCompletion", label: "CNA Completion", score: results.cnaCompletionScore },
      ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Overall Score */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Session Complete</h1>
            <p className="text-muted-foreground mb-6">
              {scenario?.name} • {formatDuration(results.durationSeconds)}
            </p>
            <div className={cn("inline-flex flex-col items-center justify-center w-40 h-40 rounded-full", getScoreBg(results.overallScore))}>
              <span className="text-5xl font-bold text-white">{results.overallScore}</span>
              <span className="text-sm text-white/80 mt-1">{getScoreLabel(results.overallScore)}</span>
            </div>
          </div>

          {/* Overall Coaching Tip */}
          {results.overallTip && (
            <div className="card-premium p-5 mb-6 flex items-start gap-3 border-l-4 border-primary">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Key Takeaway</p>
                <p className="text-sm text-muted-foreground">{results.overallTip}</p>
              </div>
            </div>
          )}

          {/* Per-Category Scorecard */}
          <div className="card-premium p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Score Breakdown
            </h2>
            <div className="space-y-3">
              {scoreCategories.map((cat) => {
                const isExpanded = expandedCategory === cat.key;
                const catData = hasCategories ? results.categories![cat.key] : null;

                return (
                  <div key={cat.key} className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-lg">{categoryIcons[cat.key] || "📊"}</span>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{cat.label}</span>
                          <span className={cn("text-lg font-bold", getScoreColor(cat.score))}>{cat.score}</span>
                        </div>
                        <Progress value={cat.score} className="h-2" />
                      </div>
                      {catData && (
                        isExpanded
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {isExpanded && catData && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
                        {/* Category strengths */}
                        {catData.strengths?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-success flex items-center gap-1 mb-2">
                              <Check className="w-3 h-3" /> Strengths
                            </h4>
                            <ul className="space-y-1">
                              {catData.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-muted-foreground pl-3 border-l-2 border-success/30">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Category improvements */}
                        {catData.improvements?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-warning flex items-center gap-1 mb-2">
                              <AlertCircle className="w-3 h-3" /> To Improve
                            </h4>
                            <ul className="space-y-1">
                              {catData.improvements.map((s, i) => (
                                <li key={i} className="text-sm text-muted-foreground pl-3 border-l-2 border-warning/30">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Category tip */}
                        {catData.tip && (
                          <div className="flex items-start gap-2 bg-primary/5 rounded-md p-3">
                            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground">{catData.tip}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legacy AI Feedback (shown if no categories) */}
          {!hasCategories && (
            <div className="card-premium p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                AI Coach Feedback
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-success flex items-center gap-2">
                    <Check className="w-4 h-4" /> What You Did Well
                  </h3>
                  <ul className="space-y-2">
                    {results.feedback.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-success/30">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-warning flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {results.feedback.improvements.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-warning/30">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Toggle */}
          <div className="card-premium mb-6">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-foreground">Conversation Transcript</span>
              <span className="text-sm text-primary">{showTranscript ? "Hide" : "Show"}</span>
            </button>
            {showTranscript && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-4 max-h-96 overflow-auto">
                {results.conversation.map((msg, i) => (
                  <div key={i} className={cn("p-3 rounded-lg text-sm", msg.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8")}>
                    <p className="text-xs text-muted-foreground mb-1 capitalize">
                      {msg.role === "user" ? "You" : "Customer"}
                    </p>
                    <p className="text-foreground">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate(`/training/${results.scenarioType}`)} variant="outline" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button onClick={() => navigate("/scenarios")} variant="outline" size="lg">
              <Shuffle className="w-4 h-4 mr-2" /> Different Scenario
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="btn-gradient" size="lg">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
