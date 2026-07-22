import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface ContinueTarget {
  moduleId: string;
  title: string;
  updatedAt: string;
}

const normalizeModuleId = (id: string) => id.replace(/^dealership-/, "");

export function ContinueBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [target, setTarget] = useState<ContinueTarget | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Find most recent section-progress rows for this user
      const { data: progress } = await supabase
        .from("module_section_progress")
        .select("module_id, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (!progress || progress.length === 0) {
        setTarget(null);
        return;
      }

      // Filter out completed modules. Dealership module progress stores the raw
      // module UUID, while completions store the Learn-card id (`dealership-...`).
      const moduleIds = [...new Set(progress.map((p) => p.module_id))];
      const completionIds = [...moduleIds, ...moduleIds.map((id) => `dealership-${id}`)];
      const { data: completions } = await supabase
        .from("module_completions")
        .select("module_id")
        .eq("user_id", user.id)
        .in("module_id", completionIds);

      const completedSet = new Set((completions || []).map((c) => normalizeModuleId(c.module_id)));
      const incompleteModuleIds = moduleIds.filter((id) => !completedSet.has(normalizeModuleId(id)));
      if (incompleteModuleIds.length === 0) {
        setTarget(null);
        return;
      }

      const { data: mods } = await supabase
        .from("dealership_modules")
        .select("id, title")
        .in("id", incompleteModuleIds)
        .eq("is_active", true);

      const modById = new Map((mods || []).map((mod) => [mod.id, mod]));
      const nextRow = progress.find((p) => modById.has(p.module_id));
      if (!nextRow) {
        setTarget(null);
        return;
      }
      const mod = modById.get(nextRow.module_id);
      if (!mod) return;
      setTarget({ moduleId: mod.id, title: mod.title, updatedAt: nextRow.updated_at });
    })();
  }, [user]);

  if (!target) return null;

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <PlayCircle className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
          Continue where you left off
        </p>
        <p className="text-sm sm:text-base font-medium text-foreground truncate">{target.title}</p>
      </div>
      <Button size="sm" onClick={() => navigate(`/learn/dealership/${target.moduleId}`)}>
        Resume
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
