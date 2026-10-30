import { useCertificationProgress } from "@/hooks/useCertificationProgress";
import { certificateModuleKey } from "@/lib/certificateModules";
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
  const { earned, certifiableModules, loading, completed: earnedCount, total: totalCertifiable, percent: progressPercent } = useCertificationProgress();

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
            const mod = certifiableModules.find((m) => certificateModuleKey(m) === c.module_id);
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
