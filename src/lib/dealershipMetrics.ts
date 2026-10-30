import { supabase } from "@/integrations/supabase/client";
/** Active account = current dealership profile with an assigned app role, not recent activity. */
export async function fetchDealershipMetrics(dealershipId: string | null) {
  let profileQuery = supabase.from("profiles").select("*").not("dealership_id", "is", null);
  let sessionQuery = supabase.from("training_sessions").select("*").eq("status", "completed").not("dealership_id", "is", null);
  if (dealershipId) { profileQuery = profileQuery.eq("dealership_id", dealershipId); sessionQuery = sessionQuery.eq("dealership_id", dealershipId); }
  const [profiles, sessions, roles] = await Promise.all([profileQuery, sessionQuery, supabase.from("user_roles").select("user_id,role")]);
  if (profiles.error) throw profiles.error;
  if (sessions.error) throw sessions.error;
  if (roles.error) throw roles.error;
  const activeIds = new Set((roles.data || []).map(r => r.user_id));
  const members = (profiles.data || []).filter(p => activeIds.has(p.user_id));
  const membership = new Map(members.map(p => [p.user_id, p.dealership_id]));
  const completedSessions = (sessions.data || []).filter(s => membership.get(s.user_id) === s.dealership_id);
  return { profiles: members, sessions: completedSessions, roles: roles.data || [], userCount: members.length, sessionCount: completedSessions.length };
}