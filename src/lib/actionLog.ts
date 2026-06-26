// Lightweight in-memory ring buffer of recent user actions for bug reports.
// No PII beyond what the user is doing in-app. Cleared on full page reload.

export type LoggedAction = {
  t: string; // ISO timestamp
  type: "route" | "click" | "submit" | "error" | "custom";
  detail: string;
};

const MAX_ACTIONS = 30;
const buffer: LoggedAction[] = [];

export function logAction(type: LoggedAction["type"], detail: string) {
  buffer.push({ t: new Date().toISOString(), type, detail: detail.slice(0, 200) });
  if (buffer.length > MAX_ACTIONS) buffer.shift();
}

export function getRecentActions(): LoggedAction[] {
  return [...buffer];
}

let installed = false;
export function installGlobalActionLogger() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // Initial route
  logAction("route", window.location.pathname + window.location.search);

  // Route changes via history API
  const wrap = (key: "pushState" | "replaceState") => {
    const original = history[key];
    history[key] = function (...args: any[]) {
      const result = original.apply(this, args as any);
      logAction("route", window.location.pathname + window.location.search);
      return result;
    } as any;
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", () =>
    logAction("route", window.location.pathname + window.location.search),
  );

  // Clicks on interactive elements
  window.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest("button, a, [role='button'], [role='tab'], [role='menuitem']") as HTMLElement | null;
      if (!el) return;
      const label =
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        (el.textContent || "").trim().slice(0, 80) ||
        el.tagName.toLowerCase();
      logAction("click", label);
    },
    { capture: true },
  );

  // Form submissions
  window.addEventListener(
    "submit",
    (e) => {
      const form = e.target as HTMLFormElement | null;
      logAction("submit", form?.getAttribute("name") || form?.id || "form");
    },
    { capture: true },
  );

  // Uncaught errors
  window.addEventListener("error", (e) => {
    logAction("error", `${e.message} @ ${e.filename}:${e.lineno}`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e.reason && (e.reason.message || String(e.reason))) || "unhandled rejection";
    logAction("error", reason);
  });
}
