import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Car, 
  Target, 
  Phone, 
  Download, 
  RotateCcw,
  CheckCircle2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CNAFormData {
  // Rapport
  customerName: string;
  firstVisit: "yes" | "no" | "";
  referralSource: string;
  
  // Goals
  goalsProductInfo: boolean;
  goalsProductDemo: boolean;
  goalsPurchaseInfo: boolean;
  goalsLiveAppraisal: boolean;
  
  // Use & Utility
  useAndUtility: string;
  funAndAdventure: string;
  
  // Current Vehicle
  currentYear: string;
  currentMake: string;
  currentModel: string;
  currentTrim: string;
  currentColor: string;
  currentOdometer: string;
  milesPerYear: string;
  titleClear: "yes" | "no" | "";
  replacingOrAdding: "replacing" | "adding" | "";
  
  // New Vehicle
  specificResearch: string;
  newOrPreowned: "new" | "preowned" | "certified" | "";
  vehicleType: string[];
  colorPreference: "lighter" | "darker" | "never" | "";
  
  // Priorities
  prioritySafety: boolean;
  priorityPerformance: boolean;
  priorityAppearance: boolean;
  priorityComfort: boolean;
  priorityEconomy: boolean;
  priorityReliability: boolean;
  
  // Recommendations
  recommendation1: string;
  recommendation2: string;
  recommendation3: string;
  
  // Contact
  driversLicense: boolean;
  contactCell: string;
  contactWork: string;
  contactEmail: string;
}

const initialFormData: CNAFormData = {
  customerName: "",
  firstVisit: "",
  referralSource: "",
  goalsProductInfo: false,
  goalsProductDemo: false,
  goalsPurchaseInfo: false,
  goalsLiveAppraisal: false,
  useAndUtility: "",
  funAndAdventure: "",
  currentYear: "",
  currentMake: "",
  currentModel: "",
  currentTrim: "",
  currentColor: "",
  currentOdometer: "",
  milesPerYear: "",
  titleClear: "",
  replacingOrAdding: "",
  specificResearch: "",
  newOrPreowned: "",
  vehicleType: [],
  colorPreference: "",
  prioritySafety: false,
  priorityPerformance: false,
  priorityAppearance: false,
  priorityComfort: false,
  priorityEconomy: false,
  priorityReliability: false,
  recommendation1: "",
  recommendation2: "",
  recommendation3: "",
  driversLicense: false,
  contactCell: "",
  contactWork: "",
  contactEmail: "",
};

