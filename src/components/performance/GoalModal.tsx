import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Goals } from "@/lib/performanceTypes";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalForm: Goals;
  setGoalForm: (goals: Goals) => void;
  onSave: () => void;
}

export function GoalModal({ open, onOpenChange, goalForm, setGoalForm, onSave }: GoalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Goals</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Performance Goals</h4>
            <div className="space-y-4">
              <div>
                <Label>Monthly Sales Goal (units)</Label>
                <Input
                  type="number"
                  value={goalForm.sales}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, sales: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Target Show Rate (%)</Label>
                <Input
                  type="number"
                  value={goalForm.showRate}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, showRate: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Target Close Rate (%)</Label>
                <Input
                  type="number"
                  value={goalForm.closeRate}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, closeRate: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Activity Goals</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Internet Leads</Label>
                <Input
                  type="number"
                  value={goalForm.internetLeads}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, internetLeads: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Phone Leads</Label>
                <Input
                  type="number"
                  value={goalForm.phoneLeads}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, phoneLeads: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Walk-Ins</Label>
                <Input
                  type="number"
                  value={goalForm.walkIns}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, walkIns: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onSave}>
            Save Goals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
