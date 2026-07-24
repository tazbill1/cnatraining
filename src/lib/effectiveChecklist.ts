// Returns the checklist items that apply to a scenario at its difficulty tier.
// Used both by the ChecklistPanel UI and by session scoring so that the score
// reflects only the items the rep was actually expected to hit.

import { Scenario } from "@/lib/scenarios";
import { cnaChecklist } from "@/lib/checklist";
import { tradeAppraisalChecklist } from "@/lib/tradeChecklist";
import { cricChecklist } from "@/lib/cricChecklist";
import { phoneModule1Checklist } from "@/lib/phoneModule1Checklist";
import { filterChecklistByDifficulty } from "@/lib/difficulty";

export function getEffectiveChecklist(scenario: Scenario): { id: string }[] {
  const difficulty = scenario.difficulty;
  if (scenario.category === "objection-handling") {
    return filterChecklistByDifficulty(cricChecklist, difficulty);
  }
  if (scenario.category === "inbound-call") {
    return filterChecklistByDifficulty(phoneModule1Checklist, difficulty);
  }
  if (scenario.customerName && scenario.tradeVehicle) {
    return filterChecklistByDifficulty(tradeAppraisalChecklist, difficulty);
  }
  return filterChecklistByDifficulty(cnaChecklist, difficulty);
}

export function calculateEffectiveProgress(
  scenario: Scenario,
  state: Record<string, boolean>,
): number {
  const items = getEffectiveChecklist(scenario);
  if (items.length === 0) return 0;
  const completed = items.filter((i) => state[i.id]).length;
  return Math.round((completed / items.length) * 100);
}
