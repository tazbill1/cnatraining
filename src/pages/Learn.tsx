import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Search, X, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ModuleCard } from "@/components/learn/ModuleCard";
import { trainingModules, checkPrerequisitesMet, ModuleDifficulty } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";
import { useDealershipModules, mergeModules } from "@/hooks/useDealershipModules";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CompletionFilter = "all" | "completed" | "in-progress" | "not-started";
type SortOption = "recommended" | "difficulty" | "title";

const difficultyOrder: Record<ModuleDifficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export default function Learn() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { settings, isLoading: settingsLoading } = useDealershipSettings();
  const { dealershipModules, isLoading: dmLoading } = useDealershipModules();
  const { isPreviewing, previewDealership } = useDealershipContext();
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Read filters from URL
  const search = searchParams.get("q") || "";
  const difficultyFilter = (searchParams.get("difficulty") || "all") as ModuleDifficulty | "all";
  const completionFilter = (searchParams.get("status") || "all") as CompletionFilter;
  const sortOption = (searchParams.get("sort") || "recommended") as SortOption;

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "" || value === "all" || (key === "sort" && value === "recommended")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    const fetchCompletedModules = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("module_completions")
          .select("module_id")
          .eq("user_id", user.id);

        if (error) throw error;

        const dbModules = data?.map((r) => r.module_id) || [];

        const stored = localStorage.getItem(`completed_modules_${user.id}`);
        if (stored) {
          const localModules: string[] = JSON.parse(stored);
          const missing = localModules.filter((m) => !dbModules.includes(m));
          if (missing.length > 0) {
            const rows = missing.map((module_id) => ({
              user_id: user.id,
              module_id,
              dealership_id: profile?.dealership_id || null,
            }));
            await supabase.from("module_completions").upsert(rows, {
              onConflict: "user_id,module_id",
            });
            dbModules.push(...missing);
          }
          localStorage.removeItem(`completed_modules_${user.id}`);
        }

        setCompletedModules(dbModules);
      } catch (error) {
        logger.error("Error fetching completed modules:", error);
        try {
          const stored = localStorage.getItem(`completed_modules_${user.id}`);
          if (stored) setCompletedModules(JSON.parse(stored));
        } catch {}
        toast.error("Could not load progress from server. Showing cached data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedModules();
  }, [user]);

  const getModuleStatus = (moduleId: string): CompletionFilter => {
    if (completedModules.includes(moduleId)) return "completed";
    if (localStorage.getItem(`module_${moduleId}_current_stage`)) return "in-progress";
    return "not-started";
  };

  // Modules filtered by dealership settings
  const enabledModules = useMemo(() => {
    // Pass the raw array (or undefined→null) so mergeModules can distinguish "no settings" from "empty list"
    const enabledIds = settings ? settings.enabled_module_ids : null;
    return mergeModules(trainingModules, dealershipModules, enabledIds);
  }, [settings, dealershipModules]);

  const filteredModules = useMemo(() => {
    let modules = enabledModules.map((m, i) => ({ ...m, originalIndex: i }));

    // Search
    if (search) {
      const q = search.toLowerCase();
      modules = modules.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      modules = modules.filter((m) => m.difficulty === difficultyFilter);
    }

    // Completion filter
    if (completionFilter !== "all") {
      modules = modules.filter((m) => getModuleStatus(m.id) === completionFilter);
    }

    // Sort
    if (sortOption === "difficulty") {
      modules.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    } else if (sortOption === "title") {
      modules.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Recommended: curriculum order
      modules.sort((a, b) => a.originalIndex - b.originalIndex);
    }

    return modules;
  }, [search, difficultyFilter, completionFilter, sortOption, completedModules, enabledModules]);

  // Counts for filter badges
  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enabledModules.length };
    enabledModules.forEach((m) => {
      counts[m.difficulty] = (counts[m.difficulty] || 0) + 1;
    });
    return counts;
  }, [enabledModules]);

  const completionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enabledModules.length, completed: 0, "in-progress": 0, "not-started": 0 };
    enabledModules.forEach((m) => {
      counts[getModuleStatus(m.id)]++;
    });
    return counts;
  }, [completedModules, enabledModules]);

  const handleModuleClick = (moduleId: string, isLocked: boolean) => {
    const bypassLock = import.meta.env.DEV && window.event && (window.event as MouseEvent).shiftKey;

    if (isLocked && !bypassLock) {
      toast.error("Complete the prerequisites first to unlock this module.");
      return;
    }

    if (isLocked && bypassLock) {
      toast.info("Dev mode: bypassing prerequisite lock");
    }

    // Custom dealership modules route to their own page
    if (moduleId.startsWith("dealership-")) {
      navigate(`/learn/dealership/${moduleId.replace("dealership-", "")}`);
      return;
    }

    navigate(`/learn/${moduleId}`);
  };

  const totalModules = enabledModules.length;
  const completedCount = completedModules.filter(id => enabledModules.some(m => m.id === id)).length;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const hasActiveFilters = search || difficultyFilter !== "all" || completionFilter !== "all" || sortOption !== "recommended";

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          {/* Preview Banner */}
          {isPreviewing && previewDealership && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-amber-800 dark:text-amber-200">
                <strong>Preview Mode:</strong> Viewing as <strong>{previewDealership.name}</strong> salesperson. Use the sidebar switcher to exit.
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Learn</h1>
            </div>
            <p className="text-muted-foreground">
              Complete training modules to build your automotive sales expertise
            </p>
          </div>

          {/* Progress Overview */}
          <div className="card-premium p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Your Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalModules} modules completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 space-y-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => updateParam("q", e.target.value)}
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => updateParam("q", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap gap-2">
              <Select value={difficultyFilter} onValueChange={(v) => updateParam("difficulty", v)}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels ({difficultyCounts.all})</SelectItem>
                  <SelectItem value="beginner">Beginner ({difficultyCounts.beginner || 0})</SelectItem>
                  <SelectItem value="intermediate">Intermediate ({difficultyCounts.intermediate || 0})</SelectItem>
                  <SelectItem value="advanced">Advanced ({difficultyCounts.advanced || 0})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={completionFilter} onValueChange={(v) => updateParam("status", v)}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({completionCounts.all})</SelectItem>
                  <SelectItem value="completed">Completed ({completionCounts.completed})</SelectItem>
                  <SelectItem value="in-progress">In Progress ({completionCounts["in-progress"]})</SelectItem>
                  <SelectItem value="not-started">Not Started ({completionCounts["not-started"]})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOption} onValueChange={(v) => updateParam("sort", v)}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="title">Title A–Z</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <button
                  onClick={() => setSearchParams({}, { replace: true })}
                  className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-premium p-4 sm:p-6 flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No modules found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              filteredModules.map((module) => {
                const isCompleted = completedModules.includes(module.id);
                const isLocked = module.alwaysAccessible ? false : !checkPrerequisitesMet(module.id, completedModules);
                const hasProgress = !isCompleted && !!localStorage.getItem(`module_${module.id}_current_stage`);

                return (
                  <div key={module.id} className="stagger-children">
                    <ModuleCard
                      module={module}
                      isCompleted={isCompleted}
                      isLocked={isLocked}
                      hasProgress={hasProgress}
                      onClick={() => handleModuleClick(module.id, isLocked)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
