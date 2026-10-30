import { scenarios } from "@/lib/scenarios";
import { cnaChecklist } from "@/lib/checklist";
import { trainingModules } from "@/lib/modules";
export const authStats = { scenarios: scenarios.length, checkpoints: cnaChecklist.length, modules: trainingModules.length };