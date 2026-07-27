import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Flame, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadCsv } from "@/lib/csvExport";
import { toast } from "sonner";

const DRILLS: Array<{ key: string; label: string }> = [
  { key: "phone_opener_drill_best_streak", label: "Phone Opener" },
  { key: "bypass_drill_best_streak", label: "Bypass" },
  { key: "spot_the_mistake_drill_best_streak", label: "Spot the Mistake" },
  { key: "spaced_match_best_streak", label: "S.P.A.C.E.D. Match" },
  { key: "either_or_close_best_streak", label: "Either/Or Close" },
  { key: "cric_match_best_streak", label: "C.R.I.C. Match" },
  { key: "hot_button_best_streak", label: "Hot Button" },
  { key: "product_quiz_best_streak", label: "Product Quiz" },
  { key: "wrong_claim_best_streak", label: "Spot the Wrong Claim" },
  { key: "comparison_best_streak", label: "Us vs Them" },
];

const OVERALL = "__overall";
const TABS = [{ key: OVERALL, label: "Overall" }, ...DRILLS];

type Mode = "first" | "best";

interface ScoreRecord {
  user_id: string;
  drill_key: string;
  best_streak: number;
  first_streak: number | null;
  last_streak: number;
  plays: number;
  dealership_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Row {
  user_id: string;
  best_streak: number;
  first_streak: number;
  plays: number;
  full_name: string | null;
  email: string | null;
}

export default function DrillLeaderboard() {
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [activeDrill, setActiveDrill] = useState(OVERALL);
  const [mode, setMode] = useState<Mode>("first");
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { full_name: string | null; email: string | null }>>(new Map());
  const [dealerships, setDealerships] = useState<Map<string, string>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [{ data: { user } }, { data: all }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("drill_scores")
          .select("user_id,drill_key,best_streak,first_streak,last_streak,plays,dealership_id,created_at,updated_at")
          .in("drill_key", DRILLS.map((d) => d.key)),
      ]);

