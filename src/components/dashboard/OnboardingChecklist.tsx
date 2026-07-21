import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  cta: string;
  route: string;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dismissKey = `onboarding_checklist_dismissed_${user.id}`;
    if (localStorage.getItem(dismissKey) === "true") {
      setHidden(true);
      setLoading(false);
      return;
    }

    (async () => {
      const [modRes, sessRes, drillRes, certRes] = await Promise.all([
        supabase.from("module_completions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("training_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
        supabase.from("drill_scores").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("module_completions").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("quiz_score", 80),
      ]);

      const built: ChecklistItem[] = [
        { key: "module", label: "Complete your first learning module", done: (modRes.count || 0) > 0, cta: "Start Learning", route: "/learn" },
        { key: "practice", label: "Finish a practice roleplay session", done: (sessRes.count || 0) > 0, cta: "Go to Practice", route: "/scenarios" },
        { key: "drill", label: "Play a skill drill game", done: (drillRes.count || 0) > 0, cta: "Try a Drill", route: "/scenarios" },
        { key: "cert", label: "Earn your first certificate (80%+ on a quiz)", done: (certRes.count || 0) > 0, cta: "View Certificates", route: "/certificates" },
      ];
      setItems(built);
      setLoading(false);

      // Auto-dismiss when everything is done
      if (built.every((i) => i.done)) {
        localStorage.setItem(dismissKey, "true");
      }
    })();
  }, [user]);

  const dismiss = () => {
    if (user) localStorage.setItem(`onboarding_checklist_dismissed_${user.id}`, "true");
    setHidden(true);
  };

  if (hidden || loading || items.length === 0) return null;
  if (items.every((i) => i.done)) return null;

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="card-premium p-5 sm:p-6 mb-6 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss checklist"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Getting started</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {doneCount} of {items.length} complete · {pct}%
      </p>
      <div className="w-full bg-muted rounded-full h-1.5 mb-4">
        <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const nextItem = !item.done && items.filter((i) => !i.done)[0]?.key === item.key;
          return (
            <li
              key={item.key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                item.done ? "border-transparent bg-muted/40" : "border-border",
                nextItem && "border-primary/40 bg-primary/5"
              )}
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <span className={cn("flex-1 text-sm", item.done && "line-through text-muted-foreground")}>
                {item.label}
              </span>
              {!item.done && (
                <Button size="sm" variant={nextItem ? "default" : "outline"} onClick={() => navigate(item.route)}>
                  {item.cta}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
