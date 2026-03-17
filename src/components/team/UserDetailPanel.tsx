import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, TrendingUp, Clock, Target, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserDetailPanelProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

interface SessionDetail {
  id: string;
  scenario_type: string;
  score: number | null;
  rapport_score: number | null;
  info_gathering_score: number | null;
  needs_identification_score: number | null;
  cna_completion_score: number | null;
  status: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

interface ModuleCompletion {
  id: string;
  module_id: string;
  completed_at: string;
  quiz_score: number | null;
}

export function UserDetailPanel({ userId, userName, onBack }: UserDetailPanelProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [sessionsRes, completionsRes] = await Promise.all([
        supabase
          .from("training_sessions")
          .select("id, scenario_type, score, rapport_score, info_gathering_score, needs_identification_score, cna_completion_score, status, started_at, completed_at, duration_seconds")
          .eq("user_id", userId)
          .order("started_at", { ascending: false }),
        supabase
          .from("module_completions")
          .select("id, module_id, completed_at, quiz_score")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false }),
      ]);
      setSessions(sessionsRes.data || []);
      setCompletions(completionsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const completedSessions = sessions.filter(s => s.status === "completed");
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
    : 0;

  const avgCategories = completedSessions.length > 0
    ? {
        rapport: Math.round(completedSessions.reduce((s, x) => s + (x.rapport_score || 0), 0) / completedSessions.length),
        infoGathering: Math.round(completedSessions.reduce((s, x) => s + (x.info_gathering_score || 0), 0) / completedSessions.length),
        needsId: Math.round(completedSessions.reduce((s, x) => s + (x.needs_identification_score || 0), 0) / completedSessions.length),
        cna: Math.round(completedSessions.reduce((s, x) => s + (x.cna_completion_score || 0), 0) / completedSessions.length),
      }
    : { rapport: 0, infoGathering: 0, needsId: 0, cna: 0 };

  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const categories = [
    { label: "Rapport Building", value: avgCategories.rapport, icon: "🤝" },
    { label: "Info Gathering", value: avgCategories.infoGathering, icon: "🔍" },
    { label: "Needs Identification", value: avgCategories.needsId, icon: "🎯" },
    { label: "CNA Completion", value: avgCategories.cna, icon: "📋" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Team
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{userName}</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className={cn("text-xl font-bold", getScoreColor(avgScore))}>{avgScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Sessions</CardTitle>
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl font-bold">{completedSessions.length}</div>
            <p className="text-[10px] text-muted-foreground">{sessions.length} total started</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Time Spent</CardTitle>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl font-bold">{totalMinutes}m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Modules Done</CardTitle>
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl font-bold">{completions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Breakdown */}
      {completedSessions.length > 0 && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Skill Breakdown</CardTitle>
            <CardDescription className="text-xs">Average across {completedSessions.length} completed sessions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            {categories.map(cat => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-muted-foreground">{cat.label}</span>
                  </span>
                  <span className={cn("font-bold", getScoreColor(cat.value))}>{cat.value}%</span>
                </div>
                <Progress value={cat.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Session History</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No training sessions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium capitalize">{s.scenario_type.replace(/-/g, " ")}</TableCell>
                    <TableCell>
                      {s.score != null ? (
                        <span className={cn("font-semibold", getScoreColor(s.score))}>{s.score}%</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "completed" ? "default" : "secondary"}>
                        {s.status || "in_progress"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(s.started_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Module Completions */}
      {completions.length > 0 && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Module Completions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Quiz Score</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completions.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium capitalize">{c.module_id.replace(/-/g, " ")}</TableCell>
                    <TableCell>
                      {c.quiz_score != null ? (
                        <span className={cn("font-semibold", getScoreColor(c.quiz_score))}>{c.quiz_score}%</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(c.completed_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
