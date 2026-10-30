import { scenarios } from "@/lib/scenarios";
export function resolveSessionTitle(id: string, names: Record<string, string> = {}) {
  return names[id] || scenarios.find(s => s.id === id)?.name || (id.startsWith("custom-") ? "Custom roleplay" : id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
}