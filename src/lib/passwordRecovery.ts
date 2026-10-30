import type { SupabaseClient } from "@supabase/supabase-js";
export async function initializePasswordRecovery(auth: SupabaseClient["auth"], url: URL) {
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else {
    const hash = new URLSearchParams(url.hash.slice(1));
    if (hash.get("type") === "recovery" && hash.get("access_token") && hash.get("refresh_token")) {
      const { error } = await auth.setSession({ access_token: hash.get("access_token") ?? "", refresh_token: hash.get("refresh_token") ?? "" });
      if (error) throw error;
    }
  }
  const { data, error } = await auth.getUser();
  if (error) throw error;
  return !!data.user;
}