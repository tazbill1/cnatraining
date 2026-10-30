import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";
import ts from "typescript";
import { AIRequestError, aiInvokeError, aiResponseError } from "../lib/aiErrors";

const message = "Your account is not assigned to a dealership yet. Contact your manager.";
const transpile = (source: string) => ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exports: Record<string, unknown> = {};
new Script(transpile(readFileSync("supabase/functions/_shared/requireDealership.ts", "utf8"))).runInContext(
  createContext({ exports, Response }),
);
type GuardResult = { errorResponse: Response | null };
const guard = exports.requireDealership as (client: unknown, id: string, headers: Record<string, string>) => Promise<GuardResult>;

function client(dealership: string | null, superAdmin: boolean, failure = false) {
  return {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { dealership_id: dealership }, error: failure ? new Error("lookup") : null }) }) }) }),
    rpc: async () => ({ data: superAdmin, error: null }),
  };
}

describe("AI dealership access", () => {
  it("rejects an unassigned non-admin with 403 before parsing input in all five functions", async () => {
    for (const name of ["training-chat", "chat", "speak", "transcribe", "evaluate-session"]) {
      const source = readFileSync(`supabase/functions/${name}/index.ts`, "utf8").replace(/^import .*;\r?\n/gm, "").replace(/cors_1\.corsHeaders/g, "corsHeaders");
      let handler: ((req: Request) => Promise<Response>) | undefined;
      const capture = (callback: (req: Request) => Promise<Response>) => { handler = callback; };
      new Script(transpile(source)).runInContext(createContext({
        exports: {}, serve: capture, Deno: { env: { get: () => "mock" }, serve: capture }, Response, console, corsHeaders: {},
        requireDealership: guard,
        createClient: () => ({ ...client(null, false), auth: { getUser: async () => ({ data: { user: { id: "verified" } }, error: null }) } }),
        fetch: () => { throw new Error("Must not call AI"); },
      }));
      if (!handler) throw new Error("Missing handler");
      const response = await handler(new Request("http://localhost", { method: "POST", headers: { authorization: "Bearer mock" }, body: "invalid json" }));
      expect(response.status, name).toBe(403);
      expect((await response.json()).error).toBe(message);
    }
  });
  it("allows assigned users", async () => {
    expect((await guard(client("dealership", false), "verified", {})).errorResponse).toBeNull();
  });
  it("allows existing unassigned Super Admins", async () => {
    expect((await guard(client(null, true), "verified", {})).errorResponse).toBeNull();
  });
  it("fails closed on membership lookup errors", async () => {
    expect((await guard(client(null, false, true), "verified", {})).errorResponse?.status).toBe(503);
  });
});

describe("AI denial propagation", () => {
  it("preserves the server denial from fetch", async () => {
    const error = await aiResponseError(new Response(JSON.stringify({ error: message }), { status: 403 }), "fallback");
    expect(error).toBeInstanceOf(AIRequestError);
    expect(error.status).toBe(403);
    expect(error.message).toBe(message);
  });
  it("preserves the server denial from function invocation", async () => {
    const error = await aiInvokeError({ context: new Response(JSON.stringify({ error: message }), { status: 403 }) }, "fallback");
    expect(error.message).toBe(message);
  });
});