import { supabase } from "@/integrations/supabase/client";
import { aiInvokeError } from "@/lib/aiErrors";

export async function completeModule(moduleId: string, answers: Record<string, string | number>) {
  const { data, error } = await supabase.functions.invoke("complete-module", { body: { moduleId, answers } });
  if (error) throw await aiInvokeError(error, "Unable to save course completion.");
  return data;
}