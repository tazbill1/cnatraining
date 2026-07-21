import { useEffect, useState } from "react";
import { Bug, Loader2, Camera, X } from "lucide-react";

export const BUG_REPORT_EVENT = "open-bug-report";
export const openBugReport = () => window.dispatchEvent(new Event(BUG_REPORT_EVENT));
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getRecentActions } from "@/lib/actionLog";

function collectDeviceInfo() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string } };
  return {
    platform: nav.platform,
    language: nav.language,
    cookieEnabled: nav.cookieEnabled,
    deviceMemory: nav.deviceMemory ?? null,
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    connection: nav.connection?.effectiveType ?? null,
    screen: `${window.screen.width}x${window.screen.height}`,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function BugReportButton() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(BUG_REPORT_EVENT, handler);
    return () => window.removeEventListener(BUG_REPORT_EVENT, handler);
  }, []);

  const reset = () => {
    setDescription("");
    setIncludeScreenshot(true);
  };


  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to report a bug.");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Please describe the issue (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      let screenshotPath: string | null = null;

      if (includeScreenshot) {
        setCapturing(true);
        // Hide the dialog briefly so it isn't in the screenshot
        setOpen(false);
        await new Promise((r) => setTimeout(r, 250));
        try {
          const canvas = await html2canvas(document.body, {
            logging: false,
            useCORS: true,
            scale: Math.min(1, window.devicePixelRatio),
          });
          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.7),
          );
          if (blob) {
            const path = `${user.id}/${Date.now()}.jpg`;
            const { error: upErr } = await supabase.storage
              .from("bug-screenshots")
              .upload(path, blob, { contentType: "image/jpeg" });
            if (!upErr) screenshotPath = path;
          }
        } catch (err) {
          console.warn("Screenshot capture failed", err);
        } finally {
          setCapturing(false);
          setOpen(true);
        }
      }

      const { error } = await supabase.from("bug_reports").insert({
        user_id: user.id,
        user_email: user.email ?? null,
        dealership_id: profile?.dealership_id ?? null,
        description: description.trim(),
        url: window.location.href,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        device_info: collectDeviceInfo(),
        recent_actions: getRecentActions(),
        screenshot_path: screenshotPath,
      });
      if (error) throw error;

      toast.success("Bug report submitted. Thank you!");
      reset();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit bug report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>


      <Dialog open={open} onOpenChange={(v) => !submitting && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" /> Report a bug
            </DialogTitle>
            <DialogDescription>
              Tell us what went wrong. We'll attach your recent actions and device info to help debug.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bug-description">What happened?</Label>
              <Textarea
                id="bug-description"
                placeholder="Describe the issue, what you expected, and steps to reproduce..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={2000}
                disabled={submitting}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length} / 2000
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={includeScreenshot}
                onCheckedChange={(v) => setIncludeScreenshot(v === true)}
                disabled={submitting}
              />
              <Camera className="h-4 w-4" />
              Attach a screenshot of the current page
            </label>

            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
              <div><strong>Page:</strong> {window.location.pathname}</div>
              <div><strong>Viewport:</strong> {window.innerWidth}×{window.innerHeight}</div>
              <div><strong>Recent actions captured:</strong> {getRecentActions().length}</div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {capturing ? "Capturing..." : "Submitting..."}
                </>
              ) : (
                "Submit report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
