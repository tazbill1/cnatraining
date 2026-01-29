// Module 1: Vehicle Selection Fundamentals Content

export interface LearningObjective {
  id: string;
  text: string;
}

export interface KnowledgeCheckOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface KnowledgeCheck {
  id: string;
  question: string;
  type: "single" | "multiple" | "reorder";
  options: KnowledgeCheckOption[];
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export interface ModuleSection {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  knowledgeCheck?: KnowledgeCheck;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export const module1Objectives: LearningObjective[] = [
  { id: "obj1", text: "Master proper vehicle selection theory and the Rule of Alternatives" },
  { id: "obj2", text: "Understand ACV vs Trade Allowance and why it matters" },
  { id: "obj3", text: "Learn the complete 6-step trade value calculation process" },
  { id: "obj4", text: "Recognize how vehicle presentation impacts customer decisions" },
  { id: "obj5", text: "Understand key management as a sales enablement system" },
];

export const module1Overview = `This module covers the foundation of professional vehicle selection and trade appraisal. You'll learn why starting with the customer's choice matters, how to calculate real vehicle value, and why presentation can make or break a sale.`;

export const module1KnowledgeChecks: Record<string, KnowledgeCheck> = {
  section1: {
    id: "kc1",
    question: "Why must alternatives be chosen BEFORE showing the first vehicle?",
    type: "single",
    options: [
      { id: "a", text: "It saves time", isCorrect: false },
      { id: "b", text: "It maintains control and shows expertise", isCorrect: true },
      { id: "c", text: "Customers expect it", isCorrect: false },
      { id: "d", text: "It's company policy", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! When you've already identified alternatives, you can pivot smoothly and confidently. The customer never sees you scrambling.",
      incorrect: "Not quite. The key is maintaining control and demonstrating expertise - when you've prepared alternatives, you can pivot smoothly without scrambling.",
    },
  },
  section2: {
    id: "kc2",
    question: "What is ACV based on? (Select all that apply)",
    type: "multiple",
    options: [
      { id: "a", text: "Online listing prices", isCorrect: false },
      { id: "b", text: "Actual auction transaction data", isCorrect: true },
      { id: "c", text: "Current mileage", isCorrect: true },
      { id: "d", text: "True vehicle condition", isCorrect: true },
      { id: "e", text: "What the customer hopes to get", isCorrect: false },
      { id: "f", text: "Reconditioning costs", isCorrect: true },
    ],
    feedback: {
      correct: "Perfect! ACV is market-driven, not wish-driven. That's what makes it defensible.",
      incorrect: "Remember: ACV is based only on market-driven factors like auction data, mileage, condition, and reconditioning costs - never on listing prices or customer wishes.",
    },
  },
  section3: {
    id: "kc3",
    question: "What happens if condition is overstated?",
    type: "single",
    options: [
      { id: "a", text: "The customer gets a better deal", isCorrect: false },
      { id: "b", text: "Profit is protected", isCorrect: false },
      { id: "c", text: "Unexpected recon costs destroy profit", isCorrect: true },
      { id: "d", text: "Nothing, it doesn't matter", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly. Overstating condition doesn't help anyone - it creates losses when reality shows up in the shop.",
      incorrect: "Overstating condition creates losses. The gap between expected and actual recon costs is where profit is destroyed.",
    },
  },
  section4: {
    id: "kc4",
    question: "When do first impressions get formed?",
    type: "single",
    options: [
      { id: "a", text: "During the test drive", isCorrect: false },
      { id: "b", text: "When discussing features", isCorrect: false },
      { id: "c", text: "Before any of those - the moment they see the vehicle", isCorrect: true },
      { id: "d", text: "During price disclosure", isCorrect: false },
    ],
    feedback: {
      correct: "Right! Their brain is already deciding if this 'feels right' before you say a word. That's why presentation is non-negotiable.",
      incorrect: "First impressions are formed the moment they see the vehicle - before the test drive, features discussion, or price mention.",
    },
  },
};

export const module1Quiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the Rule of Alternatives?",
    options: [
      { id: "a", text: "Have backup vehicles ready just in case", isCorrect: false },
      { id: "b", text: "Always prepare 2 thoughtful alternatives before showing the first vehicle", isCorrect: true },
      { id: "c", text: "Show three vehicles minimum", isCorrect: false },
      { id: "d", text: "Let customers browse alternatives online", isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "What does ACV stand for and why do we use it?",
    options: [
      { id: "a", text: "Average Car Value - it's easier to calculate", isCorrect: false },
      { id: "b", text: "Actual Cash Value - it's market-based and transparent", isCorrect: true },
      { id: "c", text: "Auction Car Value - it matches what auctions use", isCorrect: false },
      { id: "d", text: "Approximate Car Value - it's close enough", isCorrect: false },
    ],
  },
  {
    id: "q3",
    question: "Why does accurate condition reporting matter in the 6-step process?",
    options: [
      { id: "a", text: "It's required by law", isCorrect: false },
      { id: "b", text: "It determines MMR tier and prevents unexpected recon costs", isCorrect: true },
      { id: "c", text: "Customers appreciate honesty", isCorrect: false },
      { id: "d", text: "It speeds up the paperwork", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "What happens when vehicle presentation is wrong?",
    options: [
      { id: "a", text: "The customer focuses on price", isCorrect: false },
      { id: "b", text: "The customer questions the decision itself", isCorrect: true },
      { id: "c", text: "The test drive takes longer", isCorrect: false },
      { id: "d", text: "Nothing significant changes", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "Why is key management considered a sales enablement system?",
    options: [
      { id: "a", text: "It helps with inventory tracking", isCorrect: false },
      { id: "b", text: "It controls speed, flow, and preserves customer desire", isCorrect: true },
      { id: "c", text: "It's an administrative requirement", isCorrect: false },
      { id: "d", text: "It reduces theft", isCorrect: false },
    ],
  },
];
