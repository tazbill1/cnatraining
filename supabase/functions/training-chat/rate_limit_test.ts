import { createClient } from "npm:@supabase/supabase-js@2";
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("live shared caps, passing certificate issuance, idempotency and Super Admin exemption", async () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Service environment is required for integration verification");
  const client = createClient(url, key);
  const minuteUser = crypto.randomUUID();
  const dayUser = crypto.randomUUID();
  const moduleId = `test-${crypto.randomUUID()}`;
  try {
    const requests = await Promise.all(Array.from({ length: 31 }, (_, i) => client.rpc("consume_ai_request", { _user_id: minuteUser, _function_name: i % 2 ? "chat" : "speak" })));
    for (const request of requests) if (request.error) throw request.error;
    assertEquals(requests.filter(r => r.data.allowed).length, 30);
    assertEquals(requests.filter(r => !r.data.allowed).length, 1);
    const { error: seedError } = await client.from("ai_usage").insert(Array.from({ length: 1000 }, () => ({ user_id: dayUser, function_name: "chat", created_at: new Date(Date.now() - 7200000).toISOString() })));
    if (seedError) throw seedError;
    const daily = await client.rpc("consume_ai_request", { _user_id: dayUser, _function_name: "evaluate-session" });
    if (daily.error) throw daily.error;
    assertEquals(daily.data.allowed, false);
    assertEquals(daily.data.period, "day");
    const { data: roles, error: roleError } = await client.from("user_roles").select("user_id").eq("role", "super_admin").limit(1);
    if (roleError || !roles?.[0]) throw roleError || new Error("No administrator for exemption check");
    const exempt = await client.rpc("consume_ai_request", { _user_id: roles[0].user_id, _function_name: "training-chat" });
    if (exempt.error) throw exempt.error;
    assertEquals(exempt.data.allowed, true);
    const completion = await client.from("module_completions").insert({ user_id: minuteUser, module_id: moduleId, quiz_score: 79 });
    if (completion.error) throw completion.error;
    let certs = await client.from("course_certificates").select("quiz_score").eq("user_id", minuteUser);
    if (certs.error) throw certs.error;
    assertEquals(certs.data.length, 0);
    for (const score of [88, 100]) {
      const updated = await client.from("module_completions").update({ quiz_score: score }).eq("user_id", minuteUser).eq("module_id", moduleId);
      if (updated.error) throw updated.error;
    }
    certs = await client.from("course_certificates").select("quiz_score").eq("user_id", minuteUser);
    if (certs.error) throw certs.error;
    assertEquals(certs.data.length, 1);
    assertEquals(certs.data[0].quiz_score, 88);
  } finally {
    for (const [table, ids] of [["ai_usage", [minuteUser, dayUser]], ["course_certificates", [minuteUser]], ["module_completions", [minuteUser]]] as const) {
      const { error } = await client.from(table).delete().in("user_id", ids);
      if (error) throw error;
    }
  }
});