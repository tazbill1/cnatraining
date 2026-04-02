import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  completedCount: number;
  totalUsers: number;
  avgQuizScore: number;
}

interface TeamProgressDashboardProps {
  userIds: string[];
}

export function TeamProgressDashboard({ userIds }: TeamProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ModuleProgress[]>([]);

  useEffect(() => {
    if (userIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchModuleProgress = async () => {
      const { data } = await supabase
        .from("module_completions")
        .select("module_id, user_id, quiz_score")
        .in("user_id", userIds);

      const completions = data || [];
      const byModule = new Map<string, { users: Set<string>; scores: number[] }>();

      for (const c of completions) {
        if (!byModule.has(c.module_id)) {
          byModule.set(c.module_id, { users: new Set(), scores: [] });
        }
        const entry = byModule.get(c.module_id)!;
        entry.users.add(c.user_id);
        if (c.quiz_score != null) entry.scores.push(c.quiz_score);
      }

      const moduleList: ModuleProgress[] = Array.from(byModule.entries())
        .map(([moduleId, { users, scores }]) => ({
          moduleId,
          moduleName: moduleId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          completedCount: users.size,
          totalUsers: userIds.length,
          avgQuizScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        }))
        .sort((a, b) => b.completedCount - a.completedCount);

      setModules(moduleList);
      setLoading(false);
    };

    fetchModuleProgress();
  }, [userIds]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalCompletions = modules.reduce((s, m) => s + m.completedCount, 0);
  const avgCompletion = modules.length > 0
    ? Math.round(modules.reduce((s, m) => s + (m.completedCount / m.totalUsers) * 100, 0) / modules.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Modules Tracked</CardTitle>
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl font-bold">{modules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Total Completions</CardTitle>
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl font-bold">{totalCompletions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
            <CardTitle className="text-xs font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-xl font-bold">{avgCompletion}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Module breakdown */}
      {modules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No module completions yet</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Module Completion Rates</CardTitle>
            <CardDescription className="text-xs">
              How many team members completed each module
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            {modules.map((m) => {
              const pct = Math.round((m.completedCount / m.totalUsers) * 100);
              return (
                <div key={m.moduleId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground truncate max-w-[60%]">{m.moduleName}</span>
                    <div className="flex items-center gap-3">
                      {m.avgQuizScore > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Quiz: <span className={cn("ml-1 font-bold", getScoreColor(m.avgQuizScore))}>{m.avgQuizScore}%</span>
                        </Badge>
                      )}
                      <span className="text-xs font-medium">
                        {m.completedCount}/{m.totalUsers} ({pct}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
