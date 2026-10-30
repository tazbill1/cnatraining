import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";
import ts from "typescript";
import { trainingVideoPath } from "../lib/trainingVideoPath";
import { aiResponseError } from "../lib/aiErrors";

const exports: Record<string, unknown> = {};
new Script(ts.transpileModule(readFileSync("supabase/functions/_shared/aiGatewayErrors.ts", "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText).runInContext(createContext({ exports, Response, console: { error: vi.fn() } }));
const gatewayError = exports.gatewayErrorResponse as (response: Response, headers: Record<string, string>) => Promise<Response>;
const missingKey = exports.missingAIKeyResponse as (headers: Record<string, string>) => Response;

describe("AI errors", () => {
  it("preserves credit exhaustion as 402 and the administrator remedy", async () => {
    const response = await gatewayError(new Response('{"message":"out of credits"}', { status: 402 }), {});
    const error = await aiResponseError(response, "fallback");
    expect(error.status).toBe(402);
    expect(error.message).toBe("AI credits are exhausted. Please contact your administrator.");
  });
  it("preserves rate limiting as 429 including Retry-After", async () => {
    const response = await gatewayError(new Response('{}', { status: 429, headers: { "Retry-After": "30" } }), {});
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
  });
  it("preserves terminal provider denials rather than hiding them as 500", async () => {
    const response = await gatewayError(new Response('{"error":{"message":"Provider access denied"}}', { status: 403 }), {});
    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe("Provider access denied");
  });
  it("returns a clear 500 for missing configuration", async () => {
    const response = missingKey({});
    expect(response.status).toBe(500);
    expect((await response.json()).error).toContain("not configured");
  });
});

describe("Private training video references", () => {
  const origin = "https://storage.example.test";
  it("resolves existing public links without rewriting stored data", () => {
    expect(trainingVideoPath(`${origin}/storage/v1/object/public/training-videos/team/video.mp4`, origin)).toBe("team/video.mp4");
  });
  it("resolves stable references without persisting signed credentials", () => {
    expect(trainingVideoPath("training-videos/team/video.mp4", origin)).toBe("team/video.mp4");
  });
  it("does not sign another host's URLs or traversal paths", () => {
    expect(trainingVideoPath("https://evil.test/storage/v1/object/public/training-videos/team/video.mp4", origin)).toBeNull();
    expect(trainingVideoPath("training-videos/team/../video.mp4", origin)).toBeNull();
  });
});