import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Users, Building2, BookOpen, Flame, PhoneCall, Search, Target, type LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ScenarioCard } from "@/components/training/ScenarioCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Scenario,
  normalizeScenarioCategory,
  normalizeBuyerType,
} from "@/lib/scenarios";
import { channelCategories, ChannelCategory, getCategoryBySlug } from "@/lib/categories";

interface ModuleRow {
  id: string;
  title: string;
  category: ChannelCategory;
  sort_order: number;
}

interface ScenarioWithModule extends Scenario {
  moduleId: string | null;
}

const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
const categoryOrder: ChannelCategory[] = ["phone", "internet", "showroom", "followup"];

export default function Scenarios() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { dealerships, previewDealershipId, selectedDealershipId } = useDealershipContext();
  const dealershipId = previewDealershipId || selectedDealershipId || profile?.dealership_id || (dealerships.length === 1 ? dealerships[0].id : null);

  const [scenarios, setScenarios] = useState<ScenarioWithModule[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ChannelCategory | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!dealershipId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const [scenariosRes, modulesRes] = await Promise.all([
        supabase
          .from("custom_scenarios")
          .select("*")
          .eq("dealership_id", dealershipId)
          .eq("is_active", true),
        supabase
          .from("dealership_modules")
          .select("id, title, category, sort_order")
          .eq("dealership_id", dealershipId)
          .eq("is_active", true),
      ]);

      const mods: ModuleRow[] = (modulesRes.data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        category: (m.category || "phone") as ChannelCategory,
        sort_order: m.sort_order ?? 0,
      }));
      setModules(mods);

      const rows = scenariosRes.data || [];
      setScenarios(
        rows.flatMap((row: any) => {
          const category = normalizeScenarioCategory(row.category);
          if (!category) return [];
          return [{
            id: `custom-${row.id}`,
            name: row.name,
            description: row.description || "",
            personality: row.personality || "",
            difficulty: row.difficulty as Scenario["difficulty"],
            estimatedTime: row.estimated_time || "8-12 min",
            icon: Users,
            systemPrompt: row.system_prompt,
            openingLine: row.opening_line,
            category,
            buyerType: normalizeBuyerType(row.buyer_type),
            customerName: row.customer_name,
            tradeVehicle: row.trade_vehicle || undefined,
            tradeValue: row.trade_value || undefined,
            moduleId: row.module_id || null,
          } as ScenarioWithModule];
        })
      );
      setIsLoading(false);
    };
    fetchData();
  }, [dealershipId]);

  // Group scenarios by channel category (from the module, or fall back to their own category if unmapped)
  const scenariosByChannel = useMemo(() => {
    const moduleById = new Map(modules.map((m) => [m.id, m]));
    const map = new Map<ChannelCategory, ScenarioWithModule[]>();
    const unmapped: ScenarioWithModule[] = [];

    scenarios.forEach((s) => {
      const mod = s.moduleId ? moduleById.get(s.moduleId) : null;
      if (mod) {
        const arr = map.get(mod.category) || [];
        arr.push(s);
        map.set(mod.category, arr);
      } else {
        unmapped.push(s);
      }
    });
    return { map, unmapped };
  }, [scenarios, modules]);

  const availableChannels = useMemo(() => {
    const set = new Set<ChannelCategory>();
    scenariosByChannel.map.forEach((_, k) => set.add(k));
    return categoryOrder.filter((c) => set.has(c));
  }, [scenariosByChannel]);

  const hasUnmapped = scenariosByChannel.unmapped.length > 0;

  const effectiveChannel = useMemo(() => {
    if (activeCategory && availableChannels.includes(activeCategory)) return activeCategory;
    return availableChannels[0] ?? null;
  }, [activeCategory, availableChannels]);

  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/training/${scenarioId}`);
  };

  const drills: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    channel: ChannelCategory;
    matchModule?: RegExp;
  }> = [
    {
      id: "phone-opener",
      title: "Phone Opener Streak Drill",
      description: "First 30 seconds of an inbound call. Build your streak.",
      href: "/drills/phone-opener",
      icon: PhoneCall,
      channel: "phone",
    },
    {
      id: "bypass",
      title: "Bypass Streak Drill",
      description: "10 quick objections. Pick the best bypass.",
      href: "/drills/bypass",
      icon: Flame,
      channel: "showroom",
      matchModule: /bypass/i,
    },
    {
      id: "spot-the-mistake",
      title: "Spot the Mistake",
      description: "Read the scenario. Find what the salesperson did wrong.",
      href: "/drills/spot-the-mistake",
      icon: Search,
      channel: "showroom",
    },
  ];

  const renderFeaturedDrills = () => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Games</h2>
        <Badge variant="outline" className="text-xs">New</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {drills.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => navigate(d.href)}
              className="text-left p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-semibold text-foreground text-sm sm:text-base leading-tight">
                  {d.title}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{d.description}</p>
              <Button size="sm" className="self-start" onClick={(e) => { e.stopPropagation(); navigate(d.href); }}>
                Start
              </Button>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderChannel = (channel: ChannelCategory) => {
    const items = scenariosByChannel.map.get(channel) || [];
    const info = getCategoryBySlug(channel);

    // Group by module, then sort modules by sort_order
    const byModule = new Map<string, ScenarioWithModule[]>();
    items.forEach((s) => {
      const key = s.moduleId!;
      const arr = byModule.get(key) || [];
      arr.push(s);
      byModule.set(key, arr);
    });

    const orderedModules = modules
      .filter((m) => m.category === channel && byModule.has(m.id))
      .sort((a, b) => a.sort_order - b.sort_order);

    return (
      <div>
        {info && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-1">{info.name}</h2>
            <p className="text-sm text-muted-foreground">{info.description}</p>
          </div>
        )}

        <div className="flex items-center gap-6 mb-6 flex-wrap">
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

        <Accordion
          key={orderedModules.map((m) => m.id).join("|")}
          type="multiple"
          defaultValue={orderedModules.map((m) => m.id)}
          className="space-y-3"
        >
          {orderedModules.map((mod) => {
            const modScenarios = (byModule.get(mod.id) || []).sort(
              (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            );
            return (
              <AccordionItem
                key={mod.id}
                value={mod.id}
                className="border border-border rounded-xl bg-card px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm sm:text-base leading-tight">
                        {mod.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {modScenarios.length} roleplay{modScenarios.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {/bypass/i.test(mod.title) && (
                    <div
                      className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => navigate("/drills/bypass")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground text-sm sm:text-base">
                          Bypass Streak Drill
                        </div>
                        <div className="text-xs text-muted-foreground">
                          10 quick objections. Build your streak.
                        </div>
                      </div>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate("/drills/bypass"); }}>
                        Start Drill
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                    {modScenarios.map((scenario) => (
                      <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        onClick={() => handleSelectScenario(scenario.id)}
                        isCustom
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    );
  };

  const renderUnmapped = () => {
    const items = scenariosByChannel.unmapped.sort(
      (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    );
    return (
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-foreground">General Practice</h2>
          <Badge variant="outline" className="text-xs">Not linked to a module</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => handleSelectScenario(scenario.id)}
              isCustom
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Practice Center</h1>
            <p className="text-muted-foreground">
              Roleplays are grouped by the module that teaches the skill — start with easier scenarios and work your way up.
            </p>
          </div>

          {!dealershipId ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">No dealership linked</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Your account isn't linked to a dealership yet — contact your manager to get set up.
              </p>
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ) : availableChannels.length === 0 && !hasUnmapped ? (
            <div className="text-center py-12 text-muted-foreground">
              No practice scenarios are available for your dealership yet.
            </div>
          ) : (
            <>
              {renderFeaturedDrills()}
              {availableChannels.length > 0 && (
                <Tabs
                  value={effectiveChannel ?? undefined}
                  onValueChange={(v) => setActiveCategory(v as ChannelCategory)}
                  className="w-full"
                >
                  <TabsList
                    className="grid w-full mb-6 h-auto p-1.5 gap-1.5"
                    style={{ gridTemplateColumns: `repeat(${availableChannels.length}, 1fr)` }}
                  >
                    {availableChannels.map((c) => {
                      const info = getCategoryBySlug(c)!;
                      const Icon = info.icon;
                      return (
                        <TabsTrigger
                          key={c}
                          value={c}
                          className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-transparent transition-all data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                            {info.shortName}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {availableChannels.map((c) => (
                    <TabsContent key={c} value={c} className="mt-0">
                      {renderChannel(c)}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              {hasUnmapped && renderUnmapped()}
            </>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
