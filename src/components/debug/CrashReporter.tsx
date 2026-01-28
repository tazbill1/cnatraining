import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type CrashKind = "error" | "unhandledrejection";

type CrashReport = {
  kind: CrashKind;
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  timestamp: string;
  userAgent: string;
  path: string;
};

const STORAGE_KEY = "cna:lastCrash";

function safeStringify(value: unknown) {
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function loadLastCrash(): CrashReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CrashReport;
  } catch {
    return null;
  }
}

function persistCrash(report: CrashReport) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
  } catch {
    // ignore
  }
}

export function CrashReporter() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [lastCrash, setLastCrash] = useState<CrashReport | null>(() => loadLastCrash());

  const crashText = useMemo(() => {
    if (!lastCrash) return "";
    return [
      `kind: ${lastCrash.kind}`,
      `time: ${lastCrash.timestamp}`,
      `path: ${lastCrash.path}`,
      `message: ${lastCrash.message}`,
      lastCrash.url ? `url: ${lastCrash.url}` : null,
      lastCrash.line != null ? `line: ${lastCrash.line}` : null,
      lastCrash.column != null ? `column: ${lastCrash.column}` : null,
      lastCrash.stack ? `\nstack:\n${lastCrash.stack}` : null,
      `\nuserAgent: ${lastCrash.userAgent}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [lastCrash]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const report: CrashReport = {
        kind: "error",
        message: event.message || "Unknown error",
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        path: window.location.pathname,
      };

      persistCrash(report);
      setLastCrash(report);

      toast({
        variant: "destructive",
        title: "App error captured",
        description: "Open the crash report to copy details.",
      });
      setOpen(true);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = (event as PromiseRejectionEvent).reason;
      const report: CrashReport = {
        kind: "unhandledrejection",
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === "string"
              ? reason
              : safeStringify(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        path: window.location.pathname,
      };

      persistCrash(report);
      setLastCrash(report);

      toast({
        variant: "destructive",
        title: "Unhandled promise rejection",
        description: "Open the crash report to copy details.",
      });
      setOpen(true);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [toast]);

  if (!lastCrash) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Crash report</AlertDialogTitle>
          <AlertDialogDescription>
            Copy this and send it here—this will tell us exactly why you got kicked off.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <pre className="max-h-[50vh] overflow-auto rounded-md border border-border bg-muted p-3 text-xs text-foreground">
          {crashText}
        </pre>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(crashText);
                toast({ title: "Copied", description: "Crash report copied to clipboard." });
              } catch {
                toast({
                  variant: "destructive",
                  title: "Copy failed",
                  description: "Your browser blocked clipboard access. You can still select and copy manually.",
                });
              }
            }}
          >
            Copy report
          </Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
