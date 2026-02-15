import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ModuleCard } from "@/components/learn/ModuleCard";
import { trainingModules, checkPrerequisitesMet } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export default function Learn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedModules = async () => {
      if (!user) return;

      try {
        // For now, we'll track completed modules in localStorage
        // In the future, this could be stored in the database
        const stored = localStorage.getItem(`completed_modules_${user.id}`);
        if (stored) {
          setCompletedModules(JSON.parse(stored));
        }
      } catch (error) {
        logger.error("Error fetching completed modules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedModules();
  }, [user]);

  const handleModuleClick = (moduleId: string, isLocked: boolean) => {
    // For development/testing: allow bypassing locked modules with shift+click
    const bypassLock = window.event && (window.event as MouseEvent).shiftKey;
    
    if (isLocked && !bypassLock) {
      toast.error("Complete the prerequisites first to unlock this module.");
      return;
    }
    
    if (isLocked && bypassLock) {
      toast.info("Dev mode: bypassing prerequisite lock");
    }
    
    // Modules with full content
    const implementedModules = ["base-statement", "vehicle-selection-fundamentals", "trade-appraisal-process", "objection-handling-framework", "phone-sales-fundamentals"];
    if (implementedModules.includes(moduleId)) {
      navigate(`/learn/${moduleId}`);
    } else {
      toast.info("Module content coming soon!");
    }
  };

  const completedCount = completedModules.length;
  const totalModules = trainingModules.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Learn</h1>
            </div>
            <p className="text-muted-foreground">
              Complete training modules to build your automotive sales expertise
            </p>
          </div>

          {/* Progress Overview */}
          <div className="card-premium p-6 mb-8">
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

          {/* Modules Grid */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading modules...
              </div>
            ) : (
              trainingModules.map((module, index) => {
                const isCompleted = completedModules.includes(module.id);
                const isLocked = !checkPrerequisitesMet(module.id, completedModules);

                return (
                  <div key={module.id} className="stagger-children">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Module {index + 1}
                      </span>
                      {index > 0 && (
                        <div className="flex-1 h-px bg-border" />
                      )}
                    </div>
                    <ModuleCard
                      module={module}
                      isCompleted={isCompleted}
                      isLocked={isLocked}
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
