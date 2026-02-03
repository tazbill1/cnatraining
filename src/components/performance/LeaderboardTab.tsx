import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LeaderboardView, Metrics } from "@/lib/performanceTypes";

interface TeamMemberWithMetrics {
  name: string;
  metrics: Metrics;
}

interface LeaderboardTabProps {
  sortedTeam: TeamMemberWithMetrics[];
  leaderboardView: LeaderboardView;
  setLeaderboardView: (view: LeaderboardView) => void;
}

export function LeaderboardTab({
  sortedTeam,
  leaderboardView,
  setLeaderboardView,
}: LeaderboardTabProps) {
  const views: { key: LeaderboardView; label: string }[] = [
    { key: "sales", label: "Total Sales" },
    { key: "showRate", label: "Show Rate" },
    { key: "closeRate", label: "Close Rate" },
    { key: "conversion", label: "Conversion" },
  ];

  const getDisplayValue = (metrics: Metrics) => {
    switch (leaderboardView) {
      case "sales":
        return metrics.totalSales.toString();
      case "showRate":
        return `${metrics.showRate}%`;
      case "closeRate":
        return `${metrics.closeRate}%`;
      case "conversion":
        return `${metrics.conversion}%`;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex gap-2 flex-wrap">
        {views.map((view) => (
          <button
            key={view.key}
            onClick={() => setLeaderboardView(view.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              leaderboardView === view.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card-premium overflow-hidden">
        {sortedTeam.map((person, index) => {
          const isYou = person.name === "You";
          const isTop3 = index < 3;

          return (
            <div
              key={person.name}
              className={`flex items-center gap-4 p-4 border-b border-border last:border-b-0 ${
                isYou ? "bg-primary/5" : ""
              }`}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                {index === 0 ? (
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />
                ) : index === 1 ? (
                  <Trophy className="w-6 h-6 text-gray-400 mx-auto" />
                ) : index === 2 ? (
                  <Trophy className="w-6 h-6 text-amber-600 mx-auto" />
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={isTop3 ? "bg-primary/10 text-primary" : "bg-muted"}
                  >
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-medium ${isYou ? "text-primary" : "text-foreground"}`}>
                    {person.name}
                    {isYou && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className={`text-2xl font-bold ${isTop3 ? "text-primary" : "text-foreground"}`}>
                  {getDisplayValue(person.metrics)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {leaderboardView === "sales"
                    ? "units"
                    : leaderboardView === "showRate"
                    ? "show rate"
                    : leaderboardView === "closeRate"
                    ? "close rate"
                    : "conversion"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your Position Summary */}
      {(() => {
        const yourPosition = sortedTeam.findIndex((p) => p.name === "You") + 1;
        const yourMetrics = sortedTeam.find((p) => p.name === "You")?.metrics;
        const leader = sortedTeam[0];

        if (!yourMetrics || yourPosition === 1) return null;

        const gap =
          leaderboardView === "sales"
            ? leader.metrics.totalSales - yourMetrics.totalSales
            : parseFloat(String(leader.metrics[leaderboardView])) -
              parseFloat(String(yourMetrics[leaderboardView]));

        return (
          <div className="card-premium p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              You're in <span className="font-semibold text-foreground">#{yourPosition}</span> place.
              {gap > 0 && (
                <>
                  {" "}
                  Close the gap:{" "}
                  <span className="font-semibold text-primary">
                    {leaderboardView === "sales"
                      ? `${gap} more sales`
                      : `${gap.toFixed(1)}% improvement`}
                  </span>{" "}
                  to catch {leader.name}!
                </>
              )}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
