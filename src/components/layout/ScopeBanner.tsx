import { Eye, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import { useActiveScope } from "./navConfig";

/** Shown on every page so super admins always know whose content they're seeing. */
export function ScopeBanner() {
  const { isSuperAdmin } = useAuth();
  const { setPreviewDealershipId, dealerships, setSelectedDealershipId } = useDealershipContext();
  const scope = useActiveScope();
  if (!isSuperAdmin) return null;

  if (scope.isPreviewing) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-warning/40 bg-warning/10 px-4 py-2 text-sm">
        <Eye className="w-4 h-4 text-warning shrink-0" />
        <span className="flex-1 text-foreground">
          <strong>Preview mode:</strong> you're seeing what a <strong>{scope.name}</strong> salesperson sees.
        </span>
        <Button size="sm" variant="outline" onClick={() => setPreviewDealershipId(null)}>Exit preview</Button>
      </div>
    );
  }

  if (scope.isAll && dealerships.length > 1) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/60 px-4 py-2 text-sm">
        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground mr-1">Viewing all dealerships. Pick one to see its training:</span>
        {dealerships.map((d) => (
          <Button key={d.id} size="sm" variant="outline" className="h-8" onClick={() => setSelectedDealershipId(d.id)}>
            {d.name}
          </Button>
        ))}
      </div>
    );
  }
  return null;
}
