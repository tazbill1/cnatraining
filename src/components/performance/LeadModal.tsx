import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lead } from "@/lib/performanceTypes";

interface LeadFormData {
  name: string;
  source: "internet" | "phone" | "walk-in";
  status: Lead["status"];
}

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadForm: LeadFormData;
  setLeadForm: (form: LeadFormData) => void;
  onAdd: () => void;
}

export function LeadModal({ open, onOpenChange, leadForm, setLeadForm, onAdd }: LeadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Customer Name</Label>
            <Input
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              placeholder="Enter customer name"
              autoFocus
            />
          </div>

          <div>
            <Label>Source</Label>
            <Select
              value={leadForm.source}
              onValueChange={(value: "internet" | "phone" | "walk-in") =>
                setLeadForm({ ...leadForm, source: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="walk-in">Walk-In</SelectItem>
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
                {leadForm.source !== "walk-in" && (
                  <>
                    <SelectItem value="appt-set">Appointment Set</SelectItem>
                    <SelectItem value="showed">Customer Showed</SelectItem>
                  </>
                )}
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onAdd} disabled={!leadForm.name.trim()}>
            Add Lead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
