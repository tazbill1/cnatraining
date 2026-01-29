// Module 2: The 3-Step Trade Appraisal Process Content

import { LearningObjective, KnowledgeCheck, QuizQuestion } from "./moduleContent";

export const module2Objectives: LearningObjective[] = [
  { id: "obj1", text: "Master the art of framing the trade appraisal before any inspection" },
  { id: "obj2", text: "Learn the standardized vehicle evaluation sequence" },
  { id: "obj3", text: "Understand purchase disclosure and controlled objection handling" },
  { id: "obj4", text: "Apply the AEAIR Framework for trade objections" },
  { id: "obj5", text: "Recognize behavior standards that build credibility" },
];

export const module2Overview = `This module teaches the complete trade appraisal workflow from start to finish. You'll learn how to set expectations before touching the vehicle, conduct a professional evaluation, and deliver trade values in a way that maintains momentum and reduces objections.`;

export const module2KnowledgeChecks: Record<string, KnowledgeCheck> = {
  section1: {
    id: "kc1",
    question: "What is the primary purpose of Step 1 (Framing)?",
    type: "single",
    options: [
      { id: "a", text: "To determine the trade value quickly", isCorrect: false },
      { id: "b", text: "To set expectations and establish process credibility before any inspection", isCorrect: true },
      { id: "c", text: "To ask what the customer expects for their trade", isCorrect: false },
      { id: "d", text: "To compare online values with the customer", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! Step 1 is about creating alignment before information. When the frame is set correctly, resistance drops and explanations feel logical.",
      incorrect: "Step 1 is not about the number - it's about setting expectations and establishing process credibility before any inspection begins.",
    },
  },
  section2: {
    id: "kc2",
    question: "What should you do if you notice damage during the vehicle evaluation?",
    type: "single",
    options: [
      { id: "a", text: "Comment on how it affects the value", isCorrect: false },
      { id: "b", text: "Take additional photos and document it without commentary", isCorrect: true },
      { id: "c", text: "Ask the customer what happened and how much repairs would cost", isCorrect: false },
      { id: "d", text: "Skip it to avoid making the customer uncomfortable", isCorrect: false },
    ],
    feedback: {
      correct: "Correct! You document only what is visible. No diagnosing, no commentary. Consistency and neutrality build credibility.",
      incorrect: "During evaluation, take additional photos of damage but avoid commentary. Document only what is visible - no diagnosing.",
    },
  },
  section3: {
    id: "kc3",
    question: "When should trade objections be addressed?",
    type: "single",
    options: [
      { id: "a", text: "During the vehicle evaluation", isCorrect: false },
      { id: "b", text: "While disclosing the trade value", isCorrect: false },
      { id: "c", text: "Only after the purchase disclosure is complete and a decision is requested", isCorrect: true },
      { id: "d", text: "Before showing any numbers", isCorrect: false },
    ],
    feedback: {
      correct: "Perfect! Objections belong after disclosure, not during it. When they surface at the decision point, they're isolated, specific, and real.",
      incorrect: "Trade objections should only surface after the purchase disclosure is complete and you've asked for a decision. This keeps them isolated and manageable.",
    },
  },
};

export const module2Quiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What questions should you AVOID asking during Step 1 (Framing)?",
    options: [
      { id: "a", text: '"What do you think your car is worth?"', isCorrect: true },
      { id: "b", text: '"Is this your first time trading in a vehicle?"', isCorrect: false },
      { id: "c", text: '"Do you have the title with you today?"', isCorrect: false },
      { id: "d", text: '"How long have you owned this vehicle?"', isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "What is the correct order for the exterior photo sequence?",
    options: [
      { id: "a", text: "Driver side, Front, Passenger side, Rear", isCorrect: false },
      { id: "b", text: "Front, Passenger side, Rear, Driver side", isCorrect: true },
      { id: "c", text: "Rear, Driver side, Front, Passenger side", isCorrect: false },
      { id: "d", text: "Any order is acceptable", isCorrect: false },
    ],
  },
  {
    id: "q3",
    question: "How should you disclose the trade value during Step 3?",
    options: [
      { id: "a", text: "Pause after stating it to let it sink in", isCorrect: false },
      { id: "b", text: "State it as a fact with no tone change, pause, or explanation, then continue immediately", isCorrect: true },
      { id: "c", text: "Explain the reasoning behind the number before stating it", isCorrect: false },
      { id: "d", text: "Ask if they have any questions about it first", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "What does the 'A' in AEAIR stand for?",
    options: [
      { id: "a", text: "Apologize", isCorrect: false },
      { id: "b", text: "Acknowledge (Alignment First)", isCorrect: true },
      { id: "c", text: "Argue", isCorrect: false },
      { id: "d", text: "Accept", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "Why does consistency in the evaluation process matter?",
    options: [
      { id: "a", text: "It makes the process faster", isCorrect: false },
      { id: "b", text: "It allows any salesperson to show any vehicle without guessing or scrambling", isCorrect: true },
      { id: "c", text: "It's required by dealership policy", isCorrect: false },
      { id: "d", text: "It impresses customers with efficiency", isCorrect: false },
    ],
  },
];
