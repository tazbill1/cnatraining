import type { TrainingModule } from "@/lib/modules";

export function certificateModuleKey(module: TrainingModule & { _dealershipModuleId?: string }) {
  return module._dealershipModuleId ? `dealership-${module._dealershipModuleId}` : module.id;
}

export function isCertifiableModule(module: TrainingModule) {
  // Custom courses are always accessible so they need no prerequisites, not because they lack quizzes.
  return module.id.startsWith("dealership-") || "_dealershipModuleId" in module || (!module.alwaysAccessible && module.id !== "base-statement-video");
}