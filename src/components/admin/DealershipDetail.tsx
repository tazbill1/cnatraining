import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Activity, Mail, Loader2, Save, Settings, Plus, Wand2, UserPlus, X, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { trainingModules } from "@/lib/modules";
import { useDealershipSettingsForId, DealershipSettings } from "@/hooks/useDealershipSettings";
import { toast } from "@/hooks/use-toast";
import { ContentTab } from "./ContentTab";

interface DealershipDetailProps {
  dealershipId: string;
  dealershipName: string;
  onBack: () => void;
}

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  created_at: string;
  role?: string;
}

interface SessionRow {
  id: string;
  scenario_type: string;
  score: number | null;
  status: string | null;
  started_at: string;
  user_id: string;
}

interface InvitationRow {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

const SCENARIO_CATEGORIES = [
  { value: "cna", label: "CNA" },
  { value: "trade-appraisal", label: "Trade Appraisal" },
  { value: "inbound-call", label: "Inbound Call" },
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function DealershipDetail({ dealershipId, dealershipName, onBack }: DealershipDetailProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);

  const { settings, isLoading: settingsLoading, refetch } = useDealershipSettingsForId(dealershipId);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [usersRes, sessionsRes, invitesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, last_active_at, created_at").eq("dealership_id", dealershipId),
      supabase.from("training_sessions").select("id, scenario_type, score, status, started_at, user_id").eq("dealership_id", dealershipId).order("started_at", { ascending: false }).limit(50),
      supabase.from("invitations").select("id, email, status, created_at").eq("dealership_id", dealershipId).order("created_at", { ascending: false }),
    ]);
    setUsers(usersRes.data || []);
    setSessions(sessionsRes.data || []);
    setInvitations(invitesRes.data || []);
    setLoading(false);
  }, [dealershipId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading || settingsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-bold">{dealershipName}</h2>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="training">Training Config</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <OverviewTab users={users} sessions={sessions} invitations={invitations} dealershipId={dealershipId} onRefresh={fetchAll} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentTab dealershipId={dealershipId} />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <SettingsGuard dealershipId={dealershipId} settings={settings} onInitialized={refetch}>
            <TrainingConfigTab dealershipId={dealershipId} settings={settings} onSaved={refetch} />
          </SettingsGuard>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <SettingsGuard dealershipId={dealershipId} settings={settings} onInitialized={refetch}>
            <BrandingTab dealershipId={dealershipId} settings={settings} onSaved={refetch} />
          </SettingsGuard>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <SettingsGuard dealershipId={dealershipId} settings={settings} onInitialized={refetch}>
            <FeaturesTab dealershipId={dealershipId} settings={settings} onSaved={refetch} />
          </SettingsGuard>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <ScenariosTab dealershipId={dealershipId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Settings Guard (initialize if no row exists) ─── */
function SettingsGuard({ dealershipId, settings, onInitialized, children }: { dealershipId: string; settings: DealershipSettings | null; onInitialized: () => void; children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(false);

  // Settings row exists if it has a real id
  if (settings && settings.id) return <>{children}</>;

  const handleInit = async () => {
    setInitializing(true);
    const { error } = await supabase
      .from("dealership_settings" as any)
      .insert({ dealership_id: dealershipId });
    setInitializing(false);
    if (error) {
      toast({ title: "Failed to initialize settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings initialized with defaults" });
      onInitialized();
    }
  };

  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <Settings className="w-12 h-12 text-muted-foreground/40 mx-auto" />
        <p className="text-muted-foreground">No settings have been configured for this dealership yet.</p>
        <Button onClick={handleInit} disabled={initializing}>
          {initializing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
          Initialize Settings
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Overview Tab (existing content) ─── */
function OverviewTab({ users, sessions, invitations, dealershipId, onRefresh }: { users: ProfileRow[]; sessions: SessionRow[]; invitations: InvitationRow[]; dealershipId: string; onRefresh: () => void }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [unassignedUsers, setUnassignedUsers] = useState<ProfileRow[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchUnassigned = async () => {
    setLoadingUnassigned(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, last_active_at, created_at")
      .is("dealership_id", null);
    setUnassignedUsers(data || []);
    setLoadingUnassigned(false);
  };

  const handleOpenAssign = () => {
    setAssignOpen(true);
    fetchUnassigned();
  };

  const handleAssign = async (profileId: string) => {
    setAssigning(profileId);
    const { error } = await supabase
      .from("profiles")
      .update({ dealership_id: dealershipId } as any)
      .eq("id", profileId);
    setAssigning(null);
    if (error) {
      toast({ title: "Failed to assign user", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User assigned to dealership" });
      setUnassignedUsers(prev => prev.filter(u => u.id !== profileId));
      onRefresh();
    }
  };

  const handleRemove = async (profileId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ dealership_id: null } as any)
      .eq("id", profileId);
    if (error) {
      toast({ title: "Failed to remove user", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User removed from dealership" });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{sessions.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{invitations.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Team Members</CardTitle>
          <Button size="sm" onClick={handleOpenAssign}>
            <UserPlus className="w-4 h-4 mr-1" /> Assign User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.last_active_at ? formatDistanceToNow(new Date(u.last_active_at), { addSuffix: true }) : "Never"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(u.id)} title="Remove from dealership">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No users yet — click "Assign User" to add existing users</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign User Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign User to Dealership</DialogTitle>
          </DialogHeader>
          {loadingUnassigned ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : unassignedUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">All users are already assigned to a dealership.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-1">
              {unassignedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent">
                  <div>
                    <p className="text-sm font-medium">{u.full_name || u.email}</p>
                    {u.full_name && <p className="text-xs text-muted-foreground">{u.email}</p>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleAssign(u.id)} disabled={assigning === u.id}>
                    {assigning === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Assign"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 20).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium capitalize">{s.scenario_type.replace(/-/g, " ")}</TableCell>
                  <TableCell>{s.score != null ? `${s.score}%` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "completed" ? "default" : "secondary"}>
                      {s.status || "in_progress"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No sessions yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Invitations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "accepted" ? "default" : "secondary"}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No invitations yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Training Config Tab ─── */
function TrainingConfigTab({ dealershipId, settings, onSaved }: { dealershipId: string; settings: DealershipSettings | null; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>(settings?.enabled_module_ids ?? trainingModules.map(m => m.id));
  const [requiredModules, setRequiredModules] = useState<string[]>(settings?.required_module_ids ?? []);
  const [enabledCategories, setEnabledCategories] = useState<string[]>(settings?.enabled_scenario_categories ?? SCENARIO_CATEGORIES.map(c => c.value));
  const [enabledDifficulties, setEnabledDifficulties] = useState<string[]>(settings?.enabled_difficulty_levels ?? DIFFICULTY_LEVELS.map(d => d.value));
  const [deadlineDays, setDeadlineDays] = useState<string>(settings?.completion_deadline_days?.toString() ?? "");
  const [customBaseStatement, setCustomBaseStatement] = useState(settings?.custom_base_statement ?? "");

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      enabled_module_ids: enabledModules,
      required_module_ids: requiredModules.filter(id => enabledModules.includes(id)),
      enabled_scenario_categories: enabledCategories,
      enabled_difficulty_levels: enabledDifficulties,
      completion_deadline_days: deadlineDays ? parseInt(deadlineDays) : null,
      custom_base_statement: customBaseStatement || null,
    };
    const { error } = await supabase.from("dealership_settings" as any).update(payload).eq("dealership_id", dealershipId);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Training settings saved" });
      onSaved();
    }
  };

  return (
    <div className="space-y-6">
      {/* Enabled Modules */}
      <Card>
        <CardHeader><CardTitle className="text-base">Enabled Modules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {trainingModules.map(m => (
            <div key={m.id} className="flex items-center space-x-3">
              <Checkbox
                id={`mod-${m.id}`}
                checked={enabledModules.includes(m.id)}
                onCheckedChange={() => setEnabledModules(prev => toggleInArray(prev, m.id))}
              />
              <Label htmlFor={`mod-${m.id}`} className="text-sm cursor-pointer">{m.title}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Required Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required Modules</CardTitle>
          <p className="text-sm text-muted-foreground">Subset of enabled modules that must be completed.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {trainingModules.filter(m => enabledModules.includes(m.id)).map(m => (
            <div key={m.id} className="flex items-center space-x-3">
              <Checkbox
                id={`req-${m.id}`}
                checked={requiredModules.includes(m.id)}
                onCheckedChange={() => setRequiredModules(prev => toggleInArray(prev, m.id))}
              />
              <Label htmlFor={`req-${m.id}`} className="text-sm cursor-pointer">{m.title}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scenario Categories */}
      <Card>
        <CardHeader><CardTitle className="text-base">Scenario Categories</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {SCENARIO_CATEGORIES.map(c => (
            <div key={c.value} className="flex items-center space-x-3">
              <Checkbox
                id={`cat-${c.value}`}
                checked={enabledCategories.includes(c.value)}
                onCheckedChange={() => setEnabledCategories(prev => toggleInArray(prev, c.value))}
              />
              <Label htmlFor={`cat-${c.value}`} className="text-sm cursor-pointer">{c.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card>
        <CardHeader><CardTitle className="text-base">Difficulty Levels</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {DIFFICULTY_LEVELS.map(d => (
            <div key={d.value} className="flex items-center space-x-3">
              <Checkbox
                id={`diff-${d.value}`}
                checked={enabledDifficulties.includes(d.value)}
                onCheckedChange={() => setEnabledDifficulties(prev => toggleInArray(prev, d.value))}
              />
              <Label htmlFor={`diff-${d.value}`} className="text-sm cursor-pointer">{d.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deadline & Custom Base Statement */}
      <Card>
        <CardHeader><CardTitle className="text-base">Additional Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deadline">Completion Deadline (days)</Label>
            <Input
              id="deadline"
              type="number"
              min={1}
              value={deadlineDays}
              onChange={e => setDeadlineDays(e.target.value)}
              placeholder="Optional — leave blank for no deadline"
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-statement">Custom Base Statement Script</Label>
            <Textarea
              id="base-statement"
              value={customBaseStatement}
              onChange={e => setCustomBaseStatement(e.target.value)}
              placeholder="Leave blank to use the default base statement script."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Save Training Config
      </Button>
    </div>
  );
}

/* ─── Branding Tab ─── */
function BrandingTab({ dealershipId, settings, onSaved }: { dealershipId: string; settings: DealershipSettings | null; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url ?? "");
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color ?? "#2563eb");
  const [tagline, setTagline] = useState(settings?.dealership_tagline ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(settings?.custom_welcome_message ?? "");

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      logo_url: logoUrl || null,
      primary_color: primaryColor,
      dealership_tagline: tagline,
      custom_welcome_message: welcomeMessage || null,
    };
    const { error } = await supabase.from("dealership_settings" as any).update(payload).eq("dealership_id", dealershipId);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving branding", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Branding settings saved" });
      onSaved();
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logo-url">Logo URL</Label>
          <Input id="logo-url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center gap-3">
            <Input id="primary-color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="max-w-xs" />
            <div className="w-10 h-10 rounded-md border border-border shrink-0" style={{ backgroundColor: primaryColor }} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Your dealership tagline" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcome-msg">Custom Welcome Message</Label>
          <Textarea
            id="welcome-msg"
            value={welcomeMessage}
            onChange={e => setWelcomeMessage(e.target.value)}
            placeholder="Shown on the dashboard when users log in."
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Branding
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Features Tab ─── */
function FeaturesTab({ dealershipId, settings, onSaved }: { dealershipId: string; settings: DealershipSettings | null; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(settings?.voice_training_enabled ?? true);
  const [certificatesEnabled, setCertificatesEnabled] = useState(settings?.certificates_enabled ?? true);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(settings?.leaderboard_enabled ?? false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      voice_training_enabled: voiceEnabled,
      certificates_enabled: certificatesEnabled,
      leaderboard_enabled: leaderboardEnabled,
    };
    const { error } = await supabase.from("dealership_settings" as any).update(payload).eq("dealership_id", dealershipId);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving features", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature settings saved" });
      onSaved();
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Feature Toggles</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Voice Training</p>
            <p className="text-sm text-muted-foreground">Enable AI voice practice sessions</p>
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Certificates</p>
            <p className="text-sm text-muted-foreground">Award certificates on module completion</p>
          </div>
          <Switch checked={certificatesEnabled} onCheckedChange={setCertificatesEnabled} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Leaderboard</p>
            <p className="text-sm text-muted-foreground">Show dealership-wide leaderboard</p>
          </div>
          <Switch checked={leaderboardEnabled} onCheckedChange={setLeaderboardEnabled} />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Features
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Scenarios Tab ─── */
const BUYER_TYPES = [
  { value: "general", label: "General" },
  { value: "analyst", label: "Analyst" },
  { value: "negotiator", label: "Negotiator" },
  { value: "emotional", label: "Emotional" },
  { value: "loyal", label: "Loyal" },
  { value: "urgent", label: "Urgent" },
];

interface CustomScenario {
  id: string;
  dealership_id: string;
  name: string;
  description: string | null;
  category: string;
  buyer_type: string;
  difficulty: string;
  customer_name: string;
  personality: string | null;
  system_prompt: string;
  opening_line: string;
  trade_vehicle: string | null;
  trade_value: string | null;
  estimated_time: string | null;
  is_active: boolean;
}

const emptyForm = {
  name: "",
  description: "",
  category: "cna",
  buyer_type: "general",
  difficulty: "intermediate",
  customer_name: "Customer",
  personality: "",
  system_prompt: "",
  opening_line: "",
  trade_vehicle: "",
  trade_value: "",
};

function ScenariosTab({ dealershipId }: { dealershipId: string }) {
  const [scenarios, setScenarios] = useState<CustomScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("custom_scenarios" as any)
      .select("*")
      .eq("dealership_id", dealershipId)
      .order("created_at", { ascending: false });
    setScenarios((data as any as CustomScenario[]) || []);
    setLoading(false);
  }, [dealershipId]);

  useEffect(() => { fetchScenarios(); }, [fetchScenarios]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (s: CustomScenario) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description || "",
      category: s.category,
      buyer_type: s.buyer_type,
      difficulty: s.difficulty,
      customer_name: s.customer_name,
      personality: s.personality || "",
      system_prompt: s.system_prompt,
      opening_line: s.opening_line,
      trade_vehicle: s.trade_vehicle || "",
      trade_value: s.trade_value || "",
    });
    setDialogOpen(true);
  };

  const generatePrompt = () => {
    const lines = [
      `You are playing a car buyer named ${form.customer_name}. ${form.personality}`,
      "",
      `CATEGORY: ${form.category}`,
      `BUYER TYPE: ${form.buyer_type}`,
    ];
    if (form.trade_vehicle) lines.push(`TRADE VEHICLE: ${form.trade_vehicle}`);
    if (form.trade_value) lines.push(`TRADE VALUE: ${form.trade_value}`);
    lines.push(
      "",
      "BEHAVIOR:",
      "- Stay in character as the customer at all times",
      "- Respond naturally based on the salesperson's questions",
      "- Keep responses concise (1-3 sentences typically)",
      "- Show emotional reactions appropriate to your character",
      "",
      `OPENING LINE (say this first): "${form.opening_line}"`
    );
    setForm(prev => ({ ...prev, system_prompt: lines.join("\n") }));
  };

  const handleSave = async () => {
    if (!form.name || !form.system_prompt || !form.opening_line) {
      toast({ title: "Missing required fields", description: "Name, System Prompt, and Opening Line are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category,
      buyer_type: form.buyer_type,
      difficulty: form.difficulty,
      customer_name: form.customer_name,
      personality: form.personality || null,
      system_prompt: form.system_prompt,
      opening_line: form.opening_line,
      trade_vehicle: form.trade_vehicle || null,
      trade_value: form.trade_value || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("custom_scenarios" as any).update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("custom_scenarios" as any).insert({ ...payload, dealership_id: dealershipId }));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Error saving scenario", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Scenario updated" : "Scenario created" });
      setDialogOpen(false);
      fetchScenarios();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("custom_scenarios" as any).update({ is_active: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error toggling scenario", description: error.message, variant: "destructive" });
    } else {
      fetchScenarios();
    }
  };

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Custom Scenarios</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Scenario
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Buyer Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="capitalize">{s.category.replace(/-/g, " ")}</TableCell>
                  <TableCell className="capitalize">{s.buyer_type}</TableCell>
                  <TableCell className="capitalize">{s.difficulty}</TableCell>
                  <TableCell>
                    <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s.id, s.is_active)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
              {scenarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No custom scenarios yet. Click "Add Scenario" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Scenario" : "Add Custom Scenario"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Tough Negotiator Trade-In" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Brief description of the scenario" rows={2} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setField("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCENARIO_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Buyer Type</Label>
                <Select value={form.buyer_type} onValueChange={v => setField("buyer_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUYER_TYPES.map(b => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setField("difficulty", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={form.customer_name} onChange={e => setField("customer_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Trade Vehicle</Label>
                <Input value={form.trade_vehicle} onChange={e => setField("trade_vehicle", e.target.value)} placeholder="Optional — e.g. 2019 Honda Accord" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trade Value</Label>
                <Input value={form.trade_value} onChange={e => setField("trade_value", e.target.value)} placeholder="Optional — e.g. $12,000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Personality</Label>
              <Textarea value={form.personality} onChange={e => setField("personality", e.target.value)} placeholder="Describe the customer's personality and background" rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Opening Line *</Label>
              <Textarea value={form.opening_line} onChange={e => setField("opening_line", e.target.value)} placeholder="What does the customer say first?" rows={2} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>System Prompt *</Label>
                <Button type="button" variant="outline" size="sm" onClick={generatePrompt}>
                  <Wand2 className="w-3 h-3 mr-1" /> Generate Prompt
                </Button>
              </div>
              <Textarea
                value={form.system_prompt}
                onChange={e => setField("system_prompt", e.target.value)}
                placeholder="The full AI system prompt describing customer background, priorities, behavior..."
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingId ? "Save Changes" : "Create Scenario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
