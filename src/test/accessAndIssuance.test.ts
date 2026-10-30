import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";
import ts from "typescript";
import { trainingModules } from "../lib/modules";
import { certificateModuleKey, isCertifiableModule } from "../lib/certificateModules";
import { canAccessRestrictedRoute } from "../lib/routeAccess";
import { aiResponseError } from "../lib/aiErrors";

const source = readFileSync("supabase/functions/_shared/aiRateLimit.ts", "utf8").replace(/^import .*;\r?\n/gm, "");
function limiter(result: unknown, error: unknown = null) {
  const exports: Record<string, unknown> = {};
  new Script(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText)
    .runInContext(createContext({ exports, Response, console, Deno: { env: { get: () => "mock" } }, createClient: () => ({ rpc: async () => ({ data: result, error }) }) }));
  return exports.requireAIRateLimit as (id: string, name: string, headers: Record<string, string>) => Promise<Response | null>;
}

describe("Per-user limit responses", () => {
  it("returns minute-limit 429 with a friendly message and retry window", async () => {
    const response = await limiter({ allowed: false, period: "minute", retry_after: 12 })("user", "chat", {});
    if (!response) throw new Error("Missing limit response");
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("12");
    expect((await aiResponseError(response, "fallback")).message).toContain("30 AI requests");
  });
  it("returns daily-limit 429 with the 1,000 request cap", async () => {
    const response = await limiter({ allowed: false, period: "day", retry_after: 3600 })("user", "transcribe", {});
    if (!response) throw new Error("Missing limit response");
    expect(response.status).toBe(429);
    expect((await response.json()).error).toContain("1,000");
  });
  it("allows database-approved requests including exempt administrators", async () => {
    expect(await limiter({ allowed: true })("admin", "speak", {})).toBeNull();
  });
  it("fails closed if the usage lookup is unavailable", async () => {
    expect((await limiter(null, { message: "unavailable" })("user", "chat", {}))?.status).toBe(503);
  });
});

describe("Restricted routes", () => {
  it("allows managers on Team, not Admin", () => {
    const roles = { isManager: true, isSuperAdmin: false };
    expect(canAccessRestrictedRoute("team", roles)).toBe(true);
    expect(canAccessRestrictedRoute("admin", roles)).toBe(false);
  });
  it("allows Super Admins on both restricted pages", () => {
    const roles = { isManager: false, isSuperAdmin: true };
    expect(canAccessRestrictedRoute("team", roles)).toBe(true);
    expect(canAccessRestrictedRoute("admin", roles)).toBe(true);
  });
  it("denies salespeople on both restricted pages", () => {
    const roles = { isManager: false, isSuperAdmin: false };
    expect(canAccessRestrictedRoute("team", roles)).toBe(false);
    expect(canAccessRestrictedRoute("admin", roles)).toBe(false);
  });
});

describe("Certificate course matching", () => {
  const base = trainingModules[0];
  it("includes always-accessible custom courses rather than discarding their passing certificates", () => {
    const module = { ...base, id: "dealership-cdb2507d-37ca-4ac3-bd3b-b7a16f5cd138", alwaysAccessible: true };
    expect(isCertifiableModule(module)).toBe(true);
    expect(certificateModuleKey(module)).toBe("dealership-cdb2507d-37ca-4ac3-bd3b-b7a16f5cd138");
  });
  it("matches custom overrides to the server completion key", () => {
    expect(certificateModuleKey({ ...base, _dealershipModuleId: "custom-id" })).toBe("dealership-custom-id");
  });
});