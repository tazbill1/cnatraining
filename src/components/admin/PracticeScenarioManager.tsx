import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DecisionOption {
  id: string;
  text: string;
  quality: "good" | "better" | "best";
  feedback: string;
  points: number;
}

interface DecisionPoint {
  id: string;
  prompt: string;
  context?: string;
  options: DecisionOption[];
}

interface PracticeScenario {
  id: string;
  module_id: string;
  difficulty: string;
  title: string;
  customer_setup: string;
  customer_quote: string;
  decision_points: DecisionPoint[];
  sort_order: number;
  is_active: boolean;
}

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner", color: "text-green-600" },
  { value: "intermediate", label: "Intermediate", color: "text-amber-600" },
  { value: "advanced", label: "Advanced", color: "text-red-600" },
];

const QUALITY_OPTIONS: { value: DecisionOption["quality"]; label: string }[] = [
  { value: "good", label: "Good (1pt)" },
  { value: "better", label: "Better (2pts)" },
  { value: "best", label: "Best (3pts)" },
];

const POINTS_MAP = { good: 1, better: 2, best: 3 };

function newOption(id: string): DecisionOption {
  return { id, text: "", quality: "good", feedback: "", points: 1 };
}

function newDecisionPoint(id: string): DecisionPoint {
  return { id, prompt: "", context: "", options: [newOption("a"), newOption("b"), newOption("c")] };
}

interface PracticeScenarioManagerProps {
  moduleId: string;
}

