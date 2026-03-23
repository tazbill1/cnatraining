import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Pencil, Trash2, GripVertical, Upload, BookOpen, Video, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { PracticeScenarioManager } from "./PracticeScenarioManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trainingModules } from "@/lib/modules";

interface DealershipModule {
  id: string;
  dealership_id: string;
  base_module_id: string | null;
  title: string;
  description: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
  estimated_time: string | null;
  video_url: string | null;
  video_title: string | null;
}

interface ModuleSection {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content_html: string | null;
  video_url: string | null;
  sort_order: number;
}

interface QuizQuestion {
  id: string;
  module_id: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string | null;
  sort_order: number;
}

const ICON_OPTIONS = [
  { value: "BookOpen", label: "Book" },
  { value: "Users", label: "Users" },
  { value: "Handshake", label: "Handshake" },
  { value: "Car", label: "Car" },
  { value: "MessageSquare", label: "Chat" },
  { value: "Phone", label: "Phone" },
  { value: "FileText", label: "Document" },
  { value: "PlayCircle", label: "Video" },
  { value: "Award", label: "Award" },
  { value: "Target", label: "Target" },
];

interface ContentTabProps {
  dealershipId: string;
}

export function ContentTab({ dealershipId }: ContentTabProps) {
  const [modules, setModules] = useState<DealershipModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<DealershipModule | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, ModuleSection[]>>({});
  const [quizzes, setQuizzes] = useState<Record<string, QuizQuestion[]>>({});
  const [saving, setSaving] = useState(false);

  // Module form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("BookOpen");
  const [formBaseModuleId, setFormBaseModuleId] = useState<string>("none");
  const [formEstimatedTime, setFormEstimatedTime] = useState("15-20 min");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formVideoTitle, setFormVideoTitle] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchModules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("dealership_modules")
      .select("*")
      .eq("dealership_id", dealershipId)
      .order("sort_order");
    setModules((data || []) as DealershipModule[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, [dealershipId]);

  const fetchSections = async (moduleId: string) => {
    const { data } = await supabase
      .from("dealership_module_sections")
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order");
    setSections(prev => ({ ...prev, [moduleId]: (data || []) as ModuleSection[] }));
  };

  const fetchQuizzes = async (moduleId: string) => {
    const { data } = await supabase
      .from("dealership_quiz_questions")
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order");
    setQuizzes(prev => ({ ...prev, [moduleId]: (data || []) as unknown as QuizQuestion[] }));
  };

  const handleExpandModule = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
      if (!sections[moduleId]) fetchSections(moduleId);
      if (!quizzes[moduleId]) fetchQuizzes(moduleId);
    }
  };

  const openNewModule = () => {
    setEditingModule(null);
    setFormTitle("");
    setFormDescription("");
    setFormIcon("BookOpen");
    setFormBaseModuleId("none");
    setFormEstimatedTime("15-20 min");
    setFormVideoUrl("");
    setFormVideoTitle("");
    setFormIsActive(true);
    setModuleDialogOpen(true);
  };

  const openEditModule = (m: DealershipModule) => {
    setEditingModule(m);
    setFormTitle(m.title);
    setFormDescription(m.description || "");
    setFormIcon(m.icon || "BookOpen");
    setFormBaseModuleId(m.base_module_id || "none");
    setFormEstimatedTime(m.estimated_time || "15-20 min");
    setFormVideoUrl(m.video_url || "");
    setFormVideoTitle(m.video_title || "");
    setFormIsActive(m.is_active);
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!formTitle.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      dealership_id: dealershipId,
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      icon: formIcon,
      base_module_id: formBaseModuleId === "none" ? null : formBaseModuleId,
      estimated_time: formEstimatedTime || null,
      video_url: formVideoUrl.trim() || null,
      video_title: formVideoTitle.trim() || null,
      is_active: formIsActive,
      sort_order: editingModule ? editingModule.sort_order : modules.length,
    };

    let error;
    if (editingModule) {
      ({ error } = await supabase.from("dealership_modules").update(payload).eq("id", editingModule.id));
    } else {
      ({ error } = await supabase.from("dealership_modules").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Error saving module", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingModule ? "Module updated" : "Module created" });
      setModuleDialogOpen(false);
      fetchModules();
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its content?")) return;
    const { error } = await supabase.from("dealership_modules").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Module deleted" });
      fetchModules();
    }
  };

  // --- Section management ---
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ModuleSection | null>(null);
  const [sectionModuleId, setSectionModuleId] = useState<string>("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContentType, setSectionContentType] = useState("text");
  const [sectionContentHtml, setSectionContentHtml] = useState("");
  const [sectionVideoUrl, setSectionVideoUrl] = useState("");

  const openNewSection = (moduleId: string) => {
    setSectionModuleId(moduleId);
    setEditingSection(null);
    setSectionTitle("");
    setSectionContentType("text");
    setSectionContentHtml("");
    setSectionVideoUrl("");
    setSectionDialogOpen(true);
  };

  const openEditSection = (s: ModuleSection) => {
    setSectionModuleId(s.module_id);
    setEditingSection(s);
    setSectionTitle(s.title);
    setSectionContentType(s.content_type);
    setSectionContentHtml(s.content_html || "");
    setSectionVideoUrl(s.video_url || "");
    setSectionDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) {
      toast({ title: "Section title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      module_id: sectionModuleId,
      title: sectionTitle.trim(),
      content_type: sectionContentType,
      content_html: sectionContentHtml.trim() || null,
      video_url: sectionVideoUrl.trim() || null,
      sort_order: editingSection ? editingSection.sort_order : (sections[sectionModuleId]?.length || 0),
    };
    let error;
    if (editingSection) {
      ({ error } = await supabase.from("dealership_module_sections").update(payload).eq("id", editingSection.id));
    } else {
      ({ error } = await supabase.from("dealership_module_sections").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Error saving section", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingSection ? "Section updated" : "Section added" });
      setSectionDialogOpen(false);
      fetchSections(sectionModuleId);
    }
  };

  const handleDeleteSection = async (s: ModuleSection) => {
    const { error } = await supabase.from("dealership_module_sections").delete().eq("id", s.id);
    if (!error) fetchSections(s.module_id);
  };

  // --- Quiz management ---
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestion | null>(null);
  const [quizModuleId, setQuizModuleId] = useState<string>("");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizOptions, setQuizOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const openNewQuiz = (moduleId: string) => {
    setQuizModuleId(moduleId);
    setEditingQuiz(null);
    setQuizQuestion("");
    setQuizExplanation("");
    setQuizOptions([
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setQuizDialogOpen(true);
  };

  const openEditQuiz = (q: QuizQuestion) => {
    setQuizModuleId(q.module_id);
    setEditingQuiz(q);
    setQuizQuestion(q.question);
    setQuizExplanation(q.explanation || "");
    setQuizOptions(q.options.length > 0 ? q.options : [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizQuestion.trim() || quizOptions.filter(o => o.text.trim()).length < 2) {
      toast({ title: "Question and at least 2 options required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const filteredOptions = quizOptions.filter(o => o.text.trim());
    const payload = {
      module_id: quizModuleId,
      question: quizQuestion.trim(),
      options: filteredOptions,
      explanation: quizExplanation.trim() || null,
      sort_order: editingQuiz ? editingQuiz.sort_order : (quizzes[quizModuleId]?.length || 0),
    };
    let error;
    if (editingQuiz) {
      ({ error } = await supabase.from("dealership_quiz_questions").update(payload).eq("id", editingQuiz.id));
    } else {
      ({ error } = await supabase.from("dealership_quiz_questions").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Error saving question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingQuiz ? "Question updated" : "Question added" });
      setQuizDialogOpen(false);
      fetchQuizzes(quizModuleId);
    }
  };

  const handleDeleteQuiz = async (q: QuizQuestion) => {
    const { error } = await supabase.from("dealership_quiz_questions").delete().eq("id", q.id);
    if (!error) fetchQuizzes(q.module_id);
  };

  // --- Video upload ---
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = async (file: File, onUrl: (url: string) => void) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${dealershipId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("training-videos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("training-videos").getPublicUrl(path);
    onUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Video uploaded" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Modules</h3>
          <p className="text-sm text-muted-foreground">Create unique training content for this dealership. Override default modules or build entirely new ones.</p>
        </div>
        <Button onClick={openNewModule}>
          <Plus className="w-4 h-4 mr-1" /> Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">No custom modules yet.</p>
            <p className="text-sm text-muted-foreground">Create a new module or override an existing default module with dealership-specific content.</p>
            <Button variant="outline" onClick={openNewModule}>
              <Plus className="w-4 h-4 mr-1" /> Create First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleExpandModule(m.id)}
              >
                {expandedModule === m.id ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{m.title}</span>
                    {!m.is_active && <Badge variant="secondary">Inactive</Badge>}
                    {m.base_module_id && (
                      <Badge variant="outline" className="text-xs">
                        Overrides: {trainingModules.find(tm => tm.id === m.base_module_id)?.title?.split(":")[0] || m.base_module_id}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{m.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModule(m)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteModule(m.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {expandedModule === m.id && (
                <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
                  {/* Sections */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Content Sections</h4>
                      <Button size="sm" variant="outline" onClick={() => openNewSection(m.id)}>
                        <Plus className="w-3 h-3 mr-1" /> Add Section
                      </Button>
                    </div>
                    {(sections[m.id] || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No sections yet</p>
                    ) : (
                      <div className="space-y-1">
                        {(sections[m.id] || []).map((s, i) => (
                          <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded bg-background border text-sm">
                            <span className="text-muted-foreground text-xs w-5">{i + 1}.</span>
                            <Badge variant="outline" className="text-xs capitalize">{s.content_type}</Badge>
                            <span className="flex-1 truncate">{s.title}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditSection(s)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSection(s)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quiz Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Quiz Questions</h4>
                      <Button size="sm" variant="outline" onClick={() => openNewQuiz(m.id)}>
                        <Plus className="w-3 h-3 mr-1" /> Add Question
                      </Button>
                    </div>
                    {(quizzes[m.id] || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No quiz questions yet</p>
                    ) : (
                      <div className="space-y-1">
                        {(quizzes[m.id] || []).map((q, i) => (
                          <div key={q.id} className="flex items-center gap-2 px-3 py-2 rounded bg-background border text-sm">
                            <span className="text-muted-foreground text-xs w-5">Q{i + 1}</span>
                            <span className="flex-1 truncate">{q.question}</span>
                            <Badge variant="secondary" className="text-xs">{q.options.length} options</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditQuiz(q)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteQuiz(q)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Practice Scenarios */}
                  <PracticeScenarioManager moduleId={m.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create Custom Module"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Override Default Module (optional)</Label>
              <Select value={formBaseModuleId} onValueChange={setFormBaseModuleId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — New Module</SelectItem>
                  {trainingModules.map(tm => (
                    <SelectItem key={tm.id} value={tm.id}>{tm.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Select a default module to replace its content for this dealership, or leave blank for a brand new module.</p>
            </div>

            <div>
              <Label>Title *</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Subaru Product Knowledge" />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="What this module covers..." rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Select value={formIcon} onValueChange={setFormIcon}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(i => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Time</Label>
                <Input value={formEstimatedTime} onChange={e => setFormEstimatedTime(e.target.value)} placeholder="15-20 min" />
              </div>
            </div>

            <div>
              <Label>Intro Video URL</Label>
              <div className="flex gap-2">
                <Input value={formVideoUrl} onChange={e => setFormVideoUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                <label className="cursor-pointer">
                  <Button variant="outline" size="icon" disabled={uploading} asChild>
                    <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
                  </Button>
                  <input type="file" accept="video/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file, setFormVideoUrl);
                  }} />
                </label>
              </div>
            </div>

            <div>
              <Label>Video Title</Label>
              <Input value={formVideoTitle} onChange={e => setFormVideoTitle(e.target.value)} placeholder="Introduction to..." />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveModule} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editingModule ? "Save Changes" : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add Content Section"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Title *</Label>
              <Input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="e.g. Understanding the Outback" />
            </div>
            <div>
              <Label>Content Type</Label>
              <Select value={sectionContentType} onValueChange={setSectionContentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="scenario">Interactive Scenario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(sectionContentType === "text" || sectionContentType === "checklist") && (
              <div>
                <Label>Content (HTML or plain text)</Label>
                <Textarea value={sectionContentHtml} onChange={e => setSectionContentHtml(e.target.value)} rows={8} placeholder="Write your training content here..." />
              </div>
            )}
            {sectionContentType === "video" && (
              <div>
                <Label>Video URL</Label>
                <div className="flex gap-2">
                  <Input value={sectionVideoUrl} onChange={e => setSectionVideoUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <label className="cursor-pointer">
                    <Button variant="outline" size="icon" disabled={uploading} asChild>
                      <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
                    </Button>
                    <input type="file" accept="video/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file, setSectionVideoUrl);
                    }} />
                  </label>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSection} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editingSection ? "Save" : "Add Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? "Edit Question" : "Add Quiz Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question *</Label>
              <Textarea value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)} rows={2} placeholder="What is the most important step in..." />
            </div>
            <div>
              <Label>Answer Options</Label>
              <div className="space-y-2">
                {quizOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={opt.isCorrect}
                      onChange={() => setQuizOptions(prev => prev.map((o, idx) => ({ ...o, isCorrect: idx === i })))}
                      className="shrink-0"
                    />
                    <Input
                      value={opt.text}
                      onChange={e => setQuizOptions(prev => prev.map((o, idx) => idx === i ? { ...o, text: e.target.value } : o))}
                      placeholder={`Option ${i + 1}${opt.isCorrect ? " (correct)" : ""}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Select the radio button next to the correct answer.</p>
            </div>
            <div>
              <Label>Explanation (shown after answering)</Label>
              <Textarea value={quizExplanation} onChange={e => setQuizExplanation(e.target.value)} rows={2} placeholder="This is correct because..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveQuiz} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {editingQuiz ? "Save" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
