import { supabase } from "@/integrations/supabase/client";
import { getRecentActions } from "@/lib/actionLog";

type ErrorContext = Record<string, unknown>;

function collectDeviceInfo() {
  if (typeof window === "undefined") return {};
  const n: any = navigator;
  return {
    platform: n.platform,
    language: n.language,
    deviceMemory: n.deviceMemory,
    hardwareConcurrency: n.hardwareConcurrency,
    connection: n.connection?.effectiveType,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}`,
    dpr: window.devicePixelRatio,
  };
}

/**
 * Captures an error to the bug_reports table with full stack trace and context.
 * Safe to call even when unauthenticated (silently no-ops).
 */
export async function captureError(
  error: unknown,
  context: ErrorContext = {},
  source: "auto-client" | "manual" = "auto-client",
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // eslint-disable-next-line no-console
      console.error("[captureError]", error, context);
      return;
    }

    const err = error instanceof Error ? error : new Error(String(error));

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, email")
      .eq("user_id", user.id)
      .maybeSingle();

    await supabase.from("bug_reports").insert({
      user_id: user.id,
      user_email: profile?.email ?? user.email ?? null,
      dealership_id: profile?.dealership_id ?? null,
      description: null,
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : null,
      device_info: collectDeviceInfo(),
      recent_actions: getRecentActions(),
      source,
      error_type: err.name || "Error",
      error_message: err.message,
      error_stack: err.stack ?? null,
      error_context: context as any,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[captureError] failed to log:", e);
  }
}

let installed = false;
export function installGlobalErrorCapture() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (ev) => {
    captureError(ev.error ?? new Error(ev.message), {
      handler: "window.onerror",
      filename: ev.filename,
      lineno: ev.lineno,
      colno: ev.colno,
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    captureError(ev.reason ?? new Error("Unhandled promise rejection"), {
      handler: "unhandledrejection",
    });
  });
}
