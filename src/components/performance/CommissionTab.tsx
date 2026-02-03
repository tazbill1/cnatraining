import { useState } from "react";
import { DollarSign, Calculator, TrendingUp, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Tier {
  minUnits: number;
  bonusPerUnit: number;
}

interface CommissionSettings {
  grossPercentage: number;
  packDeduction: number;
  tiers: Tier[];
}

const defaultSettings: CommissionSettings = {
  grossPercentage: 25,
  packDeduction: 500,
  tiers: [
    { minUnits: 8, bonusPerUnit: 25 },
    { minUnits: 10, bonusPerUnit: 50 },
    { minUnits: 12, bonusPerUnit: 75 },
    { minUnits: 15, bonusPerUnit: 100 },
  ],
};

export function CommissionTab() {
  const [settings, setSettings] = useState<CommissionSettings>(defaultSettings);
  const [tempSettings, setTempSettings] = useState<CommissionSettings>(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Input state for calculator
  const [unitsSold, setUnitsSold] = useState<number>(10);
  const [totalFrontGross, setTotalFrontGross] = useState<number>(15000);

  // Calculate commission
  const calculateCommission = () => {
    // Net gross after pack deduction
    const totalPack = unitsSold * settings.packDeduction;
    const netGross = Math.max(0, totalFrontGross - totalPack);

    // Base commission (percentage of net gross)
    const baseCommission = netGross * (settings.grossPercentage / 100);

    // Find applicable tier bonus
    let tierBonus = 0;
    for (const tier of [...settings.tiers].sort((a, b) => b.minUnits - a.minUnits)) {
      if (unitsSold >= tier.minUnits) {
        tierBonus = unitsSold * tier.bonusPerUnit;
        break;
      }
    }

    const totalCommission = baseCommission + tierBonus;
    const perUnitAverage = unitsSold > 0 ? totalCommission / unitsSold : 0;

    return {
      netGross,
      baseCommission,
      tierBonus,
      totalCommission,
      perUnitAverage,
      activeTier: settings.tiers
        .filter((t) => unitsSold >= t.minUnits)
        .sort((a, b) => b.minUnits - a.minUnits)[0],
    };
  };

  const results = calculateCommission();

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setSettingsOpen(false);
  };

  const handleAddTier = () => {
    setTempSettings((prev) => ({
      ...prev,
      tiers: [...prev.tiers, { minUnits: 0, bonusPerUnit: 0 }],
    }));
  };

  const handleRemoveTier = (index: number) => {
    setTempSettings((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }));
  };

  const handleTierChange = (index: number, field: keyof Tier, value: number) => {
    setTempSettings((prev) => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Settings Button */}
      <div className="flex justify-end">
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setTempSettings(settings)}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Commission Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Commission Plan Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Base Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gross Percentage (%)</Label>
                  <Input
                    type="number"
                    value={tempSettings.grossPercentage}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        grossPercentage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pack Deduction ($)</Label>
                  <Input
                    type="number"
                    value={tempSettings.packDeduction}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        packDeduction: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Volume Tiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Volume Bonus Tiers</Label>
                  <Button size="sm" variant="ghost" onClick={handleAddTier}>
                    + Add Tier
                  </Button>
                </div>
                <div className="space-y-2">
                  {tempSettings.tiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min units"
                        value={tier.minUnits}
                        onChange={(e) =>
                          handleTierChange(index, "minUnits", Number(e.target.value))
                        }
                        className="w-24"
                      />
                      <span className="text-muted-foreground text-sm">units =</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="Bonus/unit"
                          value={tier.bonusPerUnit}
                          onChange={(e) =>
                            handleTierChange(index, "bonusPerUnit", Number(e.target.value))
                          }
                          className="pl-7"
                        />
                      </div>
                      <span className="text-muted-foreground text-sm">/unit</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveTier(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Calculate Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Units Sold This Month</Label>
              <Input
                type="number"
                min={0}
                value={unitsSold}
                onChange={(e) => setUnitsSold(Number(e.target.value))}
                placeholder="e.g., 10"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Front-End Gross ($)</Label>
              <Input
                type="number"
                min={0}
                value={totalFrontGross}
                onChange={(e) => setTotalFrontGross(Number(e.target.value))}
                placeholder="e.g., 15000"
              />
            </div>

            {/* Current Plan Summary */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Your Plan:</strong> {settings.grossPercentage}% of net gross
                (after ${settings.packDeduction} pack/unit)
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Volume Tiers:</strong>{" "}
                {settings.tiers
                  .sort((a, b) => a.minUnits - b.minUnits)
                  .map((t) => `${t.minUnits}+ = $${t.bonusPerUnit}/unit`)
                  .join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Estimated Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Big number */}
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-primary">
                ${results.totalCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Estimated monthly commission
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Gross (after pack)</span>
                <span className="font-medium">
                  ${results.netGross.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Base ({settings.grossPercentage}% of net)
                </span>
                <span className="font-medium">
                  ${results.baseCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Volume Bonus
                  {results.activeTier && (
                    <span className="text-primary ml-1">
                      ({results.activeTier.minUnits}+ tier)
                    </span>
                  )}
                </span>
                <span className="font-medium text-primary">
                  +${results.tierBonus.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t">
                <span className="text-muted-foreground">Average per unit</span>
                <span className="font-semibold">
                  ${results.perUnitAverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Volume Bonus Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.tiers
              .sort((a, b) => a.minUnits - b.minUnits)
              .map((tier, index) => {
                const isActive = unitsSold >= tier.minUnits;
                const isCurrentTier =
                  results.activeTier?.minUnits === tier.minUnits;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      isCurrentTier
                        ? "border-primary bg-primary/10"
                        : isActive
                        ? "border-primary/40 bg-primary/5"
                        : "border-muted bg-muted/30"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        isCurrentTier ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tier.minUnits}+
                    </p>
                    <p className="text-sm text-muted-foreground">units</p>
                    <p
                      className={`text-lg font-semibold mt-2 ${
                        isCurrentTier ? "text-primary" : "text-foreground"
                      }`}
                    >
                      ${tier.bonusPerUnit}
                    </p>
                    <p className="text-xs text-muted-foreground">per unit bonus</p>
                    {isCurrentTier && (
                      <p className="text-xs text-primary font-medium mt-2">
                        ✓ Current Tier
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