export function CNAFormDigital() {
  const [formData, setFormData] = useState<CNAFormData>(initialFormData);

  const updateField = <K extends keyof CNAFormData>(
    field: K,
    value: CNAFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleVehicleType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicleType: prev.vehicleType.includes(type)
        ? prev.vehicleType.filter((t) => t !== type)
        : [...prev.vehicleType, type],
    }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const calculateCompletion = (): number => {
    let filled = 0;
    let total = 0;

    // Check string fields
    const stringFields: (keyof CNAFormData)[] = [
      "customerName",
      "referralSource",
      "useAndUtility",
      "currentYear",
      "currentMake",
      "currentModel",
    ];
    stringFields.forEach((field) => {
      total++;
      if (formData[field]) filled++;
    });

    // Check radio fields
    const radioFields: (keyof CNAFormData)[] = [
      "firstVisit",
      "titleClear",
      "replacingOrAdding",
      "newOrPreowned",
      "colorPreference",
    ];
    radioFields.forEach((field) => {
      total++;
      if (formData[field]) filled++;
    });

    // Check if any goal is selected
    total++;
    if (
      formData.goalsProductInfo ||
      formData.goalsProductDemo ||
      formData.goalsPurchaseInfo ||
      formData.goalsLiveAppraisal
    ) {
      filled++;
    }

    // Check if any priority is selected
    total++;
    if (
      formData.prioritySafety ||
      formData.priorityPerformance ||
      formData.priorityAppearance ||
      formData.priorityComfort ||
      formData.priorityEconomy ||
      formData.priorityReliability
    ) {
      filled++;
    }

    // Check vehicle type
    total++;
    if (formData.vehicleType.length > 0) filled++;

    // Check recommendations (at least 1)
    total++;
    if (formData.recommendation1) filled++;

    return Math.round((filled / total) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="space-y-6">
      {/* Header with completion and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge
            variant={completion === 100 ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {completion}% Complete
          </Badge>
          {completion === 100 && (
            <div className="flex items-center gap-1 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>CNA Complete!</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Form
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/documents/CNA-Form.pdf" download>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </Button>
        </div>
      </div>

      {/* Form Sections */}
      <div className="grid gap-6">
        {/* Rapport Building */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>First Visit?</Label>
                <RadioGroup
                  value={formData.firstVisit}
                  onValueChange={(v) =>
                    updateField("firstVisit", v as "yes" | "no")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="firstVisit-yes" />
                    <Label htmlFor="firstVisit-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="firstVisit-no" />
                    <Label htmlFor="firstVisit-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralSource">How did you hear about us?</Label>
              <Input
                id="referralSource"
                placeholder="Referral source, advertisement, online, etc."
                value={formData.referralSource}
                onChange={(e) => updateField("referralSource", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals for Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-primary" />
              Goals for Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "goalsProductInfo", label: "Product Information" },
                { key: "goalsProductDemo", label: "Product Demonstration" },
                { key: "goalsPurchaseInfo", label: "Purchase Information" },
                { key: "goalsLiveAppraisal", label: "Live Market Appraisal" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData[key as keyof CNAFormData] as boolean}
                    onCheckedChange={(checked) =>
                      updateField(key as keyof CNAFormData, checked as boolean)
                    }
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Use & Utility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Use & Utility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="useAndUtility">Daily Use & Utility</Label>
              <Input
                id="useAndUtility"
                placeholder="Commute, family, work, etc."
                value={formData.useAndUtility}
                onChange={(e) => updateField("useAndUtility", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funAndAdventure">Fun & Adventure</Label>
              <Input
                id="funAndAdventure"
                placeholder="Weekends, vacations, hobbies, etc."
                value={formData.funAndAdventure}
                onChange={(e) => updateField("funAndAdventure", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Vehicle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="w-5 h-5 text-primary" />
              Current Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentYear">Year</Label>
                <Input
                  id="currentYear"
                  placeholder="2020"
                  value={formData.currentYear}
                  onChange={(e) => updateField("currentYear", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMake">Make</Label>
                <Input
                  id="currentMake"
                  placeholder="Toyota"
                  value={formData.currentMake}
                  onChange={(e) => updateField("currentMake", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentModel">Model</Label>
                <Input
                  id="currentModel"
                  placeholder="Camry"
                  value={formData.currentModel}
                  onChange={(e) => updateField("currentModel", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentTrim">Trim</Label>
                <Input
                  id="currentTrim"
                  placeholder="SE"
                  value={formData.currentTrim}
                  onChange={(e) => updateField("currentTrim", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentColor">Color</Label>
                <Input
                  id="currentColor"
                  placeholder="Silver"
                  value={formData.currentColor}
                  onChange={(e) => updateField("currentColor", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentOdometer">Odometer</Label>
                <Input
                  id="currentOdometer"
                  placeholder="45,000"
                  value={formData.currentOdometer}
                  onChange={(e) =>
                    updateField("currentOdometer", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milesPerYear">Miles Per Year</Label>
                <Input
                  id="milesPerYear"
                  placeholder="12,000"
                  value={formData.milesPerYear}
                  onChange={(e) => updateField("milesPerYear", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Title Clear?</Label>
                <RadioGroup
                  value={formData.titleClear}
                  onValueChange={(v) =>
                    updateField("titleClear", v as "yes" | "no")
                  }
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="titleClear-yes" />
                    <Label htmlFor="titleClear-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="titleClear-no" />
                    <Label htmlFor="titleClear-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Replacing or Adding?</Label>
                <RadioGroup
                  value={formData.replacingOrAdding}
                  onValueChange={(v) =>
                    updateField("replacingOrAdding", v as "replacing" | "adding")
                  }
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replacing" id="replacing" />
                    <Label htmlFor="replacing">Replacing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adding" id="adding" />
                    <Label htmlFor="adding">Adding</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Vehicle Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="w-5 h-5 text-primary" />
              New Vehicle Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specificResearch">
                Specific Vehicle / Research
              </Label>
              <Input
                id="specificResearch"
                placeholder="Any specific vehicles they've researched"
                value={formData.specificResearch}
                onChange={(e) =>
                  updateField("specificResearch", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>New or Pre-owned?</Label>
                <RadioGroup
                  value={formData.newOrPreowned}
                  onValueChange={(v) =>
                    updateField(
                      "newOrPreowned",
                      v as "new" | "preowned" | "certified"
                    )
                  }
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">New</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preowned" id="preowned" />
                    <Label htmlFor="preowned">Pre-owned</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="certified" id="certified" />
                    <Label htmlFor="certified">Certified</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Color Preference</Label>
                <RadioGroup
                  value={formData.colorPreference}
                  onValueChange={(v) =>
                    updateField(
                      "colorPreference",
                      v as "lighter" | "darker" | "never"
                    )
                  }
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lighter" id="lighter" />
                    <Label htmlFor="lighter">Lighter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="darker" id="darker" />
                    <Label htmlFor="darker">Darker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">No Preference</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <div className="flex flex-wrap gap-2">
                {["Sedan", "SUV", "Truck", "Convertible", "Other"].map(
                  (type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={
                        formData.vehicleType.includes(type)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleVehicleType(type)}
                    >
                      {type}
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Important To You */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Most Important To You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "prioritySafety", label: "Safety" },
                { key: "priorityPerformance", label: "Performance" },
                { key: "priorityAppearance", label: "Appearance" },
                { key: "priorityComfort", label: "Comfort & Convenience" },
                { key: "priorityEconomy", label: "Economy" },
                { key: "priorityReliability", label: "Reliability" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData[key as keyof CNAFormData] as boolean}
                    onCheckedChange={(checked) =>
                      updateField(key as keyof CNAFormData, checked as boolean)
                    }
                  />
                  <Label htmlFor={key} className="cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Vehicle Recommendations (Rule of 2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommendation1">Option 1</Label>
                <Input
                  id="recommendation1"
                  placeholder="Primary recommendation"
                  value={formData.recommendation1}
                  onChange={(e) =>
                    updateField("recommendation1", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendation2">Option 2</Label>
                <Input
                  id="recommendation2"
                  placeholder="Alternative recommendation"
                  value={formData.recommendation2}
                  onChange={(e) =>
                    updateField("recommendation2", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendation3">Option 3 (optional)</Label>
                <Input
                  id="recommendation3"
                  placeholder="Additional option"
                  value={formData.recommendation3}
                  onChange={(e) =>
                    updateField("recommendation3", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="driversLicense"
                checked={formData.driversLicense}
                onCheckedChange={(checked) =>
                  updateField("driversLicense", checked as boolean)
                }
              />
              <Label htmlFor="driversLicense" className="cursor-pointer">
                Driver's License Collected
              </Label>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactCell">Cell</Label>
                <Input
                  id="contactCell"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.contactCell}
                  onChange={(e) => updateField("contactCell", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactWork">Work</Label>
                <Input
                  id="contactWork"
                  type="tel"
                  placeholder="(555) 987-6543"
                  value={formData.contactWork}
                  onChange={(e) => updateField("contactWork", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="customer@email.com"
                  value={formData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
