import { useCertificationProgress } from "@/hooks/useCertificationProgress";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { channelCategories, isValidChannelCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface CategoryBreakdownProps {
  /** Users to measure. Single id = personal view, many = team view. */
  userIds: string[];
  title?: string;
  description?: string;
  className?: string;
}

interface CategoryStat {
  id: string;
  name: string;
  totalModules: number;
  /** Completed module-slots (users x modules) */
  completedSlots: number;
  totalSlots: number;
  avgQuizScore: number;
}

export function CategoryBreakdown({
  userIds,
  title = "Category Breakdown",
  description = "Completion by skill category",
  className,
}: CategoryBreakdownProps) {
  const { loading, modules } = useCertificationProgress(userIds, "completions");
  const stats: CategoryStat[] = channelCategories.map(category => {
    const selected = modules.filter(m => (m.category || "phone") === category.id);
    const completedSlots = selected.reduce((sum, m) => sum + m.completedCount, 0);
    return { id: category.id, name: category.name, totalModules: selected.length, completedSlots,
      totalSlots: selected.length * new Set(userIds).size,
      avgQuizScore: completedSlots ? Math.round(selected.reduce((sum, m) => sum + m.avgQuizScore * m.completedCount, 0) / completedSlots) : 0 };
  });

  const scoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const withModules = stats.filter((s) => s.totalModules > 0);
  const weakest = withModules
    .slice()
    .sort((a, b) => a.completedSlots / (a.totalSlots || 1) - b.completedSlots / (b.totalSlots || 1))[0];

  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : withModules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No modules assigned yet.</p>
        ) : (
          <>
            {withModules.map((s) => {
              const info = channelCategories.find((c) => c.id === s.id);
              if (!info) return null;
              const Icon = info.icon;
              const pct = s.totalSlots > 0 ? Math.round((s.completedSlots / s.totalSlots) * 100) : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-sm mb-1 gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={cn("p-1 rounded", info.iconBg)}>
                        <Icon className={cn("w-3.5 h-3.5", info.iconColor)} />
                      </span>
                      <span className="truncate">{info.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {s.totalModules} module{s.totalModules === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {s.avgQuizScore > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Quiz: <span className={cn("ml-1 font-bold", scoreColor(s.avgQuizScore))}>{s.avgQuizScore}%</span>
                        </Badge>
                      )}
                      <span className="text-xs font-medium">{pct}%</span>
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
            {weakest && (
              <p className="text-xs text-muted-foreground pt-1">
                Weakest area: <span className="font-medium text-foreground">{weakest.name}</span>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