export function PracticeScenarioManager({ moduleId }: PracticeScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<PracticeScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PracticeScenario | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formDifficulty, setFormDifficulty] = useState("intermediate");
  const [formTitle, setFormTitle] = useState("");
  const [formSetup, setFormSetup] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formDecisionPoints, setFormDecisionPoints] = useState<DecisionPoint[]>([newDecisionPoint("dp1")]);

  const fetchScenarios = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("dealership_practice_scenarios" as any)
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order");
    setScenarios((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchScenarios();
  }, [moduleId]);

  const usedDifficulties = scenarios.filter(s => !editing || s.id !== editing.id).map(s => s.difficulty);

  const openNew = () => {
    setEditing(null);
    const available = DIFFICULTY_OPTIONS.find(d => !usedDifficulties.includes(d.value));
    setFormDifficulty(available?.value || "intermediate");
    setFormTitle("");
    setFormSetup("");
    setFormQuote("");
    setFormDecisionPoints([newDecisionPoint("dp1")]);
    setDialogOpen(true);
  };

  const openEdit = (s: PracticeScenario) => {
    setEditing(s);
    setFormDifficulty(s.difficulty);
    setFormTitle(s.title);
    setFormSetup(s.customer_setup);
    setFormQuote(s.customer_quote);
    setFormDecisionPoints(
      (s.decision_points || []).length > 0
        ? s.decision_points
        : [newDecisionPoint("dp1")]
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formSetup.trim() || !formQuote.trim()) {
      toast({ title: "Title, setup, and quote are required", variant: "destructive" });
      return;
    }
    // Validate decision points
    for (const dp of formDecisionPoints) {
      if (!dp.prompt.trim()) {
        toast({ title: "Each decision point needs a prompt", variant: "destructive" });
        return;
      }
      const filledOptions = dp.options.filter(o => o.text.trim());
      if (filledOptions.length < 2) {
        toast({ title: "Each decision needs at least 2 options", variant: "destructive" });
        return;
      }
    }

    setSaving(true);
    const cleanedDPs = formDecisionPoints.map(dp => ({
      ...dp,
      options: dp.options.filter(o => o.text.trim()).map(o => ({ ...o, points: POINTS_MAP[o.quality] })),
    }));

    const payload = {
      module_id: moduleId,
      difficulty: formDifficulty,
      title: formTitle.trim(),
      customer_setup: formSetup.trim(),
      customer_quote: formQuote.trim(),
      decision_points: cleanedDPs,
      sort_order: editing ? editing.sort_order : scenarios.length,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("dealership_practice_scenarios" as any).update(payload as any).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("dealership_practice_scenarios" as any).insert(payload as any));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Error saving practice scenario", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Practice scenario updated" : "Practice scenario added" });
      setDialogOpen(false);
      fetchScenarios();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this practice scenario?")) return;
    const { error } = await supabase.from("dealership_practice_scenarios" as any).delete().eq("id", id);
    if (!error) fetchScenarios();
  };

  // Decision point helpers
  const addDecisionPoint = () => {
    setFormDecisionPoints(prev => [...prev, newDecisionPoint(`dp${prev.length + 1}`)]);
  };

  const removeDecisionPoint = (idx: number) => {
    setFormDecisionPoints(prev => prev.filter((_, i) => i !== idx));
  };

  const updateDP = (idx: number, field: string, value: string) => {
    setFormDecisionPoints(prev => prev.map((dp, i) => i === idx ? { ...dp, [field]: value } : dp));
  };

  const updateOption = (dpIdx: number, optIdx: number, field: string, value: string) => {
    setFormDecisionPoints(prev => prev.map((dp, i) => {
      if (i !== dpIdx) return dp;
      return {
        ...dp,
        options: dp.options.map((o, oi) =>
          oi === optIdx ? { ...o, [field]: value, ...(field === "quality" ? { points: POINTS_MAP[value as keyof typeof POINTS_MAP] } : {}) } : o
        ),
      };
    }));
  };

  if (loading) return null;

  const canAdd = scenarios.length < 3;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> Practice Scenarios
        </h4>
        {canAdd && (
          <Button size="sm" variant="outline" onClick={openNew}>
            <Plus className="w-3 h-3 mr-1" /> Add Practice
          </Button>
        )}
      </div>

      {scenarios.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No practice scenarios yet — add up to 3 (one per difficulty)</p>
      ) : (
        <div className="space-y-1">
          {scenarios.map(s => (
            <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded bg-background border text-sm">
              <Badge variant="outline" className="text-xs capitalize">{s.difficulty}</Badge>
              <span className="flex-1 truncate">{s.title}</span>
              <Badge variant="secondary" className="text-xs">
                {(s.decision_points || []).length} decisions
              </Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(s)}>
                <Pencil className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(s.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Practice Scenario" : "Add Practice Scenario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty *</Label>
                <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map(d => (
                      <SelectItem
                        key={d.value}
                        value={d.value}
                        disabled={usedDifficulties.includes(d.value)}
                      >
                        {d.label} {usedDifficulties.includes(d.value) ? "(used)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scenario Title *</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. The Online Price Comparison" />
              </div>
            </div>

            <div>
              <Label>Customer Setup *</Label>
              <Textarea
                value={formSetup}
                onChange={e => setFormSetup(e.target.value)}
                rows={2}
                placeholder="Describe the situation the salesperson is in..."
              />
            </div>

            <div>
              <Label>Customer Quote *</Label>
              <Textarea
                value={formQuote}
                onChange={e => setFormQuote(e.target.value)}
                rows={2}
                placeholder="What the customer says to kick off the scenario..."
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Decision Points</Label>
                <Button size="sm" variant="outline" onClick={addDecisionPoint}>
                  <Plus className="w-3 h-3 mr-1" /> Add Decision
                </Button>
              </div>

              <div className="space-y-6">
                {formDecisionPoints.map((dp, dpIdx) => (
                  <div key={dp.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Decision {dpIdx + 1}</span>
                      {formDecisionPoints.length > 1 && (
                        <Button size="sm" variant="ghost" className="h-6 text-destructive" onClick={() => removeDecisionPoint(dpIdx)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs">Prompt *</Label>
                      <Input
                        value={dp.prompt}
                        onChange={e => updateDP(dpIdx, "prompt", e.target.value)}
                        placeholder="How do you respond?"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Context (optional)</Label>
                      <Input
                        value={dp.context || ""}
                        onChange={e => updateDP(dpIdx, "context", e.target.value)}
                        placeholder="Additional context for this decision..."
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Options (set quality rating for each)</Label>
                      <div className="space-y-2 mt-1">
                        {dp.options.map((opt, optIdx) => (
                          <div key={opt.id} className="border rounded p-2 space-y-1.5 bg-background">
                            <div className="flex gap-2 items-center">
                              <Select
                                value={opt.quality}
                                onValueChange={v => updateOption(dpIdx, optIdx, "quality", v)}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {QUALITY_OPTIONS.map(q => (
                                    <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                value={opt.text}
                                onChange={e => updateOption(dpIdx, optIdx, "text", e.target.value)}
                                placeholder={`Option ${optIdx + 1} response text`}
                                className="flex-1 h-8 text-xs"
                              />
                            </div>
                            <Input
                              value={opt.feedback}
                              onChange={e => updateOption(dpIdx, optIdx, "feedback", e.target.value)}
                              placeholder="Feedback shown after selection..."
                              className="h-8 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editing ? "Save Changes" : "Add Practice Scenario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
