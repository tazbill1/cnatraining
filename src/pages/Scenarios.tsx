import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ScenarioCard } from "@/components/training/ScenarioCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { scenarios, scenarioCategories, getScenariosByCategory, ScenarioCategory } from "@/lib/scenarios";

export default function Scenarios() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ScenarioCategory>("research-driven");

  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/training/${scenarioId}`);
  };

  const colorMap: Record<string, string> = {
    blue: "text-primary",
    emerald: "text-success",
    amber: "text-warning",
    purple: "text-accent-foreground",
    rose: "text-destructive",
  };

  const bgMap: Record<string, string> = {
    blue: "data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10",
    emerald: "data-[state=active]:border-success/40 data-[state=active]:bg-success/10",
    amber: "data-[state=active]:border-warning/40 data-[state=active]:bg-warning/10",
    purple: "data-[state=active]:border-accent-foreground/40 data-[state=active]:bg-accent/50",
    rose: "data-[state=active]:border-destructive/40 data-[state=active]:bg-destructive/10",
  };

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
              Choose a buyer type and difficulty level to sharpen your skills
            </p>
          </div>

          {/* Category Tabs */}
          <Tabs
            value={activeCategory}
            onValueChange={(value) => setActiveCategory(value as ScenarioCategory)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 h-auto p-1.5 gap-1.5">
              {scenarioCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-transparent transition-all ${bgMap[category.color] || ""}`}
                >
                  <category.icon className={`w-5 h-5 ${colorMap[category.color] || ""}`} />
                  <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                    {category.name}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {scenarioCategories.map((category) => {
              const categoryScenarios = getScenariosByCategory(category.id);

              return (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  {/* Category Description */}
                  <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-1">{category.subtitle}</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>

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
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        Optional
                      </Badge>
                    </div>
                  </div>

                  {/* Scenario Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                    {categoryScenarios.map((scenario) => (
                      <div key={scenario.id} className="relative">
                        {scenario.isOptional && (
                          <Badge
                            variant="outline"
                            className="absolute -top-2 right-3 z-10 text-[10px] px-2 py-0 h-5 bg-card border-muted-foreground/30 text-muted-foreground gap-1"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Optional Challenge
                          </Badge>
                        )}
                        <ScenarioCard
                          scenario={scenario}
                          onClick={() => handleSelectScenario(scenario.id)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
