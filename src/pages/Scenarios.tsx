import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ScenarioCard } from "@/components/training/ScenarioCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { scenarios, scenarioCategories, getScenariosByCategory, ScenarioCategory } from "@/lib/scenarios";

export default function Scenarios() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory>("cna-practice");

  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/training/${scenarioId}`);
  };

  const cnaPracticeScenarios = getScenariosByCategory("cna-practice");
  const tradeAppraisalScenarios = getScenariosByCategory("trade-appraisal");
  const phonePracticeScenarios = getScenariosByCategory("phone-practice");

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Practice Center
            </h1>
            <p className="text-muted-foreground">
              Choose a category to practice your sales skills
            </p>
          </div>

          {/* Category Tabs */}
          <Tabs
            value={activeCategory}
            onValueChange={(value) => setActiveCategory(value as ScenarioCategory)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto p-1.5 gap-1.5">
              {scenarioCategories.map((category) => {
                const colorMap: Record<string, string> = {
                  "cna-practice": "text-blue-500",
                  "trade-appraisal": "text-emerald-500",
                  "phone-practice": "text-amber-500",
                  "reference": "text-purple-500",
                };
                const bgMap: Record<string, string> = {
                  "cna-practice": "data-[state=active]:border-blue-500/40 data-[state=active]:bg-blue-500/10",
                  "trade-appraisal": "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-500/10",
                  "phone-practice": "data-[state=active]:border-amber-500/40 data-[state=active]:bg-amber-500/10",
                  "reference": "data-[state=active]:border-purple-500/40 data-[state=active]:bg-purple-500/10",
                };
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-transparent transition-all ${bgMap[category.id] || ""}`}
                  >
                    <category.icon className={`w-5 h-5 ${colorMap[category.id] || ""}`} />
                    <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                      {category.name}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* CNA Practice Tab */}
            <TabsContent value="cna-practice" className="mt-0">
              {/* Difficulty Legend */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Beginner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Intermediate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">Advanced</span>
                </div>
              </div>

              {/* Scenario Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {cnaPracticeScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onClick={() => handleSelectScenario(scenario.id)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Trade Appraisal Tab */}
            <TabsContent value="trade-appraisal" className="mt-0">
              {/* Difficulty Legend */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Beginner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Intermediate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">Advanced</span>
                </div>
              </div>

              {/* Scenario Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {tradeAppraisalScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onClick={() => handleSelectScenario(scenario.id)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Phone Skills Tab */}
            <TabsContent value="phone-practice" className="mt-0">
              {/* Difficulty Legend */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">Beginner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Intermediate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">Advanced</span>
                </div>
              </div>

              {/* Scenario Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {phonePracticeScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onClick={() => handleSelectScenario(scenario.id)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Reference Materials Tab */}
            <TabsContent value="reference" className="mt-0">
              <Card className="border-dashed">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">Reference Materials</CardTitle>
                  <CardDescription>
                    Guides, scripts, and training resources will be available here soon.
                    This section will include CNA checklists, best practices, and quick reference guides.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveCategory("cna-practice")}
                  >
                    Start Practicing Instead
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
