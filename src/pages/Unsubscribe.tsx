import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const body = await res.json();
        if (res.ok && body.valid) setState({ kind: "valid" });
        else if (body.reason === "already_unsubscribed") setState({ kind: "already" });
        else setState({ kind: "invalid" });
      } catch {
        setState({ kind: "invalid" });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({ token }),
        },
      );
      const body = await res.json();
      if (res.ok && body.success) setState({ kind: "success" });
      else if (body.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", message: body.error || "Something went wrong." });
    } catch (err: any) {
      setState({ kind: "error", message: err?.message || "Something went wrong." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.kind === "loading" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Validating your link…
            </div>
          )}
          {state.kind === "valid" && (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to stop receiving emails from us.
              </p>
              <Button onClick={confirm} className="w-full">
                Confirm unsubscribe
              </Button>
            </>
          )}
          {state.kind === "submitting" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing…
            </div>
          )}
          {state.kind === "success" && (
            <div className="flex items-start gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <p>You've been unsubscribed. You won't receive more emails from us.</p>
            </div>
          )}
          {state.kind === "already" && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 mt-0.5" />
              <p>This email address is already unsubscribed.</p>
            </div>
          )}
          {state.kind === "invalid" && (
            <div className="flex items-start gap-2 text-destructive">
              <XCircle className="w-5 h-5 mt-0.5" />
              <p>This unsubscribe link is invalid or has expired.</p>
            </div>
          )}
          {state.kind === "error" && (
            <div className="flex items-start gap-2 text-destructive">
              <XCircle className="w-5 h-5 mt-0.5" />
              <p>{state.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
