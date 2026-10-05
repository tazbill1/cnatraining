import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronRight } from "lucide-react";

interface Row { id: string; module_id: string; due_date: string | null; title: string; done: boolean }

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** "Assigned to you" list for the signed-in learner. Hidden when nothing is assigned. */
export function MyAssignedCourses({ showCompleted = false }: { showCompleted?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: a } = await supabase
        .from("course_assignments")
        .select("id, module_id, due_date")
        .eq("user_id", user.id);
      if (!a || a.length === 0) { setRows([]); return; }
      const [{ data: mods }, { data: done }] = await Promise.all([
        supabase.from("dealership_modules").select("id, title").in("id", a.map((x) => x.module_id)),
        supabase.from("module_completions").select("module_id").eq("user_id", user.id),
      ]);
      const doneSet = new Set((done || []).map((d) => d.module_id));
      const list = a.map((x) => ({
        ...x,
        title: mods?.find((m) => m.id === x.module_id)?.title || "Course",
        done: doneSet.has(`dealership-${x.module_id}`),
      }));
      list.sort((p, q) => Number(p.done) - Number(q.done) || (p.due_date || "9999").localeCompare(q.due_date || "9999"));
      setRows(list);
    })();
  }, [user]);

  const visible = showCompleted ? rows : rows.filter((r) => !r.done);
  if (visible.length === 0) return null;

  return (
    <div className="card-premium p-4 md:p-6">
      <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-primary" /> Assigned to you
      </h2>
      <ul className="space-y-2">
        {visible.map((r) => {
          const overdue = !r.done && r.due_date && r.due_date < todayStr();
          return (
            <li key={r.id}>
              <button
                onClick={() => navigate(`/learn/dealership/${r.module_id}`)}
                className="w-full min-h-[48px] flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-foreground truncate">{r.title}</span>
                  {r.due_date && <span className="text-xs text-muted-foreground">Due {fmt(r.due_date)}</span>}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <Badge variant={r.done ? "default" : overdue ? "destructive" : "outline"}>
                    {r.done ? "Done" : overdue ? "Overdue" : "To do"}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
