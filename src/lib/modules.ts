import { BookOpen, Car, MessageSquare, FileText, Phone, Handshake, Users, LucideIcon } from "lucide-react";

export type ModuleDifficulty = "beginner" | "intermediate" | "advanced";

export interface ModuleSection {
  title: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  estimatedTime: string;
  difficulty: ModuleDifficulty;
  sections: ModuleSection[];
  prerequisiteIds: string[];
  alwaysAccessible?: boolean;
}

export const trainingModules: TrainingModule[] = [
  {
    id: "buyer-types",
    title: "Module 1: Understanding Buyer Types",
    description: "Learn to identify the five behavioral buyer types — Analyst, Negotiator, Emotional, Loyal, and Urgent — and adapt your approach to close more deals with better customer experiences.",
    icon: Users,
    estimatedTime: "15-18 min",
    difficulty: "beginner",
    sections: [
      { title: "Why Buyer Types Matter" },
      { title: "The Analyst" },
      { title: "The Negotiator" },
      { title: "The Emotional Buyer" },
      { title: "The Repeat Customer" },
      { title: "The Life-Event Buyer" },
    ],
    prerequisiteIds: [],
  },
  {
    id: "base-statement",
    title: "Module 2: The Base Statement",
    description: "Master the foundation of every customer interaction. Learn the script that sets the tone, builds trust, and differentiates your dealership from day one.",
    icon: Handshake,
    estimatedTime: "8-10 min",
    difficulty: "beginner",
    sections: [
      { title: "Purpose & Context" },
      { title: "Script Part 1: Community, Mission & Differentiation" },
      { title: "Script Part 2: Two Pillars & Close" },
    ],
    prerequisiteIds: [],
  },
  {
    id: "vehicle-selection-fundamentals",
    title: "Module 3: Vehicle Selection Fundamentals",
    description: "Learn proper vehicle selection theory, the Rule of Alternatives, ACV vs Trade Allowance, the 6-step trade value calculation, and vehicle presentation standards.",
    icon: Car,
    estimatedTime: "10-12 min",
    difficulty: "beginner",
    sections: [
      { title: "Proper Vehicle Selection Theory" },
      { title: "ACV vs Trade Allowance" },
      { title: "6-Step Trade Value Calculation" },
      { title: "Vehicle Presentation & Key Management" },
    ],
    prerequisiteIds: ["base-statement"],
  },
  {
    id: "trade-appraisal-process",
    title: "Module 4: The 3-Step Trade Appraisal Process",
    description: "Master the complete trade appraisal workflow: framing the conversation, standardized vehicle evaluation, and purchase disclosure with the AEAIR objection handling framework.",
    icon: BookOpen,
    estimatedTime: "12-15 min",
    difficulty: "intermediate",
    sections: [
      { title: "Step 1: Framing the Conversation" },
      { title: "Step 2: Vehicle Evaluation" },
      { title: "Step 3: Purchase Disclosure & AEAIR" },
    ],
    prerequisiteIds: ["vehicle-selection-fundamentals"],
  },
  {
    id: "objection-handling-framework",
    title: "Objection Handling Framework",
    description: "Learn the AEAIR methodology with real objection examples from the sales floor.",
    icon: MessageSquare,
    estimatedTime: "12 min",
    difficulty: "intermediate",
    sections: [
      { title: "AEAIR methodology" },
      { title: "Real objection examples" },
    ],
    prerequisiteIds: ["vehicle-selection-fundamentals"],
  },
  {
    id: "phone-sales-fundamentals",
    title: "Module 5: Inbound Call Mastery",
    description: "Master inbound call handling: make a great first impression, apply the CARE framework, set firm appointments, and overcome common caller objections.",
    icon: Phone,
    estimatedTime: "12-15 min",
    difficulty: "intermediate",
    sections: [
      { title: "The First Impression" },
      { title: "The CARE Framework" },
      { title: "Setting the Appointment" },
      { title: "Handling Inbound Objections" },
    ],
    prerequisiteIds: ["vehicle-selection-fundamentals"],
  },
  {
    id: "quick-reference-library",
    title: "Quick Reference Library",
    description: "Access scripts, checklists, and quick reference materials anytime you need them.",
    icon: FileText,
    estimatedTime: "Always available",
    difficulty: "beginner",
    sections: [
      { title: "Scripts and checklists" },
    ],
    prerequisiteIds: [],
    alwaysAccessible: true,
  },
];

export function getModuleById(id: string): TrainingModule | undefined {
  return trainingModules.find((module) => module.id === id);
}

export function checkPrerequisitesMet(
  moduleId: string,
  completedModuleIds: string[]
): boolean {
  const module = getModuleById(moduleId);
  if (!module) return false;
  if (module.alwaysAccessible) return true;
  return module.prerequisiteIds.every((prereqId) =>
    completedModuleIds.includes(prereqId)
  );
}
