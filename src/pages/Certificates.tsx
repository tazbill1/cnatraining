import { useEffect, useState, useMemo } from "react";
import { Award, Trophy } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";
import { useDealershipModules, mergeModules } from "@/hooks/useDealershipModules";
import { supabase } from "@/integrations/supabase/client";
import { trainingModules } from "@/lib/modules";
import { channelCategories } from "@/lib/categories";

interface CompletionRecord {
  module_id: string;
  completed_at: string;
  quiz_score: number | null;
}

export default function Certificates() {
  const { user, profile } = useAuth();
  const { settings } = useDealershipSettings();
  const { dealershipModules } = useDealershipModules();
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const certificatesDisabled = settings?.certificates_enabled === false;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("module_completions")
      .select("module_id, completed_at, quiz_score")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setCompletions(data || []);
        setLoading(false);
      });
  }, [user]);

  // Merge default and dealership modules the same way Learn does
  const allModules = useMemo(() => {
    const enabledIds = settings ? settings.enabled_module_ids : null;
    return mergeModules(trainingModules, dealershipModules, enabledIds);
  }, [settings, dealershipModules]);

  const certifiableModules = allModules.filter(
    (m) => !m.alwaysAccessible && m.id !== "base-statement-video"
  );

  const earned = completions.filter((c) => {
    const mod = certifiableModules.find((m) => m.id === c.module_id || `dealership-${m._dealershipModuleId}` === `dealership-${c.module_id}`);
    return mod && (c.quiz_score === null || c.quiz_score >= 80);
  });

  // Category-level rollups: category is "mastered" when every module in it is complete
  const categoryRollups = useMemo(() => {
    return channelCategories
      .map((cat) => {
        const catModules = certifiableModules.filter((m) => (m.category || "phone") === cat.id);
        if (catModules.length === 0) return null;
        const completedInCat = catModules.filter((m) =>
          completions.some((c) => c.module_id === m.id && (c.quiz_score === null || c.quiz_score >= 80))
        );
        const isComplete = completedInCat.length === catModules.length;
        // Use the latest completion date in the category as the earn date
        const latestDate = completedInCat
          .map((m) => completions.find((c) => c.module_id === m.id)?.completed_at)
          .filter(Boolean)
          .sort()
          .reverse()[0];
        return {
          category: cat,
          total: catModules.length,
          completed: completedInCat.length,
          isComplete,
          completionDate: latestDate,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [certifiableModules, completions]);

  const userName = profile?.full_name || "User";
  const mastered = categoryRollups.filter((r) => r.isComplete);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          {certificatesDisabled ? (
            <div className="text-center py-16">
              <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">Certificates are not enabled</p>
              <p className="text-sm text-muted-foreground">
                Certificates are not enabled for your dealership. Contact your manager for more information.
              </p>
            </div>
          ) : (
          <>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Certificates</h1>
            </div>
            <p className="text-muted-foreground">
              {earned.length > 0
                ? `You've earned ${earned.length} module certificate${earned.length !== 1 ? "s" : ""}.`
                : "Complete modules with 80%+ quiz scores to earn certificates."}
            </p>
          </div>

          {/* Category mastery */}
          {categoryRollups.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Category Mastery</h2>
              </div>

              {mastered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {mastered.map((r) => (
                    <CertificateCard
                      key={r.category.id}
                      moduleName={`${r.category.name} Mastery`}
                      userName={userName}
                      completionDate={r.completionDate || new Date().toISOString()}
                      score={null}
                      variant="mastery"
                    />
                  ))}
                </div>
              )}

              {/* Progress bars for incomplete categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryRollups
                  .filter((r) => !r.isComplete)
                  .map((r) => {
                    const pct = Math.round((r.completed / r.total) * 100);
                    return (
                      <div key={r.category.id} className="card-premium p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{r.category.name} Mastery</span>
                          <span className="text-sm text-muted-foreground">
                            {r.completed} / {r.total}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Individual module certs */}
          <div className="mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Module Certificates</h2>
          </div>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading certificates...</div>
          ) : earned.length === 0 ? (
            <div className="text-center py-16">
              <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No certificates yet</p>
              <p className="text-sm text-muted-foreground">
                Complete training modules and score 80% or higher on quizzes to earn your certificates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earned.map((c) => {
                const mod = certifiableModules.find((m) => m.id === c.module_id);
                if (!mod) return null;
                return (
                  <CertificateCard
                    key={c.module_id}
                    moduleName={mod.title}
                    userName={userName}
                    completionDate={c.completed_at}
                    score={c.quiz_score}
                  />
                );
              })}
            </div>
          )}
          </>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
