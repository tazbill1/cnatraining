import { Building2, ChevronsUpDown, Globe } from "lucide-react";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DealershipSwitcher() {
  const { isSuperAdmin } = useAuth();
  const { dealerships, selectedDealership, selectedDealershipId, setSelectedDealershipId, loading } = useDealershipContext();
  const [open, setOpen] = useState(false);

  if (!isSuperAdmin) return null;

  return (
    <div className="px-4 pb-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-sidebar-accent/60 hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors"
          >
            <Building2 className="w-4 h-4 shrink-0 text-sidebar-primary" />
            <span className="flex-1 text-left truncate font-medium">
              {selectedDealership ? selectedDealership.name : "All Dealerships"}
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1" align="start" side="right">
          <button
            onClick={() => { setSelectedDealershipId(null); setOpen(false); }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent",
              !selectedDealershipId && "bg-accent font-medium"
            )}
          >
            <Globe className="w-4 h-4" />
            All Dealerships
          </button>
          {dealerships.map((d) => (
            <button
              key={d.id}
              onClick={() => { setSelectedDealershipId(d.id); setOpen(false); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent",
                selectedDealershipId === d.id && "bg-accent font-medium"
              )}
            >
              <Building2 className="w-4 h-4" />
              <span className="truncate">{d.name}</span>
              {!d.is_active && (
                <span className="text-xs text-muted-foreground ml-auto">(inactive)</span>
              )}
            </button>
          ))}
          {loading && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Loading...</p>
          )}
          {!loading && dealerships.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No dealerships yet</p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
