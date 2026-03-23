import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipContext } from "@/hooks/useDealershipContext";

export interface DealershipSettings {
  id: string;
  dealership_id: string;
  logo_url: string | null;
  primary_color: string;
  dealership_tagline: string;
  enabled_module_ids: string[];
  enabled_scenario_categories: string[];
  enabled_difficulty_levels: string[];
  required_module_ids: string[];
  completion_deadline_days: number | null;
  voice_training_enabled: boolean;
  certificates_enabled: boolean;
  leaderboard_enabled: boolean;
  custom_base_statement: string | null;
  custom_welcome_message: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Omit<DealershipSettings, "id" | "dealership_id" | "created_at" | "updated_at"> = {
  logo_url: null,
  primary_color: "#2563eb",
  dealership_tagline: "",
  enabled_module_ids: [
    "buyer-types",
    "base-statement-video",
    "base-statement",
    "vehicle-selection-fundamentals",
    "trade-appraisal-process",
    "objection-handling-framework",
    "phone-sales-fundamentals",
    "quick-reference-library",
  ],
  enabled_scenario_categories: ["cna", "trade-appraisal", "inbound-call"],
  enabled_difficulty_levels: ["beginner", "intermediate", "advanced"],
  required_module_ids: [],
  completion_deadline_days: null,
  voice_training_enabled: true,
  certificates_enabled: true,
  leaderboard_enabled: false,
  custom_base_statement: null,
  custom_welcome_message: null,
};

async function fetchSettings(dealershipId: string): Promise<DealershipSettings> {
  const { data, error } = await supabase
    .from("dealership_settings" as any)
    .select("*")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      ...DEFAULT_SETTINGS,
      id: "",
      dealership_id: dealershipId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as DealershipSettings;
  }

  return data as unknown as DealershipSettings;
}

export function useDealershipSettings() {
  const { profile } = useAuth();
  const { previewDealershipId, selectedDealershipId } = useDealershipContext();
  // Preview mode overrides selection, which overrides the user's own dealership
  const dealershipId = previewDealershipId || selectedDealershipId || profile?.dealership_id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dealership-settings", dealershipId],
    queryFn: () => fetchSettings(dealershipId!),
    enabled: !!dealershipId,
  });

  return {
    settings: data ?? null,
    isLoading,
    refetch,
  };
}

export function useDealershipSettingsForId(dealershipId: string | null) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dealership-settings", dealershipId],
    queryFn: () => fetchSettings(dealershipId!),
    enabled: !!dealershipId,
  });

  return {
    settings: data ?? null,
    isLoading,
    refetch,
  };
}
