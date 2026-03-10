import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";
import { supabase } from "@/integrations/supabase/client";
import { trainingModules } from "@/lib/modules";

interface CompletionRecord {
  module_id: string;
  completed_at: string;
  quiz_score: number | null;
}

export default function Certificates() {
  const { user, profile } = useAuth();
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  const certifiableModules = trainingModules.filter(
    (m) => !m.alwaysAccessible && m.id !== "base-statement-video"
  );

  const earned = completions.filter((c) => {
    const mod = certifiableModules.find((m) => m.id === c.module_id);
    return mod && (c.quiz_score === null || c.quiz_score >= 80);
  });

  const userName = profile?.full_name || "User";

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Certificates</h1>
            </div>
            <p className="text-muted-foreground">
              {earned.length > 0
                ? `You've earned ${earned.length} certificate${earned.length !== 1 ? "s" : ""}. Click download to save.`
                : "Complete modules with 80%+ quiz scores to earn certificates."}
            </p>
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
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
