import { BookOpen, Car, MessageSquare, FileText, Phone, LucideIcon } from "lucide-react";

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
    id: "vehicle-selection-fundamentals",
    title: "Module 1: Vehicle Selection Fundamentals",
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
    prerequisiteIds: [],
  },
  {
    id: "trade-appraisal-process",
    title: "Module 2: The 3-Step Trade Appraisal Process",
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
    title: "Module 4: Phone Sales Fundamentals",
    description: "Master inbound and outbound phone techniques, appointment setting, objection handling on calls, and converting internet leads to showroom visits.",
    icon: Phone,
    estimatedTime: "15-18 min",
    difficulty: "intermediate",
    sections: [
      { title: "Inbound Call Handling" },
      { title: "Outbound Prospecting" },
      { title: "Appointment Setting Techniques" },
      { title: "Phone Objection Handling" },
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
