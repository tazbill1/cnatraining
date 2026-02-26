import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Activity, Clock, TrendingUp, AlertTriangle, Mail, Loader2, UserPlus, Check, X, BarChart3, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/logger";

interface UserEngagement {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  total_sessions: number;
  avg_score: number;
  last_session_date: string | null;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function Team() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserEngagement[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [teamSessions, setTeamSessions] = useState<Array<{
    user_id: string;
    score: number;
    rapport_score: number;
    info_gathering_score: number;
    needs_identification_score: number;
    cna_completion_score: number;
    completed_at: string;
  }>>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeThisWeek: 0,
    totalSessions: 0,
    avgTeamScore: 0,
  });

  useEffect(() => {
    checkManagerRole();
  }, [user]);

  const checkManagerRole = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "manager")
      .maybeSingle();

    if (data?.role === "manager") {
      setIsManager(true);
      fetchEngagementData();
      fetchInvitations();
    } else {
      setLoading(false);
    }
  };
  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvitations(data as Invitation[]);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast({ variant: "destructive", title: "Please enter a valid email" });
      return;
    }
    setIsSendingInvite(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-invite", {
        body: { email: inviteEmail.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Invitation sent!", description: `Invite sent to ${inviteEmail.trim()}` });
      setInviteEmail("");
      fetchInvitations();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send invite", description: err.message });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleResendInvite = async (inv: Invitation) => {
    setResendingId(inv.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-invite", {
        body: { email: inv.email, resend: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Invitation resent!", description: `Invite resent to ${inv.email}` });
      fetchInvitations();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to resend", description: err.message });
    } finally {
      setResendingId(null);
    }
  };

  const fetchEngagementData = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("last_active_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: sessions, error: sessionsError } = await supabase
        .from("training_sessions")
        .select("*");

      if (sessionsError) throw sessionsError;

      const userEngagement: UserEngagement[] = (profiles || []).map((profile) => {
        const userSessions = (sessions || []).filter((s) => s.user_id === profile.user_id);
        const completedSessions = userSessions.filter((s) => s.status === "completed");
        const avgScore = completedSessions.length > 0
          ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
          : 0;
        const lastSession = userSessions.sort((a, b) => 
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        )[0];

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name || "Unknown",
          email: profile.email,
          last_active_at: profile.last_active_at,
          total_sessions: completedSessions.length,
          avg_score: avgScore,
          last_session_date: lastSession?.started_at || null,
        };
      });

      setUsers(userEngagement);

      // Store completed sessions for insights
      const completedAll = (sessions || [])
        .filter((s) => s.status === "completed" && s.score != null)
        .map((s) => ({
          user_id: s.user_id,
          score: s.score || 0,
          rapport_score: s.rapport_score || 0,
          info_gathering_score: s.info_gathering_score || 0,
          needs_identification_score: s.needs_identification_score || 0,
          cna_completion_score: s.cna_completion_score || 0,
          completed_at: s.completed_at || s.started_at,
        }));
      setTeamSessions(completedAll);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const activeThisWeek = userEngagement.filter((u) => 
        u.last_active_at && new Date(u.last_active_at) > oneWeekAgo
      ).length;

      const totalSessions = userEngagement.reduce((sum, u) => sum + u.total_sessions, 0);
      const usersWithScores = userEngagement.filter((u) => u.avg_score > 0);
      const avgTeamScore = usersWithScores.length > 0
        ? Math.round(usersWithScores.reduce((sum, u) => sum + u.avg_score, 0) / usersWithScores.length)
        : 0;

      setStats({
        totalUsers: userEngagement.length,
        activeThisWeek,
        totalSessions,
        avgTeamScore,
      });
    } catch (error) {
      logger.error("Error fetching engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityStatus = (lastActive: string | null) => {
    if (!lastActive) return { label: "Never", variant: "destructive" as const };
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) return { label: "Active", variant: "default" as const };
    if (daysDiff <= 7) return { label: "This week", variant: "secondary" as const };
    if (daysDiff <= 30) return { label: "This month", variant: "outline" as const };
    return { label: "Inactive", variant: "destructive" as const };
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { color: "bg-green-500/10 text-green-600 border-green-500/20" };
    if (score >= 75) return { color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
    if (score >= 60) return { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
    return { color: "bg-red-500/10 text-red-600 border-red-500/20" };
  };

  if (!isManager && !loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-4 md:p-8 max-w-4xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl md:text-2xl font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              This page is only available to managers.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  const activeUsers = users.filter((u) => {
    const status = getActivityStatus(u.last_active_at);
    return status.label === "Active" || status.label === "This week";
  });

  const inactiveUsers = users.filter((u) => {
    const status = getActivityStatus(u.last_active_at);
    return status.label === "Inactive" || status.label === "Never";
  });

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() => navigate("/dashboard")}
              className="mb-3 md:mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Team Engagement</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor user activity and training progress
            </p>
          </div>

          {/* Invite Section */}
          <Card className="mb-6 md:mb-8">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                Invite Team Member
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Send an invitation email to add someone to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="colleague@dealership.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  />
                </div>
                <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                  {isSendingInvite ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>

              {invitations.length > 0 && (
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Recent Invitations</Label>
                  <div className="space-y-2">
                    {invitations.slice(0, 5).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <span className="truncate">{inv.email}</span>
                        <div className="flex items-center gap-2">
                          {inv.status !== "accepted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              disabled={resendingId === inv.id}
                              onClick={() => handleResendInvite(inv)}
                            >
                              {resendingId === inv.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><RefreshCw className="w-3 h-3 mr-1" /> Resend</>
                              )}
                            </Button>
                          )}
                          <Badge variant={inv.status === "accepted" ? "default" : "secondary"} className="text-xs">
                            {inv.status === "accepted" ? (
                              <><Check className="w-3 h-3 mr-1" /> Joined</>
                            ) : inv.status === "sent" ? (
                              <><Mail className="w-3 h-3 mr-1" /> Sent</>
                            ) : (
                              inv.status
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Total Users</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Active</CardTitle>
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-600">{stats.activeThisWeek}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? Math.round((stats.activeThisWeek / stats.totalUsers) * 100) : 0}% of team
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Sessions</CardTitle>
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold">{stats.totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium">Avg Score</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold">{stats.avgTeamScore}%</div>
              </CardContent>
            </Card>
          </div>

          {/* User Tables/Cards */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                All ({users.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs md:text-sm">
                Active ({activeUsers.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs md:text-sm text-destructive">
                Attention ({inactiveUsers.length})
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs md:text-sm">
                <BarChart3 className="w-3 h-3 mr-1" /> Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <UserList 
                users={users} 
                getActivityStatus={getActivityStatus} 
                getScoreBadge={getScoreBadge}
                isMobile={isMobile}
              />
            </TabsContent>

            <TabsContent value="active">
              <UserList 
                users={activeUsers} 
                getActivityStatus={getActivityStatus} 
                getScoreBadge={getScoreBadge}
                isMobile={isMobile}
              />
            </TabsContent>

            <TabsContent value="inactive">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                    Users Needing Attention
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    These users haven't practiced recently
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                  <UserList 
                    users={inactiveUsers} 
                    getActivityStatus={getActivityStatus} 
                    getScoreBadge={getScoreBadge}
                    isMobile={isMobile}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <TeamInsights sessions={teamSessions} users={users} />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}

// Team Insights Component
interface TeamInsightsProps {
  sessions: Array<{
    user_id: string;
    score: number;
    rapport_score: number;
    info_gathering_score: number;
    needs_identification_score: number;
    cna_completion_score: number;
    completed_at: string;
  }>;
  users: UserEngagement[];
}

function TeamInsights({ sessions, users }: TeamInsightsProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No completed sessions yet. Insights will appear once team members complete training.</p>
      </div>
    );
  }

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const teamAvgs = {
    rapport: avg(sessions.map((s) => s.rapport_score)),
    infoGathering: avg(sessions.map((s) => s.info_gathering_score)),
    needsId: avg(sessions.map((s) => s.needs_identification_score)),
    cnaCompletion: avg(sessions.map((s) => s.cna_completion_score)),
  };

  const categories = [
    { label: "Rapport Building", value: teamAvgs.rapport, icon: "🤝" },
    { label: "Info Gathering", value: teamAvgs.infoGathering, icon: "🔍" },
    { label: "Needs Identification", value: teamAvgs.needsId, icon: "🎯" },
    { label: "CNA Completion", value: teamAvgs.cnaCompletion, icon: "📋" },
  ];

  // Find weakest area
  const weakest = categories.reduce((min, cat) => cat.value < min.value ? cat : min, categories[0]);

  // Top performers (sorted by avg score)
  const topPerformers = [...users]
    .filter((u) => u.avg_score > 0 && u.total_sessions >= 2)
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 5);

  // Most improved: users with 3+ sessions where recent scores > older scores
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-score-excellent";
    if (score >= 75) return "text-score-good";
    if (score >= 60) return "text-score-needs-work";
    return "text-score-practice";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card>
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg">Team Score Breakdown</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Average scores across all {sessions.length} completed sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2 space-y-4">
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="text-muted-foreground">{cat.label}</span>
                </span>
                <span className={cn("font-bold", getScoreColor(cat.value))}>
                  {cat.value}%
                </span>
              </div>
              <Progress value={cat.value} className="h-2" />
            </div>
          ))}
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm">
              <span className="font-medium text-warning">Focus area:</span>{" "}
              <span className="text-muted-foreground">
                {weakest.icon} {weakest.label} ({weakest.value}%) is the team's weakest category
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            🏆 Top Performers
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Team members with highest average scores (2+ sessions)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2">
          {topPerformers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Need more sessions to determine top performers
            </p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.total_sessions} sessions</p>
                  </div>
                  <span className={cn("text-lg font-bold", getScoreColor(user.avg_score))}>
                    {user.avg_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface UserListProps {
  users: UserEngagement[];
  getActivityStatus: (lastActive: string | null) => { label: string; variant: "default" | "secondary" | "destructive" | "outline" };
  getScoreBadge: (score: number) => { color: string };
  isMobile: boolean;
}

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.***";
  const [user, domain] = email.split("@");
  const maskedUser = user.length > 2 ? `${user.substring(0, 2)}${"*".repeat(Math.min(user.length - 2, 5))}` : user;
  return `${maskedUser}@${domain}`;
}

function UserList({ users, getActivityStatus, getScoreBadge, isMobile }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No users found
      </div>
    );
  }

  // Mobile: Card-based layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {users.map((user) => {
          const status = getActivityStatus(user.last_active_at);
          const scoreBadge = getScoreBadge(user.avg_score);
          
          return (
            <Card key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs">
                    {user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{user.full_name}</span>
                    <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{maskEmail(user.email)}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Sessions</p>
                      <p className="text-sm font-medium">{user.total_sessions}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Avg Score</p>
                      {user.avg_score > 0 ? (
                        <Badge variant="outline" className={`${scoreBadge.color} text-xs px-1.5`}>
                          {user.avg_score}%
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Last Active</p>
                      <p className="text-xs">
                        {user.last_active_at
                          ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true }).replace(" ago", "")
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Sessions</TableHead>
          <TableHead>Avg Score</TableHead>
          <TableHead>Last Practice</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const status = getActivityStatus(user.last_active_at);
          const scoreBadge = getScoreBadge(user.avg_score);
          
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">{maskEmail(user.email)}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {user.last_active_at
                  ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                  : "Never"}
              </TableCell>
              <TableCell>{user.total_sessions}</TableCell>
              <TableCell>
                {user.avg_score > 0 ? (
                  <Badge variant="outline" className={scoreBadge.color}>
                    {user.avg_score}%
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {user.last_session_date
                  ? formatDistanceToNow(new Date(user.last_session_date), { addSuffix: true })
                  : "Never"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
