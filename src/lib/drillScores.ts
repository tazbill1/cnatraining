import { supabase } from "@/integrations/supabase/client";
import { aiInvokeError } from "@/lib/aiErrors";
import { toast } from "sonner";

export async function startDrillRun(drillKey: string, questionIds: string[]) {
  const { data, error } = await supabase.functions.invoke("record-drill-score", { body: { action: "start", drillKey, questionIds } });
  if (error) throw await aiInvokeError(error, "Unable to start a scored game round.");
  return data.runId as string;
}

export async function saveDrillScore(runId: string, answers: { questionId: string; choice: string | null }[]) {
  try {
    const { error } = await supabase.functions.invoke("record-drill-score", { body: { action: "finish", runId, answers } });
    if (error) throw await aiInvokeError(error, "Unable to save game result.");
  } catch (e) {
    console.warn("saveDrillScore failed", e);
    toast.error(e instanceof Error ? e.message : "Unable to save game result.");
  }
}
