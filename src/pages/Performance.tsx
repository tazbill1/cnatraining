import { useState, useEffect } from "react";
import { Target, Plus, BarChart3, Trophy, TrendingUp, DollarSign } from "lucide-react";
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
import { CommissionTab } from "@/components/performance/CommissionTab";
import {
  initialLeads,
  initialUserData,
  teamData,
  calculateMetricsFromLeads,
  calculateTeamMemberMetrics,
} from "@/lib/performanceData";
import type {
  Lead,
  Goals,
  UserPerformanceData,
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

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [nextLeadId, setNextLeadId] = useState(11);
  const [userData, setUserData] = useState<UserPerformanceData>(initialUserData);
  const [goalForm, setGoalForm] = useState<Goals>(userData.goals);

  const [leadForm, setLeadForm] = useState({
    name: "",
    source: "internet" as "internet" | "phone" | "walk-in",
    status: "lead" as Lead["status"],
  });

  // Sync goalForm when userData.goals changes
  useEffect(() => {
    setGoalForm(userData.goals);
  }, [userData.goals]);

  // Calculate current metrics
  const currentMetrics = calculateMetricsFromLeads(leads, userData.walkIn);

  // Calculate pace and projection
  const calculatePace = (): PaceData => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthProgress = currentDay / daysInMonth;

    const totalSales = currentMetrics.totalSales;
    const salesGoal = userData.goals.sales;
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

  // Get sorted team for leaderboard
  const getSortedTeam = () => {
    // Build team with current user's actual metrics
    const allTeam = [
      ...teamData.map((person) => ({
        name: person.name,
        metrics: calculateTeamMemberMetrics(person),
      })),
      {
        name: "You",
        metrics: currentMetrics,
      },
    ];

    return allTeam.sort((a, b) => {
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
  const handleSaveGoals = () => {
    setUserData((prev) => ({ ...prev, goals: { ...goalForm } }));
    setShowGoalModal(false);
  };

  const handleAddLead = (lead: Omit<Lead, "id">) => {
    setLeads((prev) => [...prev, { id: nextLeadId, ...lead }]);
    setNextLeadId((prev) => prev + 1);
  };

  const handleAddLeadFromModal = () => {
    if (!leadForm.name.trim()) return;
    handleAddLead(leadForm);
    setLeadForm({ name: "", source: "internet", status: "lead" });
    setShowLeadModal(false);
  };

  const handleLogWalkIn = (type: "visit" | "sale") => {
    setUserData((prev) => ({
      ...prev,
      walkIn: {
        visits: type === "visit" ? prev.walkIn.visits + 1 : prev.walkIn.visits,
        sales: type === "sale" ? prev.walkIn.sales + 1 : prev.walkIn.sales,
      },
    }));
  };

  const handleUpdateLeadStatus = (leadId: number, status: Lead["status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  const handleDeleteLead = (leadId: number) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Sales Performance Tracker
                </h1>
                <p className="text-muted-foreground">
                  Track your activity, hit your goals, climb the leaderboard
                </p>
              </div>
              <Button
                onClick={() => {
                  setGoalForm(userData.goals);
                  setShowGoalModal(true);
                }}
              >
                <Target className="w-4 h-4 mr-2" />
                Set Goals
              </Button>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="flex gap-2 mb-6">
            {(["mtd", "rolling90", "ytd"] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timePeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {period === "mtd"
                  ? "Month to Date"
                  : period === "rolling90"
                  ? "Rolling 90 Days"
                  : "Year to Date"}
              </button>
            ))}
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)} className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="entry" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Quick Entry
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                My Progress
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="commission" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Commission
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
              goals={userData.goals}
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

          {activeTab === "commission" && <CommissionTab />}
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
