import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipModules, mergeModules } from "@/hooks/useDealershipModules";
import { useDealershipSettings } from "@/hooks/useDealershipSettings";
import { certificateModuleKey, isCertifiableModule } from "@/lib/certificateModules";
import { trainingModules } from "@/lib/modules";
import { calculateTrainingProgress } from "@/lib/trainingProgress";
import { useActiveScope } from "@/components/layout/navConfig";

export function useCertificationProgress(userIds?: string[], source: "certificates" | "completions" = "certificates") {
  const { user } = useAuth();
  const { dealershipId } = useActiveScope();
  const { settings, isLoading: settingsLoading } = useDealershipSettings();
  const { dealershipModules, isLoading: modulesLoading } = useDealershipModules();
  const ids = [...new Set(userIds ?? (user ? [user.id] : []))].sort();
  const certifiableModules = useMemo(() => mergeModules(trainingModules, dealershipModules, settings?.enabled_module_ids ?? null).filter(isCertifiableModule), [settings, dealershipModules]);
  const query = useQuery({
    queryKey: ["certification-progress", source, dealershipId, ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      if (source === "completions") {
        const { data, error } = await supabase.from("module_completions").select("user_id,module_id,quiz_score,completed_at").in("user_id", ids);
        if (error) throw error;
        return data || [];
      }
      const { data, error } = await supabase.from("course_certificates").select("user_id,module_id,quiz_score,issued_at").in("user_id", ids);
      if (error) throw error;
      return (data || []).map(r => ({ ...r, completed_at: r.issued_at }));
    },
  });
  const records = query.data ?? [];
  const progress = calculateTrainingProgress(certifiableModules.map(m => ({ ...m, id: certificateModuleKey(m) })), records, ids);
  const keys = new Set(progress.modules.map(m => m.id));
  const earned = records.filter(r => keys.has(r.module_id) && r.quiz_score !== null && r.quiz_score >= 80);
  return { ...progress, certifiableModules, earned, settings, loading: settingsLoading || modulesLoading || query.isLoading, error: query.error };
}