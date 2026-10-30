import { getCategoryById } from "@/lib/scenarios";
import { getCategoryBySlug } from "@/lib/categories";
export function scenarioLabel(category?: string | null): string {
  if (!category) return "Roleplay";
  return getCategoryBySlug(category)?.name ?? getCategoryById(category)?.name ?? "Roleplay";
}