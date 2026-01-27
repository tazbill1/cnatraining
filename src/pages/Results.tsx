import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Shuffle, Check, AlertCircle, TrendingUp, MessageSquare } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ResultsState {
  results: {
    sessionId: string;
    overallScore: number;
    rapportScore: number;
    infoGatheringScore: number;
    needsIdentificationScore: number;
    cnaCompletionScore: number;
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

  const state = location.state as ResultsState | undefined;
  
  if (!state?.results) {
    navigate("/dashboard");
    return null;
  }

  const { results } = state;
  const scenario = scenarios.find((s) => s.id === results.scenarioType);

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

  const scoreCategories = [
    { label: "Rapport Building", score: results.rapportScore },
    { label: "Information Gathering", score: results.infoGatheringScore },
    { label: "Needs Identification", score: results.needsIdentificationScore },
    { label: "CNA Completion", score: results.cnaCompletionScore },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
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
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Session Complete
            </h1>
            <p className="text-muted-foreground mb-6">
              {scenario?.name} • {formatDuration(results.durationSeconds)}
            </p>
            <div
              className={cn(
                "inline-flex flex-col items-center justify-center w-40 h-40 rounded-full",
                getScoreBg(results.overallScore)
              )}
            >
              <span className="text-5xl font-bold text-white">
                {results.overallScore}
              </span>
              <span className="text-sm text-white/80 mt-1">
                {getScoreLabel(results.overallScore)}
              </span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="card-premium p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Score Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scoreCategories.map((cat) => (
                <div key={cat.label} className="text-center p-4 rounded-lg bg-muted/50">
                  <p
                    className={cn("text-3xl font-bold", getScoreColor(cat.score))}
                  >
                    {cat.score}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{cat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Feedback */}
          <div className="card-premium p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              AI Coach Feedback
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-success flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  What You Did Well
                </h3>
                <ul className="space-y-2">
                  {results.feedback.strengths.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground pl-4 border-l-2 border-success/30"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-warning flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {results.feedback.improvements.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground pl-4 border-l-2 border-warning/30"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Transcript Toggle */}
          <div className="card-premium mb-6">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-foreground">
                Conversation Transcript
              </span>
              <span className="text-sm text-primary">
                {showTranscript ? "Hide" : "Show"}
              </span>
            </button>
            {showTranscript && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-4 max-h-96 overflow-auto">
                {results.conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      msg.role === "user"
                        ? "bg-primary/10 ml-8"
                        : "bg-muted mr-8"
                    )}
                  >
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
            <Button
              onClick={() => navigate(`/training/${results.scenarioType}`)}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/scenarios")}
              variant="outline"
              size="lg"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Different Scenario
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="btn-gradient"
              size="lg"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
