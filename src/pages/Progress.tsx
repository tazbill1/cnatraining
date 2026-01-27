import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, Clock, Calendar, TrendingUp, Download } from "lucide-react";
import { scenarios } from "@/lib/scenarios";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cnaChecklist } from "@/lib/checklist";

interface SessionData {
  id: string;
  scenario_type: string;
  score: number;
  duration_seconds: number;
  completed_at: string;
  rapport_score: number;
  info_gathering_score: number;
  needs_identification_score: number;
  cna_completion_score: number;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalHours: 0,
    certificationProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("training_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false });

        if (error) throw error;

        const sessionsData = (data || []) as SessionData[];
        setSessions(sessionsData);

        // Calculate stats
        const totalSessions = sessionsData.length;
        const averageScore = totalSessions > 0
          ? Math.round(sessionsData.reduce((sum, s) => sum + s.score, 0) / totalSessions)
          : 0;
        const totalMinutes = sessionsData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60;
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        const certProgress = Math.min(100, Math.round((totalSessions / 10) * 50 + (averageScore >= 80 ? 50 : averageScore * 0.5)));

        setStats({
          totalSessions,
          averageScore,
          totalHours,
          certificationProgress: certProgress,
        });
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getScoreClass = (score: number) => {
    if (score >= 90) return "text-score-excellent";
    if (score >= 75) return "text-score-good";
    if (score >= 60) return "text-score-needs-work";
    return "text-score-practice";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  // Calculate section mastery (average scores per category)
  const sectionMastery = sessions.length > 0 ? {
    rapport: Math.round(sessions.reduce((sum, s) => sum + s.rapport_score, 0) / sessions.length),
    infoGathering: Math.round(sessions.reduce((sum, s) => sum + s.info_gathering_score, 0) / sessions.length),
    needsId: Math.round(sessions.reduce((sum, s) => sum + s.needs_identification_score, 0) / sessions.length),
    cnaCompletion: Math.round(sessions.reduce((sum, s) => sum + s.cna_completion_score, 0) / sessions.length),
  } : null;

  const handleExport = () => {
    const csv = [
      ["Date", "Scenario", "Score", "Duration", "Rapport", "Info Gathering", "Needs ID", "CNA Completion"],
      ...sessions.map((s) => [
        formatDate(s.completed_at),
        scenarios.find((sc) => sc.id === s.scenario_type)?.name || s.scenario_type,
        s.score,
        formatDuration(s.duration_seconds),
        s.rapport_score,
        s.info_gathering_score,
        s.needs_identification_score,
        s.cna_completion_score,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "training-progress.csv";
    a.click();
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Your Progress
              </h1>
              <p className="text-muted-foreground">
                Track your training journey and improvement over time
              </p>
            </div>
            <Button onClick={handleExport} variant="outline" disabled={sessions.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Trophy className="w-5 h-5 text-primary" />}
              label="Total Sessions"
              value={stats.totalSessions}
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-primary" />}
              label="Average Score"
              value={`${stats.averageScore}%`}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-primary" />}
              label="Hours Practiced"
              value={stats.totalHours}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
              label="Certification"
              value={`${stats.certificationProgress}%`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section Mastery */}
            <div className="card-premium p-6">
              <h2 className="font-semibold text-foreground mb-4">Section Mastery</h2>
              {sectionMastery ? (
                <div className="space-y-4">
                  {[
                    { label: "Rapport Building", value: sectionMastery.rapport },
                    { label: "Info Gathering", value: sectionMastery.infoGathering },
                    { label: "Needs Identification", value: sectionMastery.needsId },
                    { label: "CNA Completion", value: sectionMastery.cnaCompletion },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={cn("font-medium", getScoreClass(item.value))}>
                          {item.value}%
                        </span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete some sessions to see your mastery breakdown.
                </p>
              )}
            </div>

            {/* Sessions Table */}
            <div className="lg:col-span-2 card-premium p-6">
              <h2 className="font-semibold text-foreground mb-4">Session History</h2>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : sessions.length > 0 ? (
                <div className="overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Scenario</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="text-muted-foreground">
                            {formatDate(session.completed_at)}
                          </TableCell>
                          <TableCell>
                            {scenarios.find((s) => s.id === session.scenario_type)?.name ||
                              session.scenario_type}
                          </TableCell>
                          <TableCell>
                            <span className={cn("font-semibold", getScoreClass(session.score))}>
                              {session.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDuration(session.duration_seconds)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No sessions completed yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
