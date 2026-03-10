import { useEffect, useState } from "react";
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
import { ArrowLeft, Users, Activity, Mail, Loader2, Save, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { trainingModules } from "@/lib/modules";
import { useDealershipSettingsForId, DealershipSettings } from "@/hooks/useDealershipSettings";
import { toast } from "@/hooks/use-toast";

interface DealershipDetailProps {
  dealershipId: string;
  dealershipName: string;
  onBack: () => void;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  last_active_at: string | null;
  created_at: string;
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

  useEffect(() => {
    const fetchAll = async () => {
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
    };
    fetchAll();
  }, [dealershipId]);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Config</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <OverviewTab users={users} sessions={sessions} invitations={invitations} />
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
function OverviewTab({ users, sessions, invitations }: { users: ProfileRow[]; sessions: SessionRow[]; invitations: InvitationRow[] }) {
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
        <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
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
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No users yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
