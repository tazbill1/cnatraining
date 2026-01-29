import { BookOpen, Car, MessageSquare, FileText, LucideIcon } from "lucide-react";

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
    title: "Vehicle Selection Fundamentals",
    description: "Learn proper vehicle selection theory and understand the difference between ACV and Trade Allowance.",
    icon: Car,
    estimatedTime: "10 min",
    difficulty: "beginner",
    sections: [
      { title: "Proper vehicle selection theory" },
      { title: "ACV vs Trade Allowance" },
    ],
    prerequisiteIds: [],
  },
  {
    id: "trade-appraisal-process",
    title: "The 3-Step Trade Appraisal Process",
    description: "Master the complete trade appraisal workflow from framing the conversation to purchase disclosure.",
    icon: BookOpen,
    estimatedTime: "15 min",
    difficulty: "intermediate",
    sections: [
      { title: "Step 1: Frame the conversation" },
      { title: "Step 2: Vehicle evaluation" },
      { title: "Step 3: Purchase disclosure" },
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
