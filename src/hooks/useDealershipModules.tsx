import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrainingModule, trainingModules, ModuleDifficulty } from "@/lib/modules";
import { BookOpen, Car, MessageSquare, FileText, Phone, Handshake, Users, PlayCircle, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Car, MessageSquare, FileText, Phone, Handshake, Users, PlayCircle,
};

export interface DealershipModule {
  id: string;
  dealership_id: string;
  base_module_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  estimated_time: string | null;
  video_url: string | null;
  video_title: string | null;
  sort_order: number;
  is_active: boolean;
  sections: { id: string; title: string; content_type: string; content_html: string | null; video_url: string | null; sort_order: number }[];
  quiz_questions: { id: string; question: string; options: any; explanation: string | null; sort_order: number }[];
}

async function fetchDealershipModules(dealershipId: string): Promise<DealershipModule[]> {
  const { data: modules, error } = await supabase
    .from("dealership_modules")
    .select("*")
    .eq("dealership_id", dealershipId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  if (!modules || modules.length === 0) return [];

  const moduleIds = modules.map((m: any) => m.id);

  const [sectionsRes, quizRes] = await Promise.all([
    supabase
      .from("dealership_module_sections")
      .select("*")
      .in("module_id", moduleIds)
      .order("sort_order"),
    supabase
      .from("dealership_quiz_questions")
      .select("*")
      .in("module_id", moduleIds)
      .order("sort_order"),
  ]);

  const sectionsMap: Record<string, any[]> = {};
  (sectionsRes.data || []).forEach((s: any) => {
    if (!sectionsMap[s.module_id]) sectionsMap[s.module_id] = [];
    sectionsMap[s.module_id].push(s);
  });

  const quizMap: Record<string, any[]> = {};
  (quizRes.data || []).forEach((q: any) => {
    if (!quizMap[q.module_id]) quizMap[q.module_id] = [];
    quizMap[q.module_id].push(q);
  });

  return modules.map((m: any) => ({
    ...m,
    sections: sectionsMap[m.id] || [],
    quiz_questions: quizMap[m.id] || [],
  }));
}

/**
 * Convert a DealershipModule to a TrainingModule-compatible shape for the Learn page.
 */
function toTrainingModule(dm: DealershipModule): TrainingModule {
  return {
    id: `dealership-${dm.id}`,
    title: dm.title,
    description: dm.description || "",
    icon: iconMap[dm.icon || "BookOpen"] || BookOpen,
    estimatedTime: dm.estimated_time || "15-20 min",
    difficulty: "beginner" as ModuleDifficulty,
    sections: dm.sections.map((s) => ({ title: s.title })),
    prerequisiteIds: [],
    alwaysAccessible: true,
  };
}

export function useDealershipModules() {
  const { profile } = useAuth();
  const dealershipId = profile?.dealership_id;

  const { data, isLoading } = useQuery({
    queryKey: ["dealership-modules", dealershipId],
    queryFn: () => fetchDealershipModules(dealershipId!),
    enabled: !!dealershipId,
  });

  return { dealershipModules: data || [], isLoading };
}

/**
 * Merge dealership custom modules with the default module list.
 * - If a dealership module has base_module_id set, it overrides that default module.
 * - If base_module_id is null, it's appended as a new custom module.
 */
export function mergeModules(
  defaults: TrainingModule[],
  custom: DealershipModule[],
  enabledIds: string[] | null
): TrainingModule[] {
  const overrides = new Map<string, DealershipModule>();
  const newModules: DealershipModule[] = [];

  custom.forEach((dm) => {
    if (dm.base_module_id) {
      overrides.set(dm.base_module_id, dm);
    } else {
      newModules.push(dm);
    }
  });

  // Filter defaults by enabled IDs, then apply overrides
  let modules = defaults.filter((m) => !enabledIds || enabledIds.includes(m.id));

  modules = modules.map((m) => {
    const override = overrides.get(m.id);
    if (!override) return m;
    return {
      ...m,
      // Keep the original ID for routing to built-in content
      title: override.title || m.title,
      description: override.description || m.description,
      icon: iconMap[override.icon || ""] || m.icon,
      estimatedTime: override.estimated_time || m.estimatedTime,
      // If the override has custom sections, mark it for custom rendering
      _dealershipModuleId: override.id,
      _hasCustomContent: override.sections.length > 0,
    } as TrainingModule & { _dealershipModuleId?: string; _hasCustomContent?: boolean };
  });

  // Append new (non-override) custom modules
  const appended = newModules.map(toTrainingModule);

  return [...modules, ...appended];
}
