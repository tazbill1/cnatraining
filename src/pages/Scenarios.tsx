import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ScenarioCard } from "@/components/training/ScenarioCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import { supabase } from "@/integrations/supabase/client";
import {
  scenarioCategories,
  getBuyerTypeById,
  ScenarioCategory,
  BuyerType,
  Scenario,
} from "@/lib/scenarios";

export default function Scenarios() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch custom scenarios for this dealership
  useEffect(() => {
    const fetchCustom = async () => {
      if (!profile?.dealership_id) return;
      setIsLoading(true);
      const { data } = await supabase
        .from("custom_scenarios")
        .select("*")
        .eq("dealership_id", profile.dealership_id)
        .eq("is_active", true);
      if (data) {
        setCustomScenarios(
          data.map((row) => ({
            id: `custom-${row.id}`,
            name: row.name,
            description: row.description || "",
            personality: row.personality || "",
            difficulty: row.difficulty as Scenario["difficulty"],
            estimatedTime: row.estimated_time || "8-12 min",
            icon: Users,
            systemPrompt: row.system_prompt,
            openingLine: row.opening_line,
            category: row.category as ScenarioCategory,
            buyerType: row.buyer_type as BuyerType,
            customerName: row.customer_name,
            tradeVehicle: row.trade_vehicle || undefined,
            tradeValue: row.trade_value || undefined,
          }))
        );
      }
      setIsLoading(false);
    };
    fetchCustom();
  }, [profile?.dealership_id]);

  // Derive available categories from actual scenario data
  const availableCategories = useMemo(() => {
    const categoryIds = [...new Set(customScenarios.map((s) => s.category))];
    // Use hardcoded metadata as a lookup for display info, preserve that order
    return scenarioCategories.filter((c) =>
      categoryIds.includes(c.id as ScenarioCategory)
    );
  }, [customScenarios]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const effectiveCategory = useMemo(() => {
    if (activeCategory && availableCategories.some((c) => c.id === activeCategory))
      return activeCategory;
    return availableCategories[0]?.id ?? null;
  }, [activeCategory, availableCategories]);

  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/training/${scenarioId}`);
  };

  const colorMap: Record<string, string> = {
    teal: "text-primary",
    indigo: "text-accent-foreground",
    sky: "text-primary",
  };

  const bgMap: Record<string, string> = {
    teal: "data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10",
    indigo:
      "data-[state=active]:border-accent-foreground/40 data-[state=active]:bg-accent/50",
    sky: "data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10",
  };

  const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };

  const renderCategoryContent = (
    category: (typeof scenarioCategories)[number]
  ) => {
    const catId = category.id as ScenarioCategory;
    const catScenarios = customScenarios.filter((s) => s.category === catId);

    const buyerTypeIds: BuyerType[] = [];
    catScenarios.forEach((s) => {
      if (!buyerTypeIds.includes(s.buyerType)) buyerTypeIds.push(s.buyerType);
    });

    return (
      <div>
        <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {category.subtitle}
          </h2>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>

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
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 gap-0.5"
            >
              <Lock className="w-2.5 h-2.5" />
              Optional
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {buyerTypeIds.map((buyerTypeId) => {
            const buyerType = getBuyerTypeById(buyerTypeId);
            const typeScenarios = catScenarios
              .filter((s) => s.buyerType === buyerTypeId)
              .sort(
                (a, b) =>
                  difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
              );

            if (typeScenarios.length === 0) return null;

            const buyerTypeName =
              buyerType?.name ||
              buyerTypeId.charAt(0).toUpperCase() + buyerTypeId.slice(1);
            const buyerTypeDesc =
              buyerType?.description || "Custom buyer type";
            const BuyerIcon = buyerType?.icon || Users;

            return (
              <div key={buyerTypeId}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <BuyerIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {buyerTypeName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {buyerTypeDesc}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                  {typeScenarios.map((scenario) => (
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
                        isCustom={scenario.id.startsWith("custom-")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const showTabs = availableCategories.length > 1;

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
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
              Choose a skill area, then practice with different buyer types from
              easy to hard
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading scenarios…
            </div>
          ) : availableCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No practice scenarios are available for your dealership yet.
            </div>
          ) : showTabs ? (
            <Tabs
              value={effectiveCategory ?? undefined}
              onValueChange={(value) => setActiveCategory(value)}
              className="w-full"
            >
              <TabsList
                className="grid w-full mb-6 h-auto p-1.5 gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${availableCategories.length}, 1fr)`,
                }}
              >
                {availableCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-transparent transition-all ${bgMap[category.color] || ""}`}
                  >
                    <category.icon
                      className={`w-5 h-5 ${colorMap[category.color] || ""}`}
                    />
                    <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                      {category.name}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableCategories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="mt-0"
                >
                  {renderCategoryContent(category)}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            renderCategoryContent(availableCategories[0])
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
