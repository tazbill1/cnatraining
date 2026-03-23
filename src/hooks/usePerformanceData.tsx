import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calculateMetricsFromLeads } from "@/lib/performanceData";
import type { Lead, Goals, WalkInData, TeamMemberWithMetrics } from "@/lib/performanceTypes";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

const defaultGoals: Goals = {
  sales: 15,
  showRate: 75,
  closeRate: 35,
  internetLeads: 50,
  phoneLeads: 30,
  walkIns: 25,
};

export function usePerformanceData() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const dealershipId = profile?.dealership_id;
  const currentMonth = getCurrentMonth();
  const monthStart = getMonthStart();
  const queryKeyBase = ["performance", userId, currentMonth];

  // 1. Fetch leads for current month
  const leadsQuery = useQuery({
    queryKey: [...queryKeyBase, "leads"],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("id, customer_name, source, status")
        .eq("user_id", userId!)
        .gte("created_at", monthStart)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        name: r.customer_name,
        source: r.source as Lead["source"],
        status: r.status as Lead["status"],
      }));
    },
    enabled: !!userId,
  });

  // 2. Fetch or create goals for current month
  const goalsQuery = useQuery({
    queryKey: [...queryKeyBase, "goals"],
    queryFn: async (): Promise<Goals> => {
      const { data, error } = await supabase
        .from("sales_goals")
        .select("*")
        .eq("user_id", userId!)
        .eq("month", currentMonth)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          sales: data.sales_goal,
          showRate: data.show_rate_goal,
          closeRate: data.close_rate_goal,
          internetLeads: data.internet_leads_goal,
          phoneLeads: data.phone_leads_goal,
          walkIns: data.walk_ins_goal,
        };
      }
      // Insert defaults
      const { data: inserted, error: insertErr } = await supabase
        .from("sales_goals")
        .insert({
          user_id: userId!,
          dealership_id: dealershipId ?? null,
          month: currentMonth,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      return {
        sales: inserted.sales_goal,
        showRate: inserted.show_rate_goal,
        closeRate: inserted.close_rate_goal,
        internetLeads: inserted.internet_leads_goal,
        phoneLeads: inserted.phone_leads_goal,
        walkIns: inserted.walk_ins_goal,
      };
    },
    enabled: !!userId,
  });

  // 3. Walk-in counts for current month
  const walkInQuery = useQuery({
    queryKey: [...queryKeyBase, "walkIns"],
    queryFn: async (): Promise<WalkInData> => {
      const { data, error } = await supabase
        .from("walk_in_logs")
        .select("type")
        .eq("user_id", userId!)
        .gte("logged_at", monthStart);
      if (error) throw error;
      const rows = data ?? [];
      return {
        visits: rows.filter((r) => r.type === "visit").length,
        sales: rows.filter((r) => r.type === "sale").length,
      };
    },
    enabled: !!userId,
  });

  // 4. Leaderboard – all dealership leads this month
  const leaderboardQuery = useQuery({
    queryKey: [...queryKeyBase, "leaderboard", dealershipId],
    queryFn: async (): Promise<TeamMemberWithMetrics[]> => {
      if (!dealershipId) return [];

      // Fetch all leads for the dealership this month
      const { data: allLeads, error: leadsErr } = await supabase
        .from("sales_leads")
        .select("user_id, customer_name, source, status")
        .eq("dealership_id", dealershipId)
        .gte("created_at", monthStart);
      if (leadsErr) throw leadsErr;

      // Fetch all walk-ins for the dealership this month
      const { data: allWalkIns, error: wiErr } = await supabase
        .from("walk_in_logs")
        .select("user_id, type")
        .eq("dealership_id", dealershipId)
        .gte("logged_at", monthStart);
      if (wiErr) throw wiErr;

      // Fetch profiles for names
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("dealership_id", dealershipId);
      if (profErr) throw profErr;

      const nameMap = new Map<string, string>();
      for (const p of profiles ?? []) {
        nameMap.set(p.user_id, p.full_name || "Unknown");
      }

      // Group leads by user
      const userLeadsMap = new Map<string, Lead[]>();
      for (const row of allLeads ?? []) {
        const uid = row.user_id as string;
        if (!userLeadsMap.has(uid)) userLeadsMap.set(uid, []);
        userLeadsMap.get(uid)!.push({
          id: "",
          name: row.customer_name,
          source: row.source as Lead["source"],
          status: row.status as Lead["status"],
        });
      }

      // Group walk-ins by user
      const userWalkInMap = new Map<string, WalkInData>();
      for (const row of allWalkIns ?? []) {
        const uid = row.user_id as string;
        if (!userWalkInMap.has(uid)) userWalkInMap.set(uid, { visits: 0, sales: 0 });
        const wi = userWalkInMap.get(uid)!;
        if (row.type === "visit") wi.visits++;
        else if (row.type === "sale") wi.sales++;
      }

      // Collect all user IDs
      const allUserIds = new Set<string>();
      for (const uid of userLeadsMap.keys()) allUserIds.add(uid);
      for (const uid of userWalkInMap.keys()) allUserIds.add(uid);
      // Also include profiles with no activity
      for (const p of profiles ?? []) allUserIds.add(p.user_id);

      const results: TeamMemberWithMetrics[] = [];
      for (const uid of allUserIds) {
        const leads = userLeadsMap.get(uid) ?? [];
        const walkIn = userWalkInMap.get(uid) ?? { visits: 0, sales: 0 };
        const metrics = calculateMetricsFromLeads(leads, walkIn);
        const displayName = uid === userId ? "You" : (nameMap.get(uid) || "Unknown");
        results.push({ name: displayName, metrics });
      }

      return results;
    },
    enabled: !!userId && !!dealershipId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeyBase });

  // Mutations
  const addLeadMutation = useMutation({
    mutationFn: async (lead: Omit<Lead, "id">) => {
      const { data, error } = await supabase
        .from("sales_leads")
        .insert({
          user_id: userId!,
          dealership_id: dealershipId ?? null,
          customer_name: lead.name,
          source: lead.source,
          status: lead.status,
        })
        .select("id, customer_name, source, status")
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.customer_name,
        source: data.source as Lead["source"],
        status: data.status as Lead["status"],
      } satisfies Lead;
    },
    onSuccess: invalidate,
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lead["status"] }) => {
      const { error } = await supabase
        .from("sales_leads")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sales_leads")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const logWalkInMutation = useMutation({
    mutationFn: async (type: "visit" | "sale") => {
      const { error } = await supabase
        .from("walk_in_logs")
        .insert({
          user_id: userId!,
          dealership_id: dealershipId ?? null,
          type,
        });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const saveGoalsMutation = useMutation({
    mutationFn: async (goals: Goals) => {
      const { error } = await supabase
        .from("sales_goals")
        .upsert(
          {
            user_id: userId!,
            dealership_id: dealershipId ?? null,
            month: currentMonth,
            sales_goal: goals.sales,
            show_rate_goal: goals.showRate,
            close_rate_goal: goals.closeRate,
            internet_leads_goal: goals.internetLeads,
            phone_leads_goal: goals.phoneLeads,
            walk_ins_goal: goals.walkIns,
          },
          { onConflict: "user_id,month" }
        );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    leads: leadsQuery.data ?? [],
    goals: goalsQuery.data ?? defaultGoals,
    walkIn: walkInQuery.data ?? { visits: 0, sales: 0 },
    leaderboard: leaderboardQuery.data ?? [],
    isLoading: leadsQuery.isLoading || goalsQuery.isLoading || walkInQuery.isLoading,

    addLead: (lead: Omit<Lead, "id">) => addLeadMutation.mutateAsync(lead),
    updateLeadStatus: (id: string, status: Lead["status"]) =>
      updateLeadStatusMutation.mutateAsync({ id, status }),
    deleteLead: (id: string) => deleteLeadMutation.mutateAsync(id),
    logWalkIn: (type: "visit" | "sale") => logWalkInMutation.mutateAsync(type),
    saveGoals: (goals: Goals) => saveGoalsMutation.mutateAsync(goals),
  };
}
