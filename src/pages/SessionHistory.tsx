import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, Calendar, Check, X, MessageSquare, Search, Download } from "lucide-react";
import { downloadCsv } from "@/lib/csvExport";
import { scenarios } from "@/lib/scenarios";

function getScenarioName(scenarioType: string): string {
  const found = scenarios.find(s => s.id === scenarioType);
  if (found) return found.name;
  if (scenarioType.startsWith("custom-")) return "Custom Scenario";
  return scenarioType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
import { cnaChecklist, categoryLabels, ChecklistItem } from "@/lib/checklist";
import { phoneChecklist } from "@/lib/phoneChecklist";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface SessionDetail {
  id: string;
  scenario_type: string;
  score: number | null;
  duration_seconds: number | null;
  completed_at: string | null;
  started_at: string;
  rapport_score: number | null;
  info_gathering_score: number | null;
  needs_identification_score: number | null;
  cna_completion_score: number | null;
  conversation: Array<{ role: string; content: string; timestamp?: string }> | null;
  checklist_state: Record<string, boolean> | null;
  ai_feedback: Record<string, unknown> | null;
}

export default function SessionHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false });

        if (error) throw error;
        const sessionsData = (data || []) as unknown as SessionDetail[];
        setSessions(sessionsData);

        if (sessionId) {
          const found = sessionsData.find((s) => s.id === sessionId);
          if (found) setSelectedSession(found);
        }
      } catch (error) {
        logger.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [user, sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-score-excellent";
    if (score >= 75) return "text-score-good";
    if (score >= 60) return "text-score-needs-work";
    return "text-score-practice";
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isPhoneScenario = (_type: string) => {
    return false; // all scenarios now use CNA checklist
  };

  const getChecklist = (scenarioType: string) =>
    isPhoneScenario(scenarioType) ? phoneChecklist : cnaChecklist;

  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        getScenarioName(s.scenario_type).toLowerCase().includes(q)
      );
    }

    if (scoreFilter !== "all") {
      result = result.filter((s) => {
        const score = s.score ?? 0;
        if (scoreFilter === "90+") return score >= 90;
        if (scoreFilter === "75-89") return score >= 75 && score < 90;
        if (scoreFilter === "60-74") return score >= 60 && score < 75;
        if (scoreFilter === "<60") return score < 60;
        return true;
      });
    }

    if (sortBy === "oldest") {
      result.reverse();
    } else if (sortBy === "highest") {
      result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    }

    return result;
  }, [sessions, searchQuery, scoreFilter, sortBy]);

  if (selectedSession) {
    const session = selectedSession;
    const scenarioName = getScenarioName(session.scenario_type);
    const conversation = (session.conversation || []) as Array<{ role: string; content: string }>;
    const checklist = getChecklist(session.scenario_type);
    const checklistState = (session.checklist_state || {}) as Record<string, boolean>;
    const completedCount = Object.values(checklistState).filter(Boolean).length;

    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <Button variant="ghost" onClick={() => setSelectedSession(null)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
            </Button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{scenarioName}</h1>
                <p className="text-sm text-muted-foreground">
                  {session.completed_at ? formatDate(session.completed_at) : "Unknown"} •{" "}
                  {session.duration_seconds ? formatDuration(session.duration_seconds) : "—"}
                </p>
              </div>
              {session.score != null && (
                <div className={cn("text-4xl font-bold", getScoreColor(session.score))}>
                  {session.score}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversation replay */}
              <div className="lg:col-span-2 card-premium p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Conversation ({conversation.length} messages)
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-auto">
                  {conversation.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No conversation recorded</p>
                  ) : (
                    conversation.map((msg, i) => (
                      <div key={i} className={cn("p-3 rounded-lg text-sm", msg.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8")}>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">
                          {msg.role === "user" ? "You (Salesperson)" : "Customer"}
                        </p>
                        <p className="text-foreground">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Checklist sidebar */}
              <div className="card-premium p-6">
                <h2 className="font-semibold text-foreground mb-2">Checklist Coverage</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  {completedCount} / {checklist.length} items covered
                </p>
                <div className="space-y-2 max-h-[600px] overflow-auto">
                  {checklist.map((item) => {
                    const checked = checklistState[item.id] || false;
                    return (
                      <div key={item.id} className={cn("flex items-start gap-2 p-2 rounded-md text-sm", checked ? "bg-success/10" : "bg-muted/30")}>
                        {checked ? (
                          <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={cn("font-medium", checked ? "text-foreground" : "text-muted-foreground")}>{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  // Session list view
  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Session History</h1>
            <p className="text-sm text-muted-foreground">Review past training conversations and identify patterns</p>
          </div>

          {/* Filters */}
          {sessions.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by scenario name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="90+">90+ Excellent</SelectItem>
                    <SelectItem value="75-89">75-89 Good</SelectItem>
                    <SelectItem value="60-74">60-74 Needs Work</SelectItem>
                    <SelectItem value="<60">&lt;60 Practice</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Score</SelectItem>
                    <SelectItem value="lowest">Lowest Score</SelectItem>
                  </SelectContent>
                </Select>
                {(searchQuery || scoreFilter !== "all" || sortBy !== "newest") && (
                  <button
                    onClick={() => { setSearchQuery(""); setScoreFilter("all"); setSortBy("newest"); }}
                    className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-muted-foreground text-center py-12">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No completed sessions yet</p>
              <Button onClick={() => navigate("/scenarios")}>Start Training</Button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No sessions match your filters</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}</p>
              {filteredSessions.map((session) => {
                const scenarioDisplayName = getScenarioName(session.scenario_type);
                const checklistState = (session.checklist_state || {}) as Record<string, boolean>;
                const completedItems = Object.values(checklistState).filter(Boolean).length;
                const checklist = getChecklist(session.scenario_type);

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="w-full card-premium p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{scenarioDisplayName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {session.completed_at ? formatDate(session.completed_at) : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration_seconds ? formatDuration(session.duration_seconds) : "—"}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {completedItems}/{checklist.length} items
                        </Badge>
                      </div>
                    </div>
                    {session.score != null && (
                      <span className={cn("text-2xl font-bold", getScoreColor(session.score))}>
                        {session.score}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
