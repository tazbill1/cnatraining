import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { trainingModules } from "@/lib/modules";
import { CertificateCard } from "@/components/certificates/CertificateCard";

interface CompletionRecord {
  module_id: string;
  completed_at: string;
  quiz_score: number | null;
}

export function AchievementsSection() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
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

  // Only show modules with quizzes that scored 80%+
  const certifiableModules = trainingModules.filter(
    (m) => !m.alwaysAccessible && m.id !== "base-statement-video"
  );
  const earned = completions.filter((c) => {
    const mod = certifiableModules.find((m) => m.id === c.module_id);
    return mod && (c.quiz_score === null || c.quiz_score >= 80);
  });

  const totalCertifiable = certifiableModules.length;
  const earnedCount = earned.length;
  const progressPercent = totalCertifiable > 0 ? Math.round((earnedCount / totalCertifiable) * 100) : 0;

  if (loading) return null;

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Your Achievements</h2>
        </div>
        {earnedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/certificates")}
            className="text-primary"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">
            {earnedCount} of {totalCertifiable} certificates earned
          </span>
          <span className="font-semibold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Badges grid */}
      {earnedCount > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {earned.map((c) => {
            const mod = certifiableModules.find((m) => m.id === c.module_id);
            if (!mod) return null;
            return (
              <CertificateCard
                key={c.module_id}
                moduleName={mod.title}
                userName={profile?.full_name || "User"}
                completionDate={c.completed_at}
                score={c.quiz_score}
                compact
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Complete modules with 80%+ quiz scores to earn certificates
        </p>
      )}
    </div>
  );
}
