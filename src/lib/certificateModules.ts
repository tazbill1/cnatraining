import type { TrainingModule } from "@/lib/modules";

export function certificateModuleKey(module: TrainingModule & { _dealershipModuleId?: string }) {
  return module._dealershipModuleId ? `dealership-${module._dealershipModuleId}` : module.id;
}

export function isCertifiableModule(module: TrainingModule) {
  // Custom courses are always accessible so they need no prerequisites, not because they lack quizzes.
  return module.id.startsWith("dealership-") || "_dealershipModuleId" in module || (!module.alwaysAccessible && module.id !== "base-statement-video");
}
/** Same count as mergeModules(...).filter(isCertifiableModule).length, from id-only course rows (usable signed out). */
export function countCertifiableModules(
  defaults: TrainingModule[],
  custom: { id: string; base_module_id: string | null }[],
  enabledIds: string[] | null,
) {
  const overridden = new Set(custom.filter(c => c.base_module_id && defaults.some(d => d.id === c.base_module_id)).map(c => c.base_module_id));
  const appended = custom.filter(c => !(c.base_module_id && overridden.has(c.base_module_id))).length;
  const shown = enabledIds == null ? defaults : defaults.filter(d => enabledIds.includes(d.id));
  return shown.filter(d => overridden.has(d.id) || isCertifiableModule(d)).length + appended;
}
