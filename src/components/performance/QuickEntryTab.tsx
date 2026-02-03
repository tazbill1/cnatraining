import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lead, UserPerformanceData } from "@/lib/performanceTypes";

interface QuickEntryTabProps {
  leads: Lead[];
  userData: UserPerformanceData;
  onAddLead: (lead: Omit<Lead, "id">) => void;
  onLogWalkIn: (type: "visit" | "sale") => void;
}

export function QuickEntryTab({ leads, userData, onAddLead, onLogWalkIn }: QuickEntryTabProps) {
  const [leadForm, setLeadForm] = useState({
    name: "",
    source: "internet" as "internet" | "phone",
    status: "lead" as Lead["status"],
  });
  const [walkInAction, setWalkInAction] = useState<"visit" | "sale">("visit");
  const [justLoggedWalkIn, setJustLoggedWalkIn] = useState(false);

  const handleAddLead = () => {
    if (!leadForm.name.trim()) return;
    onAddLead(leadForm);
    setLeadForm({ name: "", source: "internet", status: "lead" });
  };

  const handleLogWalkIn = () => {
    onLogWalkIn(walkInAction);
    setJustLoggedWalkIn(true);
    setTimeout(() => setJustLoggedWalkIn(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Lead Card */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Add Lead</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Internet and phone leads require customer name
        </p>

        <div className="space-y-4">
          <div>
            <Label>Customer Name *</Label>
            <Input
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <Label>Lead Source</Label>
            <Select
              value={leadForm.source}
              onValueChange={(value: "internet" | "phone") =>
                setLeadForm({ ...leadForm, source: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Current Status</Label>
            <Select
              value={leadForm.status}
              onValueChange={(value: Lead["status"]) =>
                setLeadForm({ ...leadForm, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">New Lead</SelectItem>
                <SelectItem value="appt-set">Appointment Set</SelectItem>
                <SelectItem value="showed">Customer Showed</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddLead} className="w-full" disabled={!leadForm.name.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Recent Leads Preview */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Leads</h4>
          <div className="space-y-2">
            {leads.slice(0, 3).reverse().map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {lead.source} • {lead.status.replace("-", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Walk-In Counter Card */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Log Walk-In</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Quick counter for walk-in traffic
        </p>

        <div className="space-y-4">
          <div>
            <Label>Activity</Label>
            <Select value={walkInAction} onValueChange={(v: "visit" | "sale") => setWalkInAction(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">Walk-In Visit</SelectItem>
                <SelectItem value="sale">Walk-In Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleLogWalkIn}
            className={`w-full ${justLoggedWalkIn ? "bg-green-600 hover:bg-green-600" : ""}`}
          >
            {justLoggedWalkIn ? (
              <>✓ Logged!</>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Log Walk-In
              </>
            )}
          </Button>
        </div>

        {/* Current Walk-In Stats */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Walk-In Stats (MTD)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Visits</p>
              <p className="text-2xl font-bold text-foreground">{userData.walkIn.visits}</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Sales</p>
              <p className="text-2xl font-bold text-foreground">{userData.walkIn.sales}</p>
              <p className="text-xs text-primary font-medium">
                {userData.walkIn.visits > 0
                  ? `${Math.round((userData.walkIn.sales / userData.walkIn.visits) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
