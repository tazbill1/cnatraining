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
  it("blocks all five handlers before calling AI using the authenticated user, not a supplied ID", async () => {
    for (const name of ["training-chat", "chat", "speak", "transcribe", "evaluate-session"]) {
      const source = readFileSync(`supabase/functions/${name}/index.ts`, "utf8").replace(/^import .*;\r?\n/gm, "");
      let handler: ((req: Request) => Promise<Response>) | undefined;
      const capture = (fn: (req: Request) => Promise<Response>) => { handler = fn; };
      new Script(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText).runInContext(createContext({
        exports: {}, Response, console, corsHeaders: {}, serve: capture, Deno: { env: { get: () => "mock" }, serve: capture },
        createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: "verified-user" } }, error: null }) } }),
        requireDealership: async () => ({ errorResponse: null, profile: { dealership_id: "team" }, isSuperAdmin: false }),
        requireAIRateLimit: async (id: string, fn: string) => {
          expect(id).toBe("verified-user");
          expect(fn).toBe(name);
          return new Response('{"error":"Please wait a moment and try again."}', { status: 429 });
        },
        fetch: () => { throw new Error("Blocked calls must not reach AI"); },
      }));
      if (!handler) throw new Error("Missing handler");
      const response = await handler(new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer mock" }, body: '{"userId":"forged"}' }));
      expect(response.status, name).toBe(429);
    }
  });
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