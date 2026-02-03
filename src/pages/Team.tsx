import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, Activity, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
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

export default function Team() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserEngagement[]>([]);
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
    } else {
      setLoading(false);
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
            <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                All ({users.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs md:text-sm">
                Active ({activeUsers.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs md:text-sm text-destructive">
                Attention ({inactiveUsers.length})
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
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
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
