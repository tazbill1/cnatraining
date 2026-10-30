import { describe, expect, it, vi } from "vitest";
import { calculateTrainingProgress } from "../lib/trainingProgress";
import { resolveSessionTitle } from "../lib/sessionTitles";
import { isValidNewPassword } from "../lib/passwordRules";
import { initializePasswordRecovery } from "../lib/passwordRecovery";
import { authStats, learningModuleCount } from "../lib/authStats";
import { mergeModules } from "../hooks/useDealershipModules";
import { isCertifiableModule } from "../lib/certificateModules";
import { scenarios } from "../lib/scenarios";
import { cnaChecklist } from "../lib/checklist";
import { trainingModules } from "../lib/modules";
import { parseEvaluation, evaluationSchema } from "../../supabase/functions/_shared/evaluationSchema";
import type { SupabaseClient } from "@supabase/supabase-js";
import { filterDealershipPopulation } from "../lib/dealershipMetrics";

it("Team and Admin count only assigned dealership users and completed sessions in their current dealership", () => {
  const users = [{ user_id: "u", dealership_id: "a" }, { user_id: "no-role", dealership_id: "a" }, { user_id: "unassigned", dealership_id: null }];
  const sessions = [{ user_id: "u", dealership_id: "a", status: "completed" }, { user_id: "u", dealership_id: "a", status: "in_progress" }, { user_id: "u", dealership_id: "old", status: "completed" }, { user_id: "no-role", dealership_id: "a", status: "completed" }];
  const result = filterDealershipPopulation(users, sessions, [{ user_id: "u" }, { user_id: "unassigned" }]);
  expect(result.userCount).toBe(1); expect(result.sessionCount).toBe(1);
});

describe("Unified progress", () => {
  const modules = Array.from({ length: 23 }, (_, i) => ({ id: `dealership-${i}`, title: `Course ${i}`, category: i < 17 ? "showroom" : "phone" }));
  const records = [0, 1].map(i => ({ user_id: "user", module_id: `dealership-${i}`, quiz_score: i ? 88 : 100 }));
  it("uses 2 passing courses out of 23 = 9%, not session-based 43%", () => {
    const result = calculateTrainingProgress(modules, records, ["user"]);
    expect(result.completed).toBe(2); expect(result.total).toBe(23); expect(result.percent).toBe(9);
  });
  it("deduplicates evidence and excludes failing, unrelated and unknown courses", () => {
    const result = calculateTrainingProgress(modules, [...records, records[0], { user_id: "user", module_id: "unknown", quiz_score: 100 }, { user_id: "other", module_id: modules[2].id, quiz_score: 100 }, { user_id: "user", module_id: modules[3].id, quiz_score: 79 }], ["user", "user"]);
    expect(result.completed).toBe(2); expect(result.total).toBe(23);
  });
  it("category slots sum to the same numerator and denominator as the average", () => {
    const result = calculateTrainingProgress(modules, records, ["user", "other"]);
    expect(result.modules.reduce((sum, m) => sum + m.completedCount, 0)).toBe(result.completed);
    expect(result.modules.reduce((sum, m) => sum + m.totalUsers, 0)).toBe(result.total);
    expect(result.modules[0].moduleName).toBe("Course 0");
  });
});
describe("Names and source counts", () => {
  it("resolves the same custom title for every display", () => { expect(resolveSessionTitle("custom-uuid", { "custom-uuid": "Road to the Sale: Warm Walk-In" })).toBe("Road to the Sale: Warm Walk-In"); });
  it("derives Auth statistics from actual arrays", () => { expect(authStats).toEqual({ scenarios: scenarios.length, checkpoints: cnaChecklist.length }); });
  it("counts Learning Modules like certification progress: 23 custom courses with no built-ins = 23", () => {
    const modules = Array.from({ length: 23 }, (_, i) => ({ id: `m${i}`, base_module_id: i === 0 ? trainingModules[0].id : null }));
    expect(learningModuleCount([{ enabled_module_ids: [], modules }])).toBe(23);
    const full = modules.map(m => ({ ...m, dealership_id: "d", title: m.id, description: null, icon: null, sort_order: 0, is_active: true, estimated_time: null, video_url: null, video_title: null, category: "showroom", sections: [], quiz_questions: [] }));
    expect(learningModuleCount([{ enabled_module_ids: null, modules }])).toBe(mergeModules(trainingModules, full as Parameters<typeof mergeModules>[1], null).filter(isCertifiableModule).length);
  });
});
describe("Password recovery", () => {
  it("requires 8 characters for new passwords", () => { expect(isValidNewPassword("1234567")).toBe(false); expect(isValidNewPassword("12345678")).toBe(true); });
  function auth() {
    return { exchangeCodeForSession: vi.fn(async () => ({ error: null })), setSession: vi.fn(async () => ({ error: null })), getUser: vi.fn(async () => ({ data: { user: { id: "u" } }, error: null })) };
  }
  it("accepts an existing session after validating the user", async () => { const a = auth(); expect(await initializePasswordRecovery(a as unknown as SupabaseClient["auth"], new URL("https://app.test/reset-password"))).toBe(true); expect(a.exchangeCodeForSession).not.toHaveBeenCalled(); });
  it("exchanges PKCE recovery codes", async () => { const a = auth(); await initializePasswordRecovery(a as unknown as SupabaseClient["auth"], new URL("https://app.test/reset-password?code=mock")); expect(a.exchangeCodeForSession).toHaveBeenCalledWith("mock"); });
  it("restores recovery hash tokens before validating the user", async () => { const a = auth(); await initializePasswordRecovery(a as unknown as SupabaseClient["auth"], new URL("https://app.test/reset-password#type=recovery&access_token=mock-access&refresh_token=mock-refresh")); expect(a.setSession).toHaveBeenCalledWith({ access_token: "mock-access", refresh_token: "mock-refresh" }); });
});
describe("Structured evaluation", () => {
  const category = { score: 0, label: "Test", strengths: [], improvements: ["Practice"], tip: "Practice" };
  const result = { overallScore: 0, overallTip: "Practice", categories: Object.fromEntries(["rapport", "infoGathering", "needsIdentification", "cnaCompletion"].map(k => [k, category])) };
  it("preserves valid zero scores", () => { expect(parseEvaluation(JSON.stringify(result), false).overallScore).toBe(0); });
  it("rejects prose-wrapped JSON and incomplete evaluation instead of inventing scores", () => { expect(() => parseEvaluation(`text ${JSON.stringify(result)}`, false)).toThrow(); expect(() => parseEvaluation('{"overallScore":65}', false)).toThrow(); });
  it("requires all four rubric categories in the requested schema", () => { const schema = evaluationSchema(false); expect(schema.required).toContain("categories"); expect(schema.additionalProperties).toBe(false); });
});