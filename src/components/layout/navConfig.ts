import { LayoutDashboard, MessageSquare, Settings, Users, GraduationCap, Wrench, History, Shield, Award, Trophy, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipContext } from "@/hooks/useDealershipContext";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  featureKey: "leaderboard_enabled" | "certificates_enabled" | null;
  /** Less-used items, grouped under "More" on phones */
  secondary?: boolean;
}

export const baseNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", featureKey: null },
  { icon: GraduationCap, label: "Learn", path: "/learn", featureKey: null },
  { icon: MessageSquare, label: "Practice & Games", path: "/scenarios", featureKey: null },
  { icon: Trophy, label: "Leaderboard", path: "/drills/leaderboard", featureKey: "leaderboard_enabled" },
  { icon: Wrench, label: "Toolbox", path: "/toolbox", featureKey: null },
  { icon: History, label: "Session History", path: "/history", featureKey: null, secondary: true },
  { icon: Award, label: "Certificates", path: "/certificates", featureKey: "certificates_enabled", secondary: true },
  { icon: Settings, label: "Settings", path: "/settings", featureKey: null, secondary: true },
];

export const managerItems = [{ icon: Users, label: "Team", path: "/team" }];
export const adminItems = [{ icon: Shield, label: "Admin", path: "/admin" }];

export function filterNavItems(settings: Record<string, unknown> | null | undefined) {
  return baseNavItems.filter((item) => {
    if (!item.featureKey || !settings) return true;
    return settings[item.featureKey] !== false;
  });
}

/** Single source of truth for "which dealership am I looking at". */
export function useActiveScope() {
  const { profile, isSuperAdmin } = useAuth();
  const { previewDealership, selectedDealership, dealerships } = useDealershipContext();
  const single = dealerships.length === 1 ? dealerships[0] : null;
  const dealership = previewDealership || selectedDealership || single;
  const isAll = isSuperAdmin && !dealership;
  const name = dealership?.name || (isSuperAdmin ? "All Dealerships" : profile?.dealership_name) || "Dealership";
  return { name, isAll, isPreviewing: !!previewDealership, dealershipId: dealership?.id ?? (isSuperAdmin ? null : profile?.dealership_id ?? null) };
}
