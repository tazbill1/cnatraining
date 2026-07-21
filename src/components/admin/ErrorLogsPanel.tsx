import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2, AlertTriangle } from "lucide-react";

interface ErrorLog {
  id: string;
  created_at: string;
  source: string;
  error_type: string | null;
  error_message: string | null;
  error_stack: string | null;
  error_context: any;
  url: string | null;
  user_email: string | null;
  recent_actions: any;
}

export function ErrorLogsPanel() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bug_reports")
      .select("id,created_at,source,error_type,error_message,error_stack,error_context,url,user_email,recent_actions")
      .in("source", ["auto-client", "auto-edge"])
      .order("created_at", { ascending: false })
      .limit(50);
    setLogs((data as any) ?? []);
    setLoading(false);
  };

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Auto-Captured Errors ({logs.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!confirm("Clear all auto-captured errors? This cannot be undone.")) return;
              setLoading(true);
              await supabase.from("bug_reports").delete().in("source", ["auto-client", "auto-edge"]);
              await load();
            }}
            disabled={loading || logs.length === 0}
          >
            Clear all
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No errors captured. 🎉</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const open = expanded[log.id];
              return (
                <div key={log.id} className="border rounded-md">
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [log.id]: !e[log.id] }))}
                    className="w-full flex items-start gap-2 p-3 text-left hover:bg-muted/50"
                  >
                    {open ? <ChevronDown className="w-4 h-4 mt-1 shrink-0" /> : <ChevronRight className="w-4 h-4 mt-1 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={log.source === "auto-edge" ? "destructive" : "secondary"}>
                          {log.source}
                        </Badge>
                        <span className="font-mono text-sm font-medium">{log.error_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1 truncate">{log.error_message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.user_email ?? "unknown user"} · {log.url ?? "—"}
                      </div>
                    </div>
                  </button>
                  {open && (
                    <div className="p-3 border-t bg-muted/30 space-y-3">
                      {log.error_stack && (
                        <div>
                          <div className="text-xs font-semibold mb-1">Stack trace</div>
                          <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap break-all">
{log.error_stack}
                          </pre>
                        </div>
                      )}
                      {log.error_context && (
                        <div>
                          <div className="text-xs font-semibold mb-1">Context</div>
                          <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-48">
{JSON.stringify(log.error_context, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.recent_actions && (
                        <div>
                          <div className="text-xs font-semibold mb-1">Recent actions</div>
                          <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-48">
{JSON.stringify(log.recent_actions, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
