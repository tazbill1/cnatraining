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
  { id: "obj1", text: "Understand proper vehicle selection theory" },
  { id: "obj2", text: "Master the difference between ACV and Trade Allowance" },
  { id: "obj3", text: "Learn the 6-step trade value calculation process" },
  { id: "obj4", text: "Know why vehicle presentation matters" },
];

export const module1KnowledgeChecks: Record<string, KnowledgeCheck> = {
  section1: {
    id: "kc1",
    question: "Why do we prepare alternatives BEFORE showing the first vehicle?",
    type: "single",
    options: [
      { id: "a", text: "To have backups if the customer doesn't like it", isCorrect: false },
      { id: "b", text: "To maintain momentum and show intentional preparation aligned with customer needs", isCorrect: true },
      { id: "c", text: "To upsell the customer to a more expensive vehicle", isCorrect: false },
      { id: "d", text: "Because managers require it", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! Preparing alternatives beforehand shows intentional preparation and keeps momentum. It demonstrates you've listened to their needs and thought carefully about options.",
      incorrect: "Not quite. The key is maintaining momentum and showing you've intentionally prepared based on their specific needs analysis - not just having random backups.",
    },
  },
  section2: {
    id: "kc2",
    question: "What is ACV based on? (Select all that apply)",
    type: "multiple",
    options: [
      { id: "a", text: "Current market sales data", isCorrect: true },
      { id: "b", text: "Negotiation tactics", isCorrect: false },
      { id: "c", text: "Vehicle mileage and condition", isCorrect: true },
      { id: "d", text: "Equipment and market demand", isCorrect: true },
      { id: "e", text: "Customer's desired trade value", isCorrect: false },
      { id: "f", text: "Reconditioning costs", isCorrect: true },
    ],
    feedback: {
      correct: "Perfect! ACV is based on objective market data: current sales, mileage, condition, equipment, demand, and reconditioning costs - never negotiation or customer wishes.",
      incorrect: "Remember: ACV is based only on objective factors like market sales, mileage, condition, equipment, demand, and reconditioning costs. It's never influenced by negotiation or what the customer wants.",
    },
  },
  section3: {
    id: "kc3",
    question: "Arrange these trade value steps in the correct order:",
    type: "reorder",
    options: [
      { id: "1", text: "Market Reality (MMR & Wholesale Data)", isCorrect: true },
      { id: "2", text: "Exit Strategy", isCorrect: true },
      { id: "3", text: "Cost to Market", isCorrect: true },
      { id: "4", text: "Fees, Transport & Risk", isCorrect: true },
      { id: "5", text: "Competitive Set & Market Position", isCorrect: true },
      { id: "6", text: "Profit Earned, Not Assumed", isCorrect: true },
    ],
    feedback: {
      correct: "You've got it! The process flows logically from market data through costs to final profit.",
      incorrect: "Review the order: Start with Market Reality, then Exit Strategy, Cost to Market, Fees & Risk, Competitive Set, and finally Profit.",
    },
  },
};

export const module1Quiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is proper vehicle selection?",
    options: [
      { id: "a", text: "Scrolling websites with the customer to find vehicles", isCorrect: false },
      { id: "b", text: "An intentional process using CNA information to understand and build excitement", isCorrect: true },
      { id: "c", text: "Letting the customer pick whatever they want", isCorrect: false },
      { id: "d", text: "Showing the most expensive vehicles first", isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "How many alternatives should you prepare before showing the first vehicle?",
    options: [
      { id: "a", text: "None - focus on their first choice", isCorrect: false },
      { id: "b", text: "One backup option", isCorrect: false },
      { id: "c", text: "Two thoughtful alternatives aligned with their needs", isCorrect: true },
      { id: "d", text: "As many as possible", isCorrect: false },
    ],
  },
  {
    id: "q3",
    question: "What is the main difference between Trade Allowance and ACV?",
    options: [
      { id: "a", text: "They are the same thing", isCorrect: false },
      { id: "b", text: "Trade Allowance can be influenced by deal structure; ACV is the real wholesale value", isCorrect: true },
      { id: "c", text: "ACV is always higher than Trade Allowance", isCorrect: false },
      { id: "d", text: "Trade Allowance is more transparent", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "What does MMR stand for and represent?",
    options: [
      { id: "a", text: "Maximum Market Rate - the highest price possible", isCorrect: false },
      { id: "b", text: "Manheim Market Report - liquid value from actual auction transactions", isCorrect: true },
      { id: "c", text: "Minimum Margin Required - dealer profit threshold", isCorrect: false },
      { id: "d", text: "Monthly Market Review - pricing updates", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "When does the customer form their first impression of a vehicle?",
    options: [
      { id: "a", text: "During the test drive", isCorrect: false },
      { id: "b", text: "When discussing features", isCorrect: false },
      { id: "c", text: "Before the test drive, features discussion, or price mention", isCorrect: true },
      { id: "d", text: "When they see the price", isCorrect: false },
    ],
  },
];
