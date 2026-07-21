import type { DrillItem } from "@/components/drills/StreakDrill";

type SpacedCategory = "Safety" | "Performance" | "Appearance" | "Comfort/Convenience" | "Economy" | "Dependability";

const CATEGORY_WHY: Record<SpacedCategory, string> = {
  Safety: "Anything that protects the driver, passengers, or the vehicle from harm is a Safety hot button.",
  Performance: "How the vehicle drives, accelerates, handles, or responds — that's Performance.",
  Appearance: "How it looks, inside or out — styling, wheels, trim, colors — is Appearance.",
  "Comfort/Convenience": "Anything that makes daily use easier or more comfortable is Comfort/Convenience.",
  Economy: "If it saves the customer money — fuel, maintenance, resale — that's Economy.",
  Dependability: "Long-term reliability, warranty, durability, and build quality is Dependability.",
};

function makeChoices(correct: SpacedCategory) {
  const all: SpacedCategory[] = ["Safety", "Performance", "Appearance", "Comfort/Convenience", "Economy", "Dependability"];
  return all.map((c) => ({
    text: c,
    correct: c === correct,
    why: c === correct ? CATEGORY_WHY[c] : `This one fits ${correct} — ${CATEGORY_WHY[correct]}`,
  }));
}

interface Row {
  id: string;
  scenario: string;
  prompt: string;
  correct: SpacedCategory;
}

const rows: Row[] = [
  {
    id: "abs",
    scenario: "You're presenting a mid-size SUV.",
    prompt: "\"Four-wheel ABS brakes — they keep the wheels from locking up in an emergency stop, so you keep steering control when it matters most.\"",
    correct: "Safety",
  },
  {
    id: "turbo",
    scenario: "The customer mentioned they love the on-ramp merge on their commute.",
    prompt: "\"This 2.0L turbo delivers instant torque, so passing a semi on the highway feels effortless.\"",
    correct: "Performance",
  },
  {
    id: "wheels",
    scenario: "Customer commented on the stance of the vehicle.",
    prompt: "\"The 19-inch machined-face alloys give this trim a sportier, more premium look than the base wheels.\"",
    correct: "Appearance",
  },
  {
    id: "heatedseats",
    scenario: "It's January. Customer commutes 40 minutes each way.",
    prompt: "\"Three-stage heated seats warm up in about five minutes, so your back is loose before you hit the highway.\"",
    correct: "Comfort/Convenience",
  },
  {
    id: "hybrid",
    scenario: "Customer says they fill up twice a week for work.",
    prompt: "\"The hybrid drivetrain averages 48 mpg city — that's roughly half the gas you're paying now every month.\"",
    correct: "Economy",
  },
  {
    id: "warranty",
    scenario: "Customer had a bad experience with their last car.",
    prompt: "\"Our 10-year, 100,000-mile powertrain warranty is one of the longest in the segment — you're covered.\"",
    correct: "Dependability",
  },
  {
    id: "lanekeep",
    scenario: "Customer drives long stretches at night.",
    prompt: "\"Lane-keep assist gently steers you back if you drift — huge on tired late-night drives home.\"",
    correct: "Safety",
  },
  {
    id: "awd",
    scenario: "Customer drives to a lake house on gravel roads.",
    prompt: "\"Symmetrical all-wheel drive keeps power on all four wheels, so gravel, wet leaves, and snow don't slow you down.\"",
    correct: "Performance",
  },
  {
    id: "twotone",
    scenario: "Customer keeps circling the vehicle looking at the roof.",
    prompt: "\"That two-tone black roof is only available on this trim — it gives the whole vehicle a floating-roof look.\"",
    correct: "Appearance",
  },
  {
    id: "poweriftgate",
    scenario: "Customer carries groceries and a stroller.",
    prompt: "\"Hands-free power lift gate — kick your foot under the bumper with the key in your pocket and it opens for you.\"",
    correct: "Comfort/Convenience",
  },
  {
    id: "resale",
    scenario: "Customer trades every 3 years.",
    prompt: "\"This model holds about 68% of its value at three years — one of the best resale numbers in its class.\"",
    correct: "Economy",
  },
  {
    id: "frame",
    scenario: "Customer tows a small boat.",
    prompt: "\"Fully-boxed steel frame with a Class III hitch built in — the same platform truck fleets buy because it lasts.\"",
    correct: "Dependability",
  },
];

export const spacedMatchQuestions: DrillItem[] = rows.map((r) => ({
  id: r.id,
  scenario: r.scenario,
  promptLabel: "Salesperson says:",
  prompt: r.prompt,
  choices: makeChoices(r.correct),
}));