      const records = (all || []) as ScoreRecord[];
      let pmap = new Map<string, { full_name: string | null; email: string | null }>();
      const ids = Array.from(new Set(records.map((r) => r.user_id)));
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id,full_name,email")
          .in("user_id", ids);
        pmap = new Map((profs || []).map((p) => [p.user_id, { full_name: p.full_name, email: p.email }]));
      }

      const { data: deals } = await supabase.from("dealerships").select("id,name");

      if (!cancelled) {
        setDealerships(new Map((deals || []).map((d) => [d.id, d.name])));
        setUserId(user?.id ?? null);
        setScores(records);
        setProfiles(pmap);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const scoreOf = (r: ScoreRecord) =>
    mode === "first" ? (r.first_streak ?? r.best_streak ?? 0) : (r.best_streak ?? 0);

  // Full ranking (not truncated) for the active tab
  const ranking: Row[] = useMemo(() => {
    if (activeDrill === OVERALL) {
      const agg = new Map<string, { first: number; best: number; games: number }>();
      scores.forEach((s) => {
        const cur = agg.get(s.user_id) || { first: 0, best: 0, games: 0 };
        cur.first += s.first_streak ?? s.best_streak ?? 0;
        cur.best += s.best_streak ?? 0;
        cur.games += 1;
        agg.set(s.user_id, cur);
      });
      return Array.from(agg.entries())
        .map(([id, a]) => ({
          user_id: id,
          best_streak: a.best,
          first_streak: a.first,
          plays: a.games,
          full_name: profiles.get(id)?.full_name ?? null,
          email: profiles.get(id)?.email ?? null,
        }))
        .sort((x, y) => (mode === "first" ? y.first_streak - x.first_streak : y.best_streak - x.best_streak));
    }

    return scores
      .filter((s) => s.drill_key === activeDrill)
      .map((s) => ({
        user_id: s.user_id,
        best_streak: s.best_streak ?? 0,
        first_streak: s.first_streak ?? s.best_streak ?? 0,
        plays: s.plays ?? 0,
        full_name: profiles.get(s.user_id)?.full_name ?? null,
        email: profiles.get(s.user_id)?.email ?? null,
      }))
      .sort((x, y) => (mode === "first" ? y.first_streak - x.first_streak : y.best_streak - x.best_streak));
  }, [scores, profiles, activeDrill, mode]);

  const rows = ranking.slice(0, 25);

  const myIndex = userId ? ranking.findIndex((r) => r.user_id === userId) : -1;
  const me = myIndex >= 0 ? ranking[myIndex] : null;

  // Per-game point breakdown for the signed-in user
  const myBreakdown = useMemo(() => {
    if (!userId) return [];
    return DRILLS.map((d) => {
      const rec = scores.find((s) => s.user_id === userId && s.drill_key === d.key);
      return { label: d.label, points: rec ? scoreOf(rec) : null };
    });
  }, [scores, userId, mode]);

  const handleExport = () => {
    if (scores.length === 0) {
      toast.error("No scores to export yet.");
      return;
    }

    const labelOf = (key: string) => DRILLS.find((d) => d.key === key)?.label || key;

    // Rank lookups per game (contest = first attempt, best = all-time)
    const rankMaps = new Map<string, { first: Map<string, number>; best: Map<string, number> }>();
    DRILLS.forEach((d) => {
      const list = scores.filter((s) => s.drill_key === d.key);
      const firstRank = new Map(
        [...list]
          .sort((a, b) => (b.first_streak ?? b.best_streak ?? 0) - (a.first_streak ?? a.best_streak ?? 0))
          .map((s, i) => [s.user_id, i + 1] as [string, number])
      );
      const bestRank = new Map(
        [...list]
          .sort((a, b) => (b.best_streak ?? 0) - (a.best_streak ?? 0))
          .map((s, i) => [s.user_id, i + 1] as [string, number])
      );
      rankMaps.set(d.key, { first: firstRank, best: bestRank });
    });

    // Overall ranks
    const totals = new Map<string, { first: number; best: number; games: number; plays: number }>();
    scores.forEach((s) => {
      const cur = totals.get(s.user_id) || { first: 0, best: 0, games: 0, plays: 0 };
      cur.first += s.first_streak ?? s.best_streak ?? 0;
      cur.best += s.best_streak ?? 0;
      cur.games += 1;
      cur.plays += s.plays || 0;
      totals.set(s.user_id, cur);
    });
    const overallFirstRank = new Map(
      Array.from(totals.entries()).sort((a, b) => b[1].first - a[1].first).map(([id], i) => [id, i + 1] as [string, number])
    );
    const overallBestRank = new Map(
      Array.from(totals.entries()).sort((a, b) => b[1].best - a[1].best).map(([id], i) => [id, i + 1] as [string, number])
    );

    const rows: Record<string, string | number>[] = [];

    Array.from(totals.keys())
      .sort((a, b) => (totals.get(b)!.first - totals.get(a)!.first))
      .forEach((uid) => {
        const p = profiles.get(uid);
        const t = totals.get(uid)!;
        const name = p?.full_name || p?.email || "Team member";
        const email = p?.email || "";

        DRILLS.forEach((d) => {
          const rec = scores.find((s) => s.user_id === uid && s.drill_key === d.key);
          rows.push({
            "Team Member": name,
            Email: email,
            Dealership: rec?.dealership_id ? dealerships.get(rec.dealership_id) || "" : "",
            Game: d.label,
            "Contest Score (1st attempt)": rec ? (rec.first_streak ?? rec.best_streak ?? 0) : "",
            "Best Score": rec ? rec.best_streak ?? 0 : "",
            "Most Recent Score": rec ? rec.last_streak ?? 0 : "",
            Plays: rec ? rec.plays ?? 0 : 0,
            "Contest Rank": rec ? rankMaps.get(d.key)!.first.get(uid) ?? "" : "",
            "Best Rank": rec ? rankMaps.get(d.key)!.best.get(uid) ?? "" : "",
            Played: rec ? "Yes" : "No",
            "First Played": rec?.created_at ? new Date(rec.created_at).toLocaleDateString() : "",
            "Last Played": rec?.updated_at ? new Date(rec.updated_at).toLocaleDateString() : "",
          });
        });

        rows.push({
          "Team Member": name,
          Email: email,
          Dealership: "",
          Game: "TOTAL (all games)",
          "Contest Score (1st attempt)": t.first,
          "Best Score": t.best,
          "Most Recent Score": "",
          Plays: t.plays,
          "Contest Rank": overallFirstRank.get(uid) ?? "",
          "Best Rank": overallBestRank.get(uid) ?? "",
          Played: `${t.games} of ${DRILLS.length} games`,
          "First Played": "",
          "Last Played": "",
        });
      });

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(rows, `leaderboard-standings-${stamp}.csv`);
    toast.success("Leaderboard exported");
  };

  const myTotal = myBreakdown.reduce((sum, b) => sum + (b.points ?? 0), 0);
  const gamesPlayed = myBreakdown.filter((b) => b.points !== null).length;

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
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            {activeDrill === OVERALL ? "Total points across all games. " : ""}
            {mode === "first"
              ? "Contest standings: everyone's very first attempt at each game. Keep playing to improve — your first score stays locked in."
              : "Best streak ever recorded across all attempts."}
          </p>

          <div className="flex gap-2 mb-4">
            <Button size="sm" variant={mode === "first" ? "default" : "outline"} onClick={() => setMode("first")}>
              Contest (1st attempt)
            </Button>
            <Button size="sm" variant={mode === "best" ? "default" : "outline"} onClick={() => setMode("best")}>
              Best ever
            </Button>
            {isManager && (
              <Button size="sm" variant="outline" onClick={handleExport} className="ml-auto">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {/* Your standing */}
          {!loading && (
            <Card className="p-4 sm:p-5 mb-6 border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Your standing {activeDrill === OVERALL ? "· Overall" : `· ${TABS.find((t) => t.key === activeDrill)?.label}`}
                  </div>
                  <div className="flex items-baseline gap-4">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        {me ? `#${myIndex + 1}` : "—"}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        of {ranking.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <Flame className="w-4 h-4" />
                      {me ? (mode === "first" ? me.first_streak : me.best_streak) : 0}
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        {activeDrill === OVERALL ? "total points" : "points"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Contest points (all games)</div>
                  <div className="text-xl font-bold text-foreground">{myTotal}</div>
                  <div className="text-xs text-muted-foreground">
                    {gamesPlayed} of {DRILLS.length} games played
                  </div>
                </div>
              </div>

              {/* Point breakdown */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-2">
                {myBreakdown.map((b) => (
                  <div
                    key={b.label}
                    className={
                      "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs " +
                      (b.points === null ? "bg-muted/40 text-muted-foreground" : "bg-background border border-border")
                    }
                  >
                    <span className="truncate">{b.label}</span>
                    <span className={b.points === null ? "" : "font-semibold text-foreground"}>
                      {b.points === null ? "—" : b.points}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Tabs value={activeDrill} onValueChange={setActiveDrill}>
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
              {TABS.map((d) => (
                <TabsTrigger key={d.key} value={d.key} className="text-xs sm:text-sm">
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {TABS.map((d) => (
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
                          className={
                            "flex items-center gap-3 p-3 rounded-lg border " +
                            (r.user_id === userId
                              ? "bg-primary/10 border-primary/40"
                              : "bg-muted/40 border-border")
                          }
                        >
                          <div className="w-8 text-center font-bold text-foreground/80">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base font-medium text-foreground truncate">
                              {r.full_name || r.email || "Team member"}
                              {r.user_id === userId && (
                                <span className="ml-2 text-xs text-primary font-semibold">You</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {activeDrill === OVERALL
                                ? `${r.plays} game${r.plays === 1 ? "" : "s"} played`
                                : `${r.plays} play${r.plays === 1 ? "" : "s"}`}
                              {mode === "first"
                                ? ` · best ${r.best_streak}`
                                : ` · 1st attempt ${r.first_streak}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-primary">
                            <Flame className="w-4 h-4" />
                            {mode === "first" ? r.first_streak : r.best_streak}
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
