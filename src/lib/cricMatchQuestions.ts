import type { DrillItem } from "@/components/drills/StreakDrill";

type CricCategory = "Budget" | "Decision" | "Deal";

const CATEGORY_WHY: Record<CricCategory, string> = {
  Budget: "Anything about money, payments, or affordability is a Budget objection.",
  Decision: "Needing time, a spouse, or a second opinion is a Decision objection.",
  Deal: "Wanting to shop, compare, or negotiate is a Deal objection.",
};

function makeChoices(correct: CricCategory) {
  const all: CricCategory[] = ["Budget", "Decision", "Deal"];
  return all.map((c) => ({
    text: c,
    correct: c === correct,
    why: c === correct ? CATEGORY_WHY[c] : `This one is a ${correct} objection — ${CATEGORY_WHY[correct]}`,
  }));
}

interface Row {
  id: string;
  scenario: string;
  prompt: string;
  correct: CricCategory;
}

const rows: Row[] = [
  {
    id: "too-much",
    scenario: "You just presented numbers at the desk.",
    prompt: "\"Wow, that's way too much money.\"",
    correct: "Budget",
  },
  {
    id: "think-over",
    scenario: "You're wrapping up the presentation.",
    prompt: "\"You know what, we really just want to go home and think it over.\"",
    correct: "Decision",
  },
  {
    id: "shop-around",
    scenario: "After the first pencil.",
    prompt: "\"We want to shop around before we make a decision.\"",
    correct: "Deal",
  },
  {
    id: "payment-high",
    scenario: "Customer sees the initial monthly payment.",
    prompt: "\"That payment is way more than I want to spend a month.\"",
    correct: "Budget",
  },
  {
    id: "check-spouse",
    scenario: "Customer came in alone.",
    prompt: "\"I really need to run this by my wife before I sign anything.\"",
    correct: "Decision",
  },
  {
    id: "cheaper-elsewhere",
    scenario: "Customer pulls out their phone.",
    prompt: "\"I saw the same car $1,500 less at the dealer down the street.\"",
    correct: "Deal",
  },
  {
    id: "afford",
    scenario: "After breaking down the numbers.",
    prompt: "\"I just don't think we can afford this right now.\"",
    correct: "Budget",
  },
  {
    id: "big-decision",
    scenario: "Customer keeps re-reading the worksheet.",
    prompt: "\"This is a big decision for us — I want to run all the numbers through a calculator first.\"",
    correct: "Decision",
  },
  {
    id: "trade-value",
    scenario: "Customer is reviewing the trade line.",
    prompt: "\"You're not giving me enough for my trade. I know it's worth more than that.\"",
    correct: "Deal",
  },
  {
    id: "budget-monthly",
    scenario: "Customer flinches at the total.",
    prompt: "\"We're on a strict monthly budget and this is over what we said we'd spend.\"",
    correct: "Budget",
  },
  {
    id: "sleep-on-it",
    scenario: "Everything else has gone well.",
    prompt: "\"Let us go home and sleep on it. We'll be back tomorrow.\"",
    correct: "Decision",
  },
  {
    id: "internet-price",
    scenario: "Customer shows you a screenshot.",
    prompt: "\"This exact model shows up online for way less than what you're quoting me.\"",
    correct: "Deal",
  },
];

export const cricMatchQuestions: DrillItem[] = rows.map((r) => ({
  id: r.id,
  scenario: r.scenario,
  promptLabel: "Customer says:",
  prompt: r.prompt,
  choices: makeChoices(r.correct),
}));
