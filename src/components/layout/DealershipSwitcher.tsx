import { Building2, ChevronsUpDown, Globe, Eye, EyeOff } from "lucide-react";
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
  const {
    dealerships,
    selectedDealership,
    selectedDealershipId,
    setSelectedDealershipId,
    previewDealershipId,
    setPreviewDealershipId,
    loading,
  } = useDealershipContext();
  const [open, setOpen] = useState(false);

  if (!isSuperAdmin) return null;

  const handleSelect = (id: string | null) => {
    setSelectedDealershipId(id);
    setOpen(false);
  };

  const togglePreview = (e: React.MouseEvent, dealershipId: string) => {
    e.stopPropagation();
    if (previewDealershipId === dealershipId) {
      setPreviewDealershipId(null);
    } else {
      setPreviewDealershipId(dealershipId);
      setSelectedDealershipId(dealershipId);
    }
    setOpen(false);
  };

  return (
    <div className="px-4 pb-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground text-sm transition-colors",
              previewDealershipId
                ? "bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-sidebar-accent/60 hover:bg-sidebar-accent"
            )}
          >
            {previewDealershipId ? (
              <Eye className="w-4 h-4 shrink-0 text-amber-500" />
            ) : (
              <Building2 className="w-4 h-4 shrink-0 text-sidebar-primary" />
            )}
            <span className="flex-1 text-left truncate font-medium">
              {previewDealershipId
                ? `Previewing: ${dealerships.find((d) => d.id === previewDealershipId)?.name}`
                : selectedDealership
                  ? selectedDealership.name
                  : "All Dealerships"}
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-1" align="start" side="right">
          {previewDealershipId && (
            <button
              onClick={() => { setPreviewDealershipId(null); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 mb-1"
            >
              <EyeOff className="w-4 h-4" />
              Exit Preview Mode
            </button>
          )}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent",
              !selectedDealershipId && !previewDealershipId && "bg-accent font-medium"
            )}
          >
            <Globe className="w-4 h-4" />
            All Dealerships
          </button>
          {dealerships.map((d) => (
            <div
              key={d.id}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent group",
                selectedDealershipId === d.id && !previewDealershipId && "bg-accent font-medium",
                previewDealershipId === d.id && "bg-amber-500/10 font-medium"
              )}
            >
              <button
                onClick={() => handleSelect(d.id)}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{d.name}</span>
                {!d.is_active && (
                  <span className="text-xs text-muted-foreground ml-auto">(inactive)</span>
                )}
              </button>
              <button
                onClick={(e) => togglePreview(e, d.id)}
                className={cn(
                  "p-1 rounded transition-colors shrink-0",
                  previewDealershipId === d.id
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-foreground"
                )}
                title={previewDealershipId === d.id ? "Exit preview" : "Preview as this dealership"}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
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
