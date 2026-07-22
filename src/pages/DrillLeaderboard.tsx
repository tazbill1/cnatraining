import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Flame } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const DRILLS: Array<{ key: string; label: string }> = [
  { key: "phone_opener_drill_best_streak", label: "Phone Opener" },
  { key: "bypass_drill_best_streak", label: "Bypass" },
  { key: "spot_the_mistake_drill_best_streak", label: "Spot the Mistake" },
  { key: "spaced_match_best_streak", label: "S.P.A.C.E.D. Match" },
  { key: "either_or_close_best_streak", label: "Either/Or Close" },
  { key: "cric_match_best_streak", label: "C.R.I.C. Match" },
  { key: "hot_button_best_streak", label: "Hot Button" },
];

interface Row {
  user_id: string;
  best_streak: number;
  plays: number;
  full_name: string | null;
  email: string | null;
}

export default function DrillLeaderboard() {
  const navigate = useNavigate();
  const [activeDrill, setActiveDrill] = useState(DRILLS[0].key);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data: scores } = await supabase
        .from("drill_scores")
        .select("user_id,best_streak,plays")
        .eq("drill_key", activeDrill)
        .order("best_streak", { ascending: false })
        .limit(25);

      if (!scores || scores.length === 0) {
        if (!cancelled) { setRows([]); setLoading(false); }
        return;
      }

      const userIds = scores.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id,full_name,email")
        .in("user_id", userIds);

      const map = new Map((profiles || []).map((p) => [p.user_id, p]));
      const merged: Row[] = scores.map((s) => {
        const p = map.get(s.user_id);
        return {
          user_id: s.user_id,
          best_streak: s.best_streak,
          plays: s.plays,
          full_name: p?.full_name ?? null,
          email: p?.email ?? null,
        };
      });
      if (!cancelled) { setRows(merged); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [activeDrill]);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/scenarios")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Drill Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Top best-streaks across the team. Play a drill to get on the board.
          </p>

          <Tabs value={activeDrill} onValueChange={setActiveDrill}>
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
              {DRILLS.map((d) => (
                <TabsTrigger key={d.key} value={d.key} className="text-xs sm:text-sm">
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {DRILLS.map((d) => (
              <TabsContent key={d.key} value={d.key} className="mt-4">
                <Card className="p-4 sm:p-6">
                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No scores yet. Be the first!
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {rows.map((r, i) => (
                        <li
                          key={r.user_id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border"
                        >
                          <div className="w-8 text-center font-bold text-foreground/80">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base font-medium text-foreground truncate">
                              {r.full_name || r.email || "Team member"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {r.plays} play{r.plays === 1 ? "" : "s"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-primary">
                            <Flame className="w-4 h-4" />
                            {r.best_streak}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
