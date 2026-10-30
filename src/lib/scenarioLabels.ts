import { scenarioCategories } from "@/lib/scenarios";
import { getCategoryBySlug } from "@/lib/categories";
export function scenarioLabel(category?: string | null): string {
  if (!category) return "Roleplay";
  return getCategoryBySlug(category)?.name ?? scenarioCategories.find((item) => item.id === category)?.name ?? "Roleplay";
}