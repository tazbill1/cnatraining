import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { resolveSessionTitle } from "@/lib/sessionTitles";
export function useSessionTitles() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["session-titles", user?.id], enabled: !!user, queryFn: async () => {
    // RLS limits this lookup to scenarios this user is allowed to read.
    const { data, error } = await supabase.from("custom_scenarios").select("id,name");
    if (error) throw error;
    return Object.fromEntries((data || []).map(s => [`custom-${s.id}`, s.name]));
  } });
  return (id: string) => resolveSessionTitle(id, data);
}