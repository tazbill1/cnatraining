import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DrillConfigRow } from "@/lib/drills";

export function useDealershipDrills(dealershipId: string | null) {
  const [config, setConfig] = useState<DrillConfigRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!dealershipId) {
        setConfig([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("dealership_drills")
        .select("drill_key, is_enabled, title_override, description_override, sort_order")
        .eq("dealership_id", dealershipId);
      if (!cancelled) {
        setConfig((data || []) as DrillConfigRow[]);
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [dealershipId]);

  return { config, loading };
}
