import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { scenarios } from "@/lib/scenarios";
import { cnaChecklist } from "@/lib/checklist";
import { trainingModules } from "@/lib/modules";
import { countCertifiableModules } from "@/lib/certificateModules";

export const authStats = { scenarios: scenarios.length, checkpoints: cnaChecklist.length };

type CatalogRow = { enabled_module_ids: string[] | null; modules: { id: string; base_module_id: string | null }[] };

/** Largest dealership Learn catalog, counted with the same rule as certification progress. */
export function learningModuleCount(rows: CatalogRow[]) {
  if (rows.length === 0) return countCertifiableModules(trainingModules, [], null);
  return Math.max(...rows.map(r => countCertifiableModules(trainingModules, r.modules ?? [], r.enabled_module_ids)));
}

export function useLearningModuleCount() {
  return useQuery({
    queryKey: ["public-learning-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_learning_catalog");
      if (error) throw error;
      return learningModuleCount(Array.isArray(data) ? (data as unknown as CatalogRow[]) : []);
    },
  });
}
