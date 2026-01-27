import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Trophy, Clock, Target, TrendingUp, Award } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { RecentSessionCard } from "@/components/dashboard/RecentSessionCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  scenario_type: string;
  score: number;
  duration_seconds: number;
  completed_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
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
          .order("completed_at", { ascending: false })
          .limit(5);

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

        // Certification progress (example: need 10 sessions with avg 80+ score)
        const certProgress = Math.min(100, Math.round((totalSessions / 10) * 50 + (averageScore >= 80 ? 50 : averageScore * 0.5)));

        setStats({
          totalSessions,
          averageScore,
          totalHours,
          certificationProgress: certProgress,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to sharpen your CNA skills today?
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
            <StatCard
              icon={<Trophy className="w-5 h-5 text-primary" />}
              label="Sessions Completed"
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
              label="Improvement"
              value="+12%"
              trend={{ value: 12, isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Card */}
            <div className="lg:col-span-1">
              <div className="card-premium p-6 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Certification Progress</h2>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing progress={stats.certificationProgress} />
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {stats.certificationProgress >= 100
                        ? "🎉 You're certification ready!"
                        : `${100 - stats.certificationProgress}% more to go`}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          stats.certificationProgress >= 100 ? "bg-success" : "bg-warning"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {stats.certificationProgress >= 100 ? "Ready" : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions & CTA */}
            <div className="lg:col-span-2 space-y-6">
              {/* Start Training CTA */}
              <div className="card-premium p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Ready to Practice?</h2>
                    <p className="text-primary-foreground/80">
                      Choose a customer scenario and start improving your CNA skills
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/scenarios")}
                    size="lg"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Training
                  </Button>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground">Recent Sessions</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/progress")}
                    className="text-primary"
                  >
                    View All
                  </Button>
                </div>
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <RecentSessionCard
                        key={session.id}
                        scenarioType={session.scenario_type}
                        date={new Date(session.completed_at)}
                        score={session.score}
                        durationSeconds={session.duration_seconds}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No training sessions yet
                    </p>
                    <Button onClick={() => navigate("/scenarios")} variant="outline">
                      Start Your First Session
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
