// Shared difficulty tier system for roleplay scenarios.
// Ultimate goal: help reps SUCCEED. Beginner = teach the win. Intermediate =
// reinforce process. Advanced = pressure test (still winnable).

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type ChecklistTier = "critical" | "standard" | "advanced";

// Items essential to any successful roleplay — shown at every difficulty.
// Everything else defaults to "standard" (shown at intermediate+).
// Items in ADVANCED_IDS only appear at Advanced difficulty.
const CRITICAL_IDS = new Set<string>([
  // CNA
  "greeting-intro",
  "goals-today",
  "use-utility",
  "current-vehicle",
  "vehicle-recommendations",
  // Phone (Module 1 / general)
  "phone-greeting",
  "phone-get-name",
  "phone-vehicle-interest",
  "phone-one-discovery",
  "phone-callback-number",
  "phone-specific-time",
  // C.R.I.C.
  "acknowledge-feeling",
  "clarify-ask-why",
  "rephrase-mirror",
  "close-offer-solution",
  "close-ask-commitment",
  // Trade
  "trade-intro",
  "set-expectations",
  "value-stated-cleanly",
  "asked-for-decision",
  // Vehicle Selection
  "vs-primary-needs",
  "vs-two-options",
  "vs-matched-to-needs",
  "vs-confirmed-choice",
]);

const ADVANCED_IDS = new Set<string>([
  // CNA — deeper pillars/priorities only expected of advanced reps
  "base-community",
  "base-mission",
  "base-pillars",
  "base-transition",
  "referral-source",
  "fun-adventure",
  "title-clear",
  "miles-per-year",
  "specific-research",
  "priority-appearance",
  "priority-economy",
  // Phone (full 6-step)
  "phone-use-name",
  "phone-source",
  "phone-location",
  "phone-alternative-permission",
  "phone-why-vehicle",
  "phone-text-permission",
  "phone-delivered-news",
  "phone-text-confirmation",
  "phone-confirmed-receipt",
  // C.R.I.C. — deepest step
  "isolate-confirmed-single",
  // Trade — full detail evaluation
  "damage-documented",
  "mechanical-check",
  "anchored-benefits",
  "invited-questions",
  "reality-check",
  // Vehicle Selection — polish
  "vs-visual-presentation",
  "vs-addressed-concerns",
]);

export function getChecklistTier(id: string): ChecklistTier {
  if (CRITICAL_IDS.has(id)) return "critical";
  if (ADVANCED_IDS.has(id)) return "advanced";
  return "standard";
}

export function filterChecklistByDifficulty<T extends { id: string }>(
  items: T[],
  difficulty: Difficulty | undefined,
): T[] {
  const d = difficulty ?? "intermediate";
  if (d === "advanced") return items;
  if (d === "beginner") {
    return items.filter((i) => getChecklistTier(i.id) === "critical");
  }
  // intermediate: critical + standard
  return items.filter((i) => getChecklistTier(i.id) !== "advanced");
}

// System-prompt directives injected into every roleplay so customer AI
// behavior scales with difficulty. Consistent across all categories.
export function getDifficultyDirectives(difficulty: Difficulty | undefined): string {
  const d = difficulty ?? "intermediate";
  if (d === "beginner") {
    return `

=== DIFFICULTY: BEGINNER ===
Your job is to help the salesperson SUCCEED and build confidence.
- Be friendly, cooperative, and open. Answer questions willingly.
- If you have a concern or objection, raise it ONCE. As soon as the salesperson gives any reasonable response, accept it warmly and move forward.
- Volunteer small helpful details (needs, use case) when it keeps the conversation flowing.
- Never stack objections. Never dig in. Reward good process with clear yeses.`;
  }
  if (d === "advanced") {
    return `

=== DIFFICULTY: ADVANCED ===
You are skeptical, guarded, and time-pressed. Test the salesperson's composure.
- Lead with your objection or concern up front — surface it in your very first or second reply, before pleasantries finish.
- Do NOT concede easily. Require multiple solid, specific responses before you soften. Repeat the concern in different words. Push back on vague answers.
- Reveal needs only when the salesperson earns them with good questions.
- You CAN eventually be won over — but only after real skill and patience. Never become unwinnable. When they truly nail it, acknowledge it and move forward.`;
  }
  return `

=== DIFFICULTY: INTERMEDIATE ===
Be realistic — cooperate when the salesperson does good work, push back when they don't.
- Raise your main objection 2-3 times, or introduce one smaller secondary concern along the way. Concede only after you hear a solid, specific response.
- Answer discovery questions accurately, but don't volunteer extra info unless asked.
- Move forward when the salesperson demonstrates they've earned it.`;
}
