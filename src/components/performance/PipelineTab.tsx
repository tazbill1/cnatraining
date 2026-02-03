import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lead } from "@/lib/performanceTypes";

interface PipelineTabProps {
  leads: Lead[];
  onUpdateStatus: (leadId: number, status: Lead["status"]) => void;
  onDeleteLead: (leadId: number) => void;
  onAddLeadClick: () => void;
}

function PipelineColumn({
  title,
  leads,
  variant,
  onUpdateStatus,
  onDeleteLead,
}: {
  title: string;
  leads: Lead[];
  variant: "default" | "warning" | "success";
  onUpdateStatus: (leadId: number, status: Lead["status"]) => void;
  onDeleteLead: (leadId: number) => void;
}) {
  const bgColors = {
    default: "bg-muted/30",
    warning: "bg-yellow-500/10",
    success: "bg-green-500/10",
  };

  return (
    <div className={`rounded-xl p-4 ${bgColors[variant]}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-background rounded-lg p-3 shadow-sm">
            <p className="font-medium text-foreground">{lead.name}</p>
            <p className="text-xs text-muted-foreground capitalize mb-2">{lead.source}</p>
            <Select
              value={lead.status}
              onValueChange={(value: Lead["status"]) => onUpdateStatus(lead.id, value)}
            >
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">New Lead</SelectItem>
                {lead.source !== "walk-in" && (
                  <>
                    <SelectItem value="appt-set">Set Appt</SelectItem>
                    <SelectItem value="showed">Showed</SelectItem>
                  </>
                )}
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => onDeleteLead(lead.id)}
              className="mt-2 text-xs text-destructive hover:text-destructive/80"
            >
              Delete
            </button>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {title === "New Leads" ? "No new leads" : 
             title === "Appts Set" ? "No appointments" :
             title === "Showed Up" ? "No shows yet" : "No sales yet"}
          </p>
        )}
      </div>
    </div>
  );
}

export function PipelineTab({ leads, onUpdateStatus, onDeleteLead, onAddLeadClick }: PipelineTabProps) {
  const newLeads = leads.filter((l) => l.status === "lead");
  const apptsSet = leads.filter((l) => l.status === "appt-set");
  const showed = leads.filter((l) => l.status === "showed");
  const sold = leads.filter((l) => l.status === "sold");
  const lost = leads.filter((l) => l.status === "lost");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">My Pipeline</h3>
        <Button onClick={onAddLeadClick}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PipelineColumn
          title="New Leads"
          leads={newLeads}
          variant="default"
          onUpdateStatus={onUpdateStatus}
          onDeleteLead={onDeleteLead}
        />
        <PipelineColumn
          title="Appts Set"
          leads={apptsSet}
          variant="default"
          onUpdateStatus={onUpdateStatus}
          onDeleteLead={onDeleteLead}
        />
        <PipelineColumn
          title="Showed Up"
          leads={showed}
          variant="warning"
          onUpdateStatus={onUpdateStatus}
          onDeleteLead={onDeleteLead}
        />
        <PipelineColumn
          title="Sold"
          leads={sold}
          variant="success"
          onUpdateStatus={onUpdateStatus}
          onDeleteLead={onDeleteLead}
        />
      </div>

      {lost.length > 0 && (
        <div className="card-premium p-4">
          <h4 className="font-semibold text-muted-foreground mb-3">
            Lost Leads ({lost.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {lost.map((lead) => (
              <Badge key={lead.id} variant="outline" className="text-muted-foreground">
                {lead.name} • {lead.source}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
