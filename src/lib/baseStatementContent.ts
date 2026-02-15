// Module 1: The Base Statement - Learning Content

import type { LearningObjective, KnowledgeCheck, QuizQuestion } from "@/lib/moduleContent";

export const baseStatementObjectives: LearningObjective[] = [
  { id: "obj1", text: "Understand the purpose of the Base Statement and where it fits in the sales process" },
  { id: "obj2", text: "Learn the 5-part structure: Community, Mission, Differentiation, Two Pillars, and Close" },
  { id: "obj3", text: "Master delivery guidelines for tone, pace, and eye contact" },
  { id: "obj4", text: "Memorize and confidently deliver the full Base Statement" },
];

export const baseStatementOverview = `The Base Statement is the opening move of your entire sales process. It lives inside the Meet & Greet — the very first structured interaction a customer has with you. Before asking a single question, this script sets the tone, establishes trust, and tells the customer exactly what makes your dealership different.`;

export const baseStatementKnowledgeChecks: Record<string, KnowledgeCheck> = {
  section1: {
    id: "bs-kc1",
    question: "When do you deliver the Base Statement?",
    type: "single",
    options: [
      { id: "a", text: "After the CNA, before vehicle selection", isCorrect: false },
      { id: "b", text: "Right after your greeting and handshake, before asking any questions", isCorrect: true },
      { id: "c", text: "During the test drive", isCorrect: false },
      { id: "d", text: "When discussing pricing", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! The Base Statement comes right after 'Hi, I'm [Your Name]' — before you ask a single question about what they're looking for.",
      incorrect: "The Base Statement happens immediately after your greeting and handshake, before the CNA or any other step in the process.",
    },
  },
  section2: {
    id: "bs-kc2",
    question: "What is the single most important sentence in the Base Statement?",
    type: "single",
    options: [
      { id: "a", text: "The community connection line", isCorrect: false },
      { id: "b", text: "'We focus on two big things...'", isCorrect: false },
      { id: "c", text: "'To earn your trust and create a lifetime customer'", isCorrect: true },
      { id: "d", text: "The close/transition line", isCorrect: false },
    ],
    feedback: {
      correct: "Right! This is the anchor line. Slow down here, let it breathe — it's the core mission that everything else builds on.",
      incorrect: "The core mission line — 'to earn your trust and create a lifetime customer' — is the anchor. It's the single most important sentence in the entire Base Statement.",
    },
  },
  section3: {
    id: "bs-kc3",
    question: "What are the two pillars of the Base Statement? (Select all that apply)",
    type: "multiple",
    options: [
      { id: "a", text: "A great buying experience", isCorrect: true },
      { id: "b", text: "The lowest price in town", isCorrect: false },
      { id: "c", text: "A great ownership experience", isCorrect: true },
      { id: "d", text: "The fastest sales process", isCorrect: false },
    ],
    feedback: {
      correct: "Perfect! The two pillars are the buying experience (finding the RIGHT vehicle) and the ownership experience (caring about them long after the sale).",
      incorrect: "The two pillars are: (1) giving a great buying experience and (2) delivering a great ownership experience. It's about the customer's journey, not price or speed.",
    },
  },
};

export const baseStatementQuiz: QuizQuestion[] = [
  {
    id: "bsq1",
    question: "Where does the Base Statement fit in the sales process?",
    options: [
      { id: "a", text: "During the CNA", isCorrect: false },
      { id: "b", text: "Inside the Meet & Greet, right after your introduction", isCorrect: true },
      { id: "c", text: "After the test drive", isCorrect: false },
      { id: "d", text: "During the write-up", isCorrect: false },
    ],
  },
  {
    id: "bsq2",
    question: "What is the primary purpose of the Base Statement?",
    options: [
      { id: "a", text: "To quote vehicle prices", isCorrect: false },
      { id: "b", text: "To set the tone, establish trust, and differentiate the dealership", isCorrect: true },
      { id: "c", text: "To gather customer contact information", isCorrect: false },
      { id: "d", text: "To schedule a test drive", isCorrect: false },
    ],
  },
  {
    id: "bsq3",
    question: "What tone should you use when delivering the Base Statement?",
    options: [
      { id: "a", text: "Formal and corporate", isCorrect: false },
      { id: "b", text: "Warm, confident, and conversational — like talking to a neighbor", isCorrect: true },
      { id: "c", text: "Fast and energetic to show enthusiasm", isCorrect: false },
      { id: "d", text: "Quiet and reserved", isCorrect: false },
    ],
  },
  {
    id: "bsq4",
    question: "What does the 'ownership experience' pillar communicate to the customer?",
    options: [
      { id: "a", text: "That maintenance is included free", isCorrect: false },
      { id: "b", text: "That you care about how they feel owning the vehicle years from now", isCorrect: true },
      { id: "c", text: "That they should come back for service", isCorrect: false },
      { id: "d", text: "That the car has a long warranty", isCorrect: false },
    ],
  },
  {
    id: "bsq5",
    question: "Why should you emphasize the word 'RIGHT' in 'the RIGHT vehicle'?",
    options: [
      { id: "a", text: "It sounds more professional", isCorrect: false },
      { id: "b", text: "It signals you're finding THEIR car, not just selling any car", isCorrect: true },
      { id: "c", text: "It's required by the script", isCorrect: false },
      { id: "d", text: "It makes the customer feel pressured to decide", isCorrect: false },
    ],
  },
];

export const fullBaseStatement = `"We've been a part of [City/Town] for a long time, and we're proud to be part of such an amazing community. Here at [Dealership Name], your experience is our top priority.

At the heart of everything we do is one big goal: to earn your trust and create a lifetime customer.

We know the only way to do that is by doing things differently — and doing them right.

We focus on two big things that matter most to our customers:

First — giving you a great buying experience. We'll help you find the RIGHT vehicle — one that fits your needs, your dreams, and becomes part of the incredible memories you'll make along the way.

Second — delivering a great ownership experience. We care just as much about how you feel owning this vehicle years from now as we do today.

There are a lot of ways we bring this commitment to life, and I'm excited to show you how we take care of you every step of the way."`;
