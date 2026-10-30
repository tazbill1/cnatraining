import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export function ComingSoon({ title }: { title: string }) {
  return <div className="flex items-start gap-3 p-5 rounded-lg border border-border bg-muted/30">
    <Clock className="w-6 h-6 shrink-0 text-muted-foreground" />
    <div className="min-w-0 space-y-2">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <Badge variant="secondary">Coming soon</Badge>
      <p className="text-sm text-muted-foreground">Not available yet. Check back for updates.</p>
    </div>
  </div>;
}