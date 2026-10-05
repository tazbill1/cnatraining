import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const nameSchema = z.object({
  first: z.string().trim().min(1, "First name is required").max(60),
  last: z.string().trim().min(1, "Last name is required").max(60),
});

/** True when the stored name is missing a first or last part. */
export function needsFullName(fullName: string | null | undefined) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return parts.length < 2;
}

/** Blocking one-time prompt for signed-in users without a first + last name. */
export function NameRequiredDialog() {
  const { user, profile, refreshProfile } = useAuth();
  const existing = (profile?.full_name || "").trim().split(/\s+/).filter(Boolean);
  const [first, setFirst] = useState(existing[0] || "");
  const [last, setLast] = useState(existing.slice(1).join(" "));
  const [saving, setSaving] = useState(false);

  if (!user || !profile || !needsFullName(profile.full_name)) return null;

  const save = async () => {
    const parsed = nameSchema.safeParse({ first, last });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const fullName = `${parsed.data.first} ${parsed.data.last}`.replace(/\s+/g, " ");
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save your name. Please try again.");
      return;
    }
    await refreshProfile();
    toast.success("Thanks! Your name is saved.");
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>What's your name?</DialogTitle>
          <DialogDescription>
            Your first and last name show on leaderboards, certificates and team reports.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="req-first">First name</Label>
            <Input id="req-first" value={first} maxLength={60} onChange={(e) => setFirst(e.target.value)} className="h-12" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-last">Last name</Label>
            <Input id="req-last" value={last} maxLength={60} onChange={(e) => setLast(e.target.value)} className="h-12"
              onKeyDown={(e) => e.key === "Enter" && save()} />
          </div>
        </div>
        <Button className="h-12 w-full" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save and continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
