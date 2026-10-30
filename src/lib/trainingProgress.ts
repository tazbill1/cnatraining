export interface ProgressModule { id: string; title: string; category?: string }
export interface ProgressRecord { user_id: string; module_id: string; quiz_score: number | null; completed_at?: string }

export function calculateTrainingProgress(modules: ProgressModule[], records: ProgressRecord[], userIds: string[]) {
  const users = new Set(userIds);
  const uniqueModules = [...new Map(modules.map(m => [m.id, m])).values()];
  const slots = new Map(records.filter(r => users.has(r.user_id) && r.quiz_score !== null && r.quiz_score >= 80)
    .map(r => [`${r.user_id}:${r.module_id}`, r]));
  const perModule = uniqueModules.map(module => {
    const matched = [...slots.values()].filter(r => r.module_id === module.id);
    const scores = matched.map(r => r.quiz_score ?? 0);
    return { ...module, moduleId: module.id, moduleName: module.title, completedCount: matched.length, totalUsers: users.size,
      avgQuizScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0 };
  });
  const completed = perModule.reduce((sum, m) => sum + m.completedCount, 0);
  const total = uniqueModules.length * users.size;
  return { modules: perModule, completed, total, percent: total ? Math.round(completed / total * 100) : 0 };
}