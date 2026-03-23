import { useState, useEffect } from "react";
import { Target, Plus, BarChart3, Trophy, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalModal } from "@/components/performance/GoalModal";
import { LeadModal } from "@/components/performance/LeadModal";
import { QuickEntryTab } from "@/components/performance/QuickEntryTab";
import { PipelineTab } from "@/components/performance/PipelineTab";
import { ProgressTab } from "@/components/performance/ProgressTab";
import { LeaderboardTab } from "@/components/performance/LeaderboardTab";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import { calculateMetricsFromLeads } from "@/lib/performanceData";
import type {
  Lead,
  Goals,
  ActiveTab,
  LeaderboardView,
  TimePeriod,
  PaceData,
} from "@/lib/performanceTypes";

export default function Performance() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("entry");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("mtd");
  const [leaderboardView, setLeaderboardView] = useState<LeaderboardView>("sales");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const {
    leads,
    goals,
    walkIn,
    leaderboard,
    isLoading,
    addLead,
    updateLeadStatus,
    deleteLead,
    logWalkIn,
    saveGoals,
  } = usePerformanceData();

  const [goalForm, setGoalForm] = useState<Goals>(goals);

  const [leadForm, setLeadForm] = useState({
    name: "",
    source: "internet" as "internet" | "phone" | "walk-in",
    status: "lead" as Lead["status"],
  });

  // Sync goalForm when goals change (after fetch)
  useEffect(() => {
    setGoalForm(goals);
  }, [goals]);

  // Build userData shape for QuickEntryTab
  const userData = {
    name: "You",
    walkIn,
    goals,
  };

  // Calculate current metrics
  const currentMetrics = calculateMetricsFromLeads(leads, walkIn);

  // Calculate pace and projection
  const calculatePace = (): PaceData => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthProgress = currentDay / daysInMonth;

    const totalSales = currentMetrics.totalSales;
    const salesGoal = goals.sales;
    const expectedSales = salesGoal * monthProgress;
    const projectedSales = monthProgress > 0 ? Math.round(totalSales / monthProgress) : 0;

    return {
      current: totalSales,
      expected: Math.round(expectedSales),
      projected: projectedSales,
      gap: totalSales - Math.round(expectedSales),
      status:
        totalSales >= expectedSales * 0.9
          ? "on-track"
          : totalSales >= expectedSales * 0.75
          ? "warning"
          : "behind",
    };
  };

  const pace = calculatePace();

  // Leaderboard sorting
  const getSortedTeam = () => {
    return [...leaderboard].sort((a, b) => {
      if (leaderboardView === "sales") {
        return b.metrics.totalSales - a.metrics.totalSales;
      } else if (leaderboardView === "showRate") {
        return parseFloat(String(b.metrics.showRate)) - parseFloat(String(a.metrics.showRate));
      } else if (leaderboardView === "closeRate") {
        return parseFloat(String(b.metrics.closeRate)) - parseFloat(String(a.metrics.closeRate));
      } else {
        return parseFloat(String(b.metrics.conversion)) - parseFloat(String(a.metrics.conversion));
      }
    });
  };

  // Handlers
  const handleSaveGoals = async () => {
    await saveGoals(goalForm);
    setShowGoalModal(false);
  };

  const handleAddLead = async (lead: Omit<Lead, "id">) => {
    await addLead(lead);
  };

  const handleAddLeadFromModal = async () => {
    if (!leadForm.name.trim()) return;
    await addLead(leadForm);
    setLeadForm({ name: "", source: "internet", status: "lead" });
    setShowLeadModal(false);
  };

  const handleLogWalkIn = async (type: "visit" | "sale") => {
    await logWalkIn(type);
  };

  const handleUpdateLeadStatus = async (leadId: string, status: Lead["status"]) => {
    await updateLeadStatus(leadId, status);
  };

  const handleDeleteLead = async (leadId: string) => {
    await deleteLead(leadId);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading performance data…</p>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  Sales Performance
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track activity, hit goals, climb the leaderboard
                </p>
              </div>
              <Button
                onClick={() => {
                  setGoalForm(goals);
                  setShowGoalModal(true);
                }}
                className="w-full sm:w-auto"
              >
                <Target className="w-4 h-4 mr-2" />
                Set Goals
              </Button>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(["mtd", "rolling90", "ytd"] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                  timePeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {period === "mtd"
                  ? "MTD"
                  : period === "rolling90"
                  ? "90 Days"
                  : "YTD"}
              </button>
            ))}
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="entry" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <Plus className="w-4 h-4" />
                <span>Entry</span>
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>Pipeline</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <Trophy className="w-4 h-4" />
                <span>Board</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tab Content */}
          {activeTab === "entry" && (
            <QuickEntryTab
              leads={leads}
              userData={userData}
              onAddLead={handleAddLead}
              onLogWalkIn={handleLogWalkIn}
            />
          )}

          {activeTab === "pipeline" && (
            <PipelineTab
              leads={leads}
              onUpdateStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
              onAddLeadClick={() => setShowLeadModal(true)}
            />
          )}

          {activeTab === "dashboard" && (
            <ProgressTab
              metrics={currentMetrics}
              goals={goals}
              leads={leads}
              pace={pace}
            />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardTab
              sortedTeam={getSortedTeam()}
              leaderboardView={leaderboardView}
              setLeaderboardView={setLeaderboardView}
            />
          )}
        </div>

        {/* Modals */}
        <GoalModal
          open={showGoalModal}
          onOpenChange={setShowGoalModal}
          goalForm={goalForm}
          setGoalForm={setGoalForm}
          onSave={handleSaveGoals}
        />

        <LeadModal
          open={showLeadModal}
          onOpenChange={setShowLeadModal}
          leadForm={leadForm}
          setLeadForm={setLeadForm}
          onAdd={handleAddLeadFromModal}
        />
      </AppLayout>
    </AuthGuard>
  );
}
