import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Loader2, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface Member { user_id: string; full_name: string; email?: string }
interface Course { id: string; title: string; category: string }
interface Assignment {
  id: string; user_id: string; module_id: string; due_date: string | null;
  team_assignment_id: string | null; created_at: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
export const formatDue = (d: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

export function CourseAssignmentsPanel({ dealershipId, members }: { dealershipId: string | null; members: Member[] }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teamCourseIds, setTeamCourseIds] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [scope, setScope] = useState<"team" | "individual">("team");
  const [picked, setPicked] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  const load = useCallback(async () => {
    if (!dealershipId) { setLoading(false); return; }
    setLoading(true);
    const ids = members.map((m) => m.user_id);
    const [c, a, t, mc] = await Promise.all([
      supabase.from("dealership_modules").select("id, title, category").eq("dealership_id", dealershipId).eq("is_active", true).order("category").order("sort_order"),
      supabase.from("course_assignments").select("id, user_id, module_id, due_date, team_assignment_id, created_at").eq("dealership_id", dealershipId),
      supabase.from("course_team_assignments").select("module_id").eq("dealership_id", dealershipId),
      ids.length ? supabase.from("module_completions").select("user_id, module_id").in("user_id", ids) : Promise.resolve({ data: [] as { user_id: string; module_id: string }[] }),
    ]);
    setCourses(c.data || []);
    setAssignments(a.data || []);
    setTeamCourseIds(new Set((t.data || []).map((r) => r.module_id)));
    setCompleted(new Set((mc.data || []).map((r) => `${r.user_id}:${r.module_id}`)));
    setLoading(false);
  }, [dealershipId, members]);

  useEffect(() => { load(); }, [load]);

  const nameOf = (uid: string) => members.find((m) => m.user_id === uid)?.full_name || "Former team member";
  const isDone = (a: Assignment) => completed.has(`${a.user_id}:dealership-${a.module_id}`);

  const grouped = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    for (const a of assignments) map.set(a.module_id, [...(map.get(a.module_id) || []), a]);
    return [...map.entries()].map(([moduleId, rows]) => ({
      moduleId,
      title: courses.find((c) => c.id === moduleId)?.title || "Course",
      rows,
      done: rows.filter(isDone).length,
      overdue: rows.filter((r) => !isDone(r) && r.due_date && r.due_date < todayStr()).length,
      isTeam: teamCourseIds.has(moduleId),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, courses, completed, teamCourseIds]);

  const submit = async () => {
    if (!dealershipId || !courseId) return;
    if (scope === "individual" && picked.length === 0) { toast.error("Pick at least one person"); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("assign-course", {
      body: { action: "assign", dealershipId, moduleId: courseId, scope, userIds: scope === "individual" ? picked : undefined, dueDate: dueDate || null },
    });
    setBusy(false);
    if (error || data?.error) { toast.error(typeof data?.error === "string" ? data.error : "Couldn't assign the course"); return; }
    const n = data?.assigned ?? 0;
    toast.success(n > 0 ? `Assigned to ${n} ${n === 1 ? "person" : "people"} — emails on the way` : "Assignment updated");
    setOpen(false); setCourseId(""); setPicked([]); setDueDate(""); setScope("team");
    load();
  };

  const unassign = async (moduleId: string, userId?: string) => {
    if (!dealershipId) return;
    const msg = userId ? `Remove this course from ${nameOf(userId)}?` : "Remove this course from everyone it was assigned to?";
    if (!window.confirm(msg)) return;
    const { data, error } = await supabase.functions.invoke("assign-course", { body: { action: "unassign", dealershipId, moduleId, userId } });
    if (error || data?.error) { toast.error("Couldn't remove the assignment"); return; }
    toast.success("Assignment removed");
    load();
  };

  if (!dealershipId) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">Pick a dealership in the top bar to assign courses.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Assigned courses</CardTitle>
        <Button size="sm" className="min-h-[44px]" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Assign a course</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No courses assigned yet. Assign one to the whole team or to specific people — they'll get an email.</p>
        ) : grouped.map((g) => (
          <div key={g.moduleId} className="rounded-lg border p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{g.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {g.isTeam && <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Whole team</Badge>}
                  <Badge variant="outline">{g.done}/{g.rows.length} done</Badge>
                  {g.overdue > 0 && <Badge variant="destructive">{g.overdue} overdue</Badge>}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => unassign(g.moduleId)}>
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
            <ul className="divide-y">
              {g.rows.map((r) => {
                const done = isDone(r);
                const overdue = !done && r.due_date && r.due_date < todayStr();
                return (
                  <li key={r.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="truncate">{nameOf(r.user_id)}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {r.due_date && <span className="text-muted-foreground">Due {formatDue(r.due_date)}</span>}
                      <Badge variant={done ? "default" : overdue ? "destructive" : "outline"}>{done ? "Done" : overdue ? "Overdue" : "Not done"}</Badge>
                      {!g.isTeam && (
                        <button aria-label={`Remove from ${nameOf(r.user_id)}`} className="p-2 text-muted-foreground hover:text-destructive" onClick={() => unassign(g.moduleId, r.user_id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign a course</DialogTitle>
            <DialogDescription>Everyone you assign gets an email with a link to the course, plus a reminder 2 days before the due date if they haven't finished.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="min-h-[44px]"><SelectValue placeholder="Choose a course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Who</Label>
              <RadioGroup value={scope} onValueChange={(v) => setScope(v as "team" | "individual")} className="space-y-1">
                <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                  <RadioGroupItem value="team" className="mt-0.5" />
                  <span><span className="font-medium">Whole team</span><span className="block text-xs text-muted-foreground">Everyone now ({members.length}), and new people automatically when they join.</span></span>
                </label>
                <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                  <RadioGroupItem value="individual" className="mt-0.5" />
                  <span className="font-medium">Specific people</span>
                </label>
              </RadioGroup>
              {scope === "individual" && (
                <div className="max-h-56 overflow-y-auto rounded-md border divide-y">
                  {members.map((m) => (
                    <label key={m.user_id} className="flex items-center gap-3 p-3 cursor-pointer text-sm">
                      <Checkbox
                        checked={picked.includes(m.user_id)}
                        onCheckedChange={(v) => setPicked((p) => v ? [...p, m.user_id] : p.filter((x) => x !== m.user_id))}
                      />
                      <span className="truncate">{m.full_name && m.full_name !== "Unknown" ? m.full_name : m.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date (optional)</Label>
              <Input id="due" type="date" min={todayStr()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="min-h-[44px]" />
              {scope === "team" && dueDate && <p className="text-xs text-muted-foreground">New people who join later get the same number of days from their start.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={busy || !courseId}>{busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Assign & email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
