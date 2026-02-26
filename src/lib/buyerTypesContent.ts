import { LearningObjective, KnowledgeCheck, QuizQuestion } from "@/lib/moduleContent";

export const buyerTypesObjectives: LearningObjective[] = [
  { id: "bt1", text: "Identify the five core behavioral buyer types you'll encounter on the lot" },
  { id: "bt2", text: "Understand what motivates each type and what turns them off" },
  { id: "bt3", text: "Learn specific tips to improve the buying experience for each type" },
  { id: "bt4", text: "Recognize buyer signals so you can adapt your approach in real time" },
  { id: "bt5", text: "Connect buyer type awareness to higher close rates and better CSI scores" },
];

export const buyerTypesOverview = `Not every customer shops the same way. Some walk in armed with spreadsheets; others are riding a wave of excitement. This module teaches you to read the buyer sitting in front of you and adjust your approach so the experience feels tailored — because it is. When you match your style to their style, deals close faster, customers leave happier, and referrals follow.`;

export const buyerTypesKnowledgeChecks: Record<string, KnowledgeCheck> = {
  section1: {
    id: "bt-kc1",
    question: "A customer walks in with a printed comparison chart of three vehicles. What buyer type are they most likely?",
    type: "single",
    options: [
      { id: "a", text: "Impulse Buyer", isCorrect: false },
      { id: "b", text: "Research-Driven Buyer (The Analyst)", isCorrect: true },
      { id: "c", text: "Deal-Hunter (The Negotiator)", isCorrect: false },
      { id: "d", text: "Brand-Loyal Buyer", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly. Printed comparisons, spec sheets, and detailed questions are classic Analyst signals. Meet them with data, not hype.",
      incorrect: "A customer with printed comparison charts is showing classic Research-Driven (Analyst) behavior — they've done their homework and want facts.",
    },
  },
  section2: {
    id: "bt-kc2",
    question: "What is the biggest mistake you can make with a Deal-Hunter?",
    type: "single",
    options: [
      { id: "a", text: "Showing them the monthly payment breakdown", isCorrect: false },
      { id: "b", text: "Making them feel like they lost the negotiation", isCorrect: true },
      { id: "c", text: "Offering a test drive too early", isCorrect: false },
      { id: "d", text: "Talking about vehicle features", isCorrect: false },
    ],
    feedback: {
      correct: "Right! Deal-Hunters need to feel they won. Frame every concession as a victory for them, even when you're protecting margin.",
      incorrect: "The Deal-Hunter's core need is to feel like they got a strong deal. If they feel they lost, they'll walk — or worse, cancel after signing.",
    },
  },
  section3: {
    id: "bt-kc3",
    question: "An Emotional Buyer is excited after the test drive. What should you do?",
    type: "single",
    options: [
      { id: "a", text: "Slow down and go through a detailed comparison", isCorrect: false },
      { id: "b", text: "Suggest they go home and think about it", isCorrect: false },
      { id: "c", text: "Maintain the momentum and move toward closing", isCorrect: true },
      { id: "d", text: "Switch to a different vehicle option", isCorrect: false },
    ],
    feedback: {
      correct: "Perfect. Emotional Buyers ride waves of excitement. Your job is to keep that wave going — not slow it down with unnecessary friction.",
      incorrect: "With Emotional Buyers, excitement is your closing tool. Slowing them down or adding friction breaks the spell.",
    },
  },
  section4: {
    id: "bt-kc4",
    question: "A customer says 'I've always driven Toyotas.' What buyer type signal is this?",
    type: "single",
    options: [
      { id: "a", text: "Research-Driven Buyer", isCorrect: false },
      { id: "b", text: "Urgent Buyer", isCorrect: false },
      { id: "c", text: "Brand-Loyal Buyer (The Repeat Customer)", isCorrect: true },
      { id: "d", text: "Deal-Hunter", isCorrect: false },
    ],
    feedback: {
      correct: "Spot on. Brand loyalty is a strong signal. Acknowledge their history, streamline the process, and make them feel valued — not sold.",
      incorrect: "Stating brand history ('I've always driven…') is a textbook Brand-Loyal signal. These customers value familiarity and trust.",
    },
  },
  section5: {
    id: "bt-kc5",
    question: "A Life-Event Buyer's car was totaled yesterday. What should you prioritize?",
    type: "single",
    options: [
      { id: "a", text: "Getting the best trade-in value for their damaged car", isCorrect: false },
      { id: "b", text: "Removing obstacles and moving efficiently", isCorrect: true },
      { id: "c", text: "A thorough comparison of all available models", isCorrect: false },
      { id: "d", text: "Building long-term brand loyalty", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly. Urgent Buyers need speed and solutions. Every unnecessary step is friction they don't have patience for.",
      incorrect: "Life-Event Buyers are under pressure. They need fast, frictionless solutions — not lengthy comparisons or drawn-out processes.",
    },
  },
};

export const buyerTypesQuiz: QuizQuestion[] = [
  {
    id: "btq1",
    question: "Which buyer type responds best to comparison sheets and spec data?",
    options: [
      { id: "a", text: "The Emotional Buyer", isCorrect: false },
      { id: "b", text: "The Research-Driven Buyer (Analyst)", isCorrect: true },
      { id: "c", text: "The Urgent Buyer", isCorrect: false },
      { id: "d", text: "The Deal-Hunter", isCorrect: false },
    ],
  },
  {
    id: "btq2",
    question: "What motivates a Deal-Hunter more than anything?",
    options: [
      { id: "a", text: "Brand reputation", isCorrect: false },
      { id: "b", text: "Speed of purchase", isCorrect: false },
      { id: "c", text: "Feeling like they got the best deal", isCorrect: true },
      { id: "d", text: "Emotional connection to the vehicle", isCorrect: false },
    ],
  },
  {
    id: "btq3",
    question: "Why is momentum so important with an Emotional Buyer?",
    options: [
      { id: "a", text: "They forget details quickly", isCorrect: false },
      { id: "b", text: "Their purchase decision is driven by excitement that fades with delay", isCorrect: true },
      { id: "c", text: "They get angry if things take too long", isCorrect: false },
      { id: "d", text: "They have a short attention span", isCorrect: false },
    ],
  },
  {
    id: "btq4",
    question: "What does a Brand-Loyal Buyer value most in the sales process?",
    options: [
      { id: "a", text: "Aggressive discounting", isCorrect: false },
      { id: "b", text: "Familiarity, trust, and an efficient process", isCorrect: true },
      { id: "c", text: "Exciting test drive experiences", isCorrect: false },
      { id: "d", text: "Detailed competitive comparisons", isCorrect: false },
    ],
  },
  {
    id: "btq5",
    question: "Which buyer type is most likely to purchase same-day?",
    options: [
      { id: "a", text: "The Research-Driven Buyer", isCorrect: false },
      { id: "b", text: "The Brand-Loyal Buyer", isCorrect: false },
      { id: "c", text: "The Emotional Buyer and the Urgent Buyer", isCorrect: true },
      { id: "d", text: "The Deal-Hunter", isCorrect: false },
    ],
  },
];
