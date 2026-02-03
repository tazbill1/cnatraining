import { TrendingUp, Target, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Metrics, Goals, Lead, PaceData } from "@/lib/performanceTypes";

interface ProgressTabProps {
  metrics: Metrics;
  goals: Goals;
  leads: Lead[];
  pace: PaceData;
}

export function ProgressTab({ metrics, goals, leads, pace }: ProgressTabProps) {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthProgress = Math.round((currentDay / daysInMonth) * 100);

  const internetLeads = leads.filter((l) => l.source === "internet");
  const phoneLeads = leads.filter((l) => l.source === "phone");
  const internetApptsSet = internetLeads.filter((l) =>
    ["appt-set", "showed", "sold"].includes(l.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Pace Tracker */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Am I On Track?</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              pace.status === "on-track"
                ? "bg-green-500/10 text-green-600"
                : pace.status === "warning"
                ? "bg-yellow-500/10 text-yellow-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {pace.status === "on-track"
              ? "✓ On Track"
              : pace.status === "warning"
              ? "⚠ Slightly Behind"
              : "✗ Behind Pace"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Sales</p>
            <p className="text-3xl font-bold text-foreground">{pace.current}</p>
            <p className="text-xs text-muted-foreground">units sold</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Expected by Now</p>
            <p className="text-3xl font-bold text-foreground">{pace.expected}</p>
            <p className="text-xs text-muted-foreground">based on goal</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Month-End Projection</p>
            <p className="text-3xl font-bold text-primary">{pace.projected}</p>
            <p className="text-xs text-muted-foreground">at current pace</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to Goal</span>
            <span className="font-medium">
              {goals.sales > 0 ? Math.round((pace.current / goals.sales) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={goals.sales > 0 ? Math.min((pace.current / goals.sales) * 100, 100) : 0}
            className="h-3"
          />
        </div>

        <div className="flex justify-between text-sm mb-4">
          <span className="text-muted-foreground">
            Day {currentDay} of {daysInMonth} ({monthProgress}% through month)
          </span>
          <span className={pace.gap >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {pace.gap >= 0 ? "+" : ""}
            {pace.gap} units {pace.gap >= 0 ? "ahead" : "behind"}
          </span>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {pace.status === "on-track"
              ? `Great job! You're on pace to hit ${pace.projected} units this month. Keep up the momentum!`
              : pace.status === "warning"
              ? `You're ${Math.abs(pace.gap)} units behind pace. You'll need to average ${Math.ceil(
                  (goals.sales - pace.current) / (daysInMonth - currentDay)
                )} sales per day to hit your goal.`
              : `To reach your goal of ${goals.sales} units, you need ${
                  goals.sales - pace.current
                } more sales in the next ${daysInMonth - currentDay} days (${Math.ceil(
                  (goals.sales - pace.current) / (daysInMonth - currentDay)
                )} per day).`}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Total Sales</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.totalSales}</p>
          <Progress value={(metrics.totalSales / goals.sales) * 100} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Goal: {goals.sales}{" "}
            <span className={metrics.totalSales >= goals.sales ? "text-green-600" : "text-primary"}>
              ({Math.round((metrics.totalSales / goals.sales) * 100)}%)
            </span>
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Show Rate</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.showRate}%</p>
          <Progress
            value={(parseFloat(String(metrics.showRate)) / goals.showRate) * 100}
            className="h-2 mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Goal: {goals.showRate}%
            {parseFloat(String(metrics.showRate)) >= goals.showRate && (
              <span className="text-green-600 ml-2">✓ Hit</span>
            )}
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Close Rate</span>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.closeRate}%</p>
          <Progress
            value={(parseFloat(String(metrics.closeRate)) / goals.closeRate) * 100}
            className="h-2 mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Goal: {goals.closeRate}%
            {parseFloat(String(metrics.closeRate)) >= goals.closeRate && (
              <span className="text-green-600 ml-2">✓ Hit</span>
            )}
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Conversion</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics.conversion}%</p>
          <p className="text-xs text-muted-foreground mt-4">Overall</p>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Activity Breakdown</h3>

        <div className="space-y-6">
          {/* Internet Leads */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-foreground">Internet Leads</span>
              <span className="text-sm">
                {metrics.internetLeads || 0} / {goals.internetLeads}
                <span
                  className={`ml-2 ${
                    (metrics.internetLeads || 0) >= goals.internetLeads
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  ({Math.round(((metrics.internetLeads || 0) / goals.internetLeads) * 100)}%)
                </span>
              </span>
            </div>
            <Progress
              value={((metrics.internetLeads || 0) / goals.internetLeads) * 100}
              className="h-2"
            />
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Leads</p>
                <p className="font-semibold">{internetLeads.length}</p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Appts Set</p>
                <p className="font-semibold">{internetApptsSet}</p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Shows</p>
                <p className="font-semibold">
                  {internetLeads.filter((l) => ["showed", "sold"].includes(l.status)).length}
                </p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="font-semibold text-green-600">
                  {internetLeads.filter((l) => l.status === "sold").length}
                </p>
              </div>
            </div>
          </div>

          {/* Phone Leads */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-foreground">Phone Leads</span>
              <span className="text-sm">
                {metrics.phoneLeads || 0} / {goals.phoneLeads}
                <span
                  className={`ml-2 ${
                    (metrics.phoneLeads || 0) >= goals.phoneLeads
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  ({Math.round(((metrics.phoneLeads || 0) / goals.phoneLeads) * 100)}%)
                </span>
              </span>
            </div>
            <Progress
              value={((metrics.phoneLeads || 0) / goals.phoneLeads) * 100}
              className="h-2"
            />
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Leads</p>
                <p className="font-semibold">{phoneLeads.length}</p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Appts Set</p>
                <p className="font-semibold">
                  {phoneLeads.filter((l) => ["appt-set", "showed", "sold"].includes(l.status)).length}
                </p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Shows</p>
                <p className="font-semibold">
                  {phoneLeads.filter((l) => ["showed", "sold"].includes(l.status)).length}
                </p>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="font-semibold text-green-600">
                  {phoneLeads.filter((l) => l.status === "sold").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
