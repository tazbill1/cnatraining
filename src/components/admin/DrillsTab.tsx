import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gamepad2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { drillRegistry, type DrillConfigRow } from "@/lib/drills";
import { channelCategories } from "@/lib/categories";

interface DrillsTabProps {
  dealershipId: string;
}

interface RowState {
  is_enabled: boolean;
  title_override: string;
  description_override: string;
  sort_order: number;
}

export function DrillsTab({ dealershipId }: DrillsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Record<string, RowState>>({});

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("dealership_drills")
        .select("drill_key, is_enabled, title_override, description_override, sort_order")
        .eq("dealership_id", dealershipId);

      const config = (data || []) as DrillConfigRow[];
      const byKey = new Map(config.map((c) => [c.drill_key, c]));
      const next: Record<string, RowState> = {};
      drillRegistry.forEach((d, i) => {
        const c = byKey.get(d.id);
        next[d.id] = {
          is_enabled: c ? c.is_enabled : true,
          title_override: c?.title_override || "",
          description_override: c?.description_override || "",
          sort_order: c?.sort_order ?? i,
        };
      });
      setRows(next);
      setLoading(false);
    };
    run();
  }, [dealershipId]);

  const setField = <K extends keyof RowState>(key: string, field: K, value: RowState[K]) => {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = drillRegistry.map((d) => ({
      dealership_id: dealershipId,
      drill_key: d.id,
      is_enabled: rows[d.id]?.is_enabled ?? true,
      title_override: rows[d.id]?.title_override.trim() || null,
      description_override: rows[d.id]?.description_override.trim() || null,
      sort_order: rows[d.id]?.sort_order ?? 0,
    }));

    const { error } = await supabase
      .from("dealership_drills")
      .upsert(payload, { onConflict: "dealership_id,drill_key" });

    setSaving(false);
    if (error) {
      toast.error("Error saving game settings");
    } else {
      toast.success("Game settings saved");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledCount = drillRegistry.filter((d) => rows[d.id]?.is_enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Practice Games
          </h3>
          <p className="text-sm text-muted-foreground">
            {enabledCount} of {drillRegistry.length} games enabled for this dealership.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Save changes
        </Button>
      </div>

      <div className="space-y-3">
        {drillRegistry.map((d) => {
          const row = rows[d.id];
          const Icon = d.icon;
          const channel = channelCategories.find((c) => c.id === d.channel);
          if (!row) return null;
          return (
            <Card key={d.id} className={row.is_enabled ? "" : "opacity-60"}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                        {row.title_override.trim() || d.title}
                        {channel && <Badge variant="outline" className="text-xs">{channel.shortName}</Badge>}
                        {d.requiresProductGame && <Badge variant="secondary" className="text-xs">Product data</Badge>}
                        {d.requiresModules && <Badge variant="secondary" className="text-xs">Needs modules</Badge>}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {row.description_override.trim() || d.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={row.is_enabled}
                    onCheckedChange={(v) => setField(d.id, "is_enabled", v)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 grid grid-cols-1 md:grid-cols-[1fr_1fr_90px] gap-3">
                <div>
                  <Label className="text-xs">Title override</Label>
                  <Input
                    value={row.title_override}
                    placeholder={d.title}
                    onChange={(e) => setField(d.id, "title_override", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Description override</Label>
                  <Input
                    value={row.description_override}
                    placeholder={d.description}
                    onChange={(e) => setField(d.id, "description_override", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Order</Label>
                  <Input
                    type="number"
                    value={row.sort_order}
                    onChange={(e) => setField(d.id, "sort_order", Number(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
