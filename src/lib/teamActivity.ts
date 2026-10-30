const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export function isActiveInLastWeek(lastActive: string | null, now = Date.now()): boolean {
  if (!lastActive) return false;
  const elapsed = now - Date.parse(lastActive);
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= WEEK_MS;
}
export function getActivityStatus(lastActive: string | null, now = Date.now()) {
  if (!lastActive || !Number.isFinite(Date.parse(lastActive))) return { label: "Never active", variant: "destructive" as const };
  if (isActiveInLastWeek(lastActive, now)) return { label: "Active", variant: "default" as const };
  return { label: "Needs attention", variant: "outline" as const };
}