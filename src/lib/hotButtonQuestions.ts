import type { DrillItem } from "@/components/drills/StreakDrill";

type Category = "Safety" | "Performance" | "Appearance" | "Comfort/Convenience" | "Economy" | "Dependability";

const WHY: Record<Category, string> = {
  Safety: "They're telling you they worry about protecting people or the vehicle — that's a Safety hot button.",
  Performance: "How the vehicle drives, accelerates, or handles — that's Performance.",
  Appearance: "How it looks, style, color, wheels — that's Appearance.",
  "Comfort/Convenience": "Anything that makes daily life easier or more comfortable — Comfort/Convenience.",
  Economy: "Saving money on fuel, maintenance, or resale — that's Economy.",
  Dependability: "Long-term reliability, warranty, keeping it for years — that's Dependability.",
};

const ALL: Category[] = ["Safety", "Performance", "Appearance", "Comfort/Convenience", "Economy", "Dependability"];

function choices(correct: Category) {
  return ALL.map((c) => ({
    text: c,
    correct: c === correct,
    why: c === correct ? WHY[c] : `Listen again — this one is ${correct}. ${WHY[correct]}`,
  }));
}

interface Row { id: string; scenario?: string; prompt: string; correct: Category }

const rows: Row[] = [
  { id: "car-seats", scenario: "Young mom looking at SUVs.", prompt: "\"I've got two little ones — I need to know they're protected if someone hits us.\"", correct: "Safety" },
  { id: "commute-mpg", scenario: "Long-commute buyer.", prompt: "\"Gas is killing me. I drive 80 miles round-trip every day.\"", correct: "Economy" },
  { id: "keep-forever", scenario: "Trading in a 12-year-old truck.", prompt: "\"I keep my vehicles a long time. My last one lasted 250,000 miles.\"", correct: "Dependability" },
  { id: "on-ramp", scenario: "Customer test-drove and loved the throttle.", prompt: "\"Wow — that thing moves. My old car couldn't merge on the highway.\"", correct: "Performance" },
  { id: "third-row", scenario: "Family with 4 kids and a dog.", prompt: "\"We need real third-row space and cupholders everyone can reach.\"", correct: "Comfort/Convenience" },
  { id: "color-wheels", scenario: "Customer keeps circling the same trim.", prompt: "\"I love this color and those black wheels — that's exactly what I want it to look like.\"", correct: "Appearance" },
  { id: "warranty", scenario: "Nervous first-time buyer.", prompt: "\"What if something breaks? How long am I covered?\"", correct: "Dependability" },
  { id: "blind-spot", scenario: "Customer merged and glanced twice.", prompt: "\"I hate changing lanes on the freeway — I can never tell if someone's next to me.\"", correct: "Safety" },
  { id: "heated-seats", scenario: "Cold-climate buyer in December.", prompt: "\"Does it have heated seats and remote start? My driveway is freezing.\"", correct: "Comfort/Convenience" },
  { id: "resale", scenario: "Analytical buyer with a spreadsheet.", prompt: "\"What's this thing worth in three years? I don't want to lose my shirt.\"", correct: "Economy" },
  { id: "0-60", scenario: "Enthusiast asking about the sport trim.", prompt: "\"How does it feel off the line? I want something that pulls hard.\"", correct: "Performance" },
  { id: "sunroof", scenario: "Customer pointed up at the ceiling.", prompt: "\"Oh — does this one have the big panoramic roof? That's the whole reason I came in.\"", correct: "Appearance" },
];

export const hotButtonQuestions: DrillItem[] = rows.map((r) => ({
  id: r.id,
  scenario: r.scenario,
  promptLabel: "Customer says:",
  prompt: r.prompt,
  choices: choices(r.correct),
}));
