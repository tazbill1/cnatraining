import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Car, CheckCircle2, Gauge, Eye, Settings, FileText, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function EvaluationSection() {
  const operatingRule = [
    "The same way",
    "In the same order",
    "Every single time",
  ];

  const exteriorSequence = [
    "Front of the vehicle",
    "Passenger side",
    "Rear of the vehicle",
    "Driver side",
  ];

  const interiorChecks = [
    "Turn radio off and on",
    "Test heated seats / ventilated seats (if equipped)",
    "Turn heat on and confirm hot air",
    "Turn A/C on and confirm cold air",
    "Turn headlights on and activate high beams",
  ];

  const behaviorStandards = [
    "Minimal talking",
    "No commentary on condition",
    "No diagnosing",
    "No negotiating",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Step 2: Vehicle Evaluation
        </h2>
        <p className="text-muted-foreground">
          The standardized evaluation sequence that builds credibility through consistency.
        </p>
      </div>

      {/* Operating Rule */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">The Operating Rule</h3>
          <p className="text-muted-foreground mb-4">Every vehicle is evaluated:</p>
          <div className="flex flex-wrap gap-3">
            {operatingRule.map((item, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-primary/20 text-sm font-medium text-primary">
                {item}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            The only exception is documented damage, which requires additional photos, not shortcuts. Consistency is what makes the process fair.
          </p>
        </CardContent>
      </Card>

      {/* Purpose */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-500" />
            Purpose of Step 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Step 2 exists to ensure the vehicle is:</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {["Accurately represented", "Consistently evaluated", "Fairly documented"].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standard Evaluation Sequence */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Standard Evaluation Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Step 1: Exterior */}
            <AccordionItem value="step1">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <span className="font-medium">Exterior Walk-Around (Start Here)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We always begin with the exterior. This feels professional, eases the customer into the process, 
                    avoids immediately "digging into" the vehicle, and reinforces consistency.
                  </p>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Exterior photo sequence:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {exteriorSequence.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                          <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    If damage is present on any exterior panel, take clear photos.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2: Driver Door Entry */}
            <AccordionItem value="step2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <span className="font-medium">Driver Door Entry & Interior Evaluation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Use the key fob to unlock the driver door</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Enter the vehicle and sit in the driver seat</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Start the vehicle</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3: Mileage & Dashboard */}
            <AccordionItem value="step3">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <span className="font-medium">Mileage & Dashboard</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Take a clear photo of the odometer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-muted-foreground">Confirm it is actual mileage (not Trip A or B)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-muted-foreground">Check for any warning or indicator lights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Photograph any lights that should not be present</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4: Interior Functionality */}
            <AccordionItem value="step4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <span className="font-medium">Interior Functionality Checks</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-2">
                  {interiorChecks.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Settings className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 5: Windows */}
            <AccordionItem value="step5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">5</span>
                  </div>
                  <span className="font-medium">Windows (With Permission)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm italic text-foreground">
                    "I'm going to check the windows real quick. Is that okay?"
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Roll all windows down and up</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Confirm smooth operation</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 6: Trunk/Rear */}
            <AccordionItem value="step6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">6</span>
                  </div>
                  <span className="font-medium">Trunk/Rear Inspection</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Open trunk and inspect:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Spare tire", "Jack and tools", "Under-floor area"].map((item, i) => (
                      <div key={i} className="p-2 rounded bg-muted/30 text-center text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Roll fingers along trunk seams. Take photos as needed.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 7: Hood & Engine */}
            <AccordionItem value="step7">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">7</span>
                  </div>
                  <span className="font-medium">Hood & Engine Bay</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">With the vehicle still running, release and open the hood</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Listen for abnormal noises</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Take a photo of the engine bay</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">Visual check only. Do not diagnose.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 8: Passenger & Rear */}
            <AccordionItem value="step8">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">8</span>
                  </div>
                  <span className="font-medium">Passenger & Rear Interior</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-2">
                  {[
                    "Sit in passenger seat",
                    "Check seat movement",
                    "Check windows",
                    "Open glove box",
                    "Inspect rear seating area for obvious cosmetic issues or damage",
                    "Document as needed",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 9: Final */}
            <AccordionItem value="step9">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-500">9</span>
                  </div>
                  <span className="font-medium">Final Step</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 pl-11">
                <div className="space-y-2">
                  {[
                    "Return to driver seat",
                    "Confirm all tires were checked",
                    "Turn off the vehicle",
                    "Close out documentation",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Panel & Seam Check */}
      <Card className="border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-500" />
            Panel & Seam Check (Quick Guidance)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When rolling your fingers along door, hood, and trunk seams, you're simply looking for obvious inconsistencies: 
            changes in texture, waviness, or roughness that can indicate filler or body work.
          </p>
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm text-muted-foreground mb-2">Pay attention to:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Irregular panel gaps",
                "Edges that don't feel uniform",
                "Missing factory stickers",
                "Clear coat and paint differences",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">
            You are not diagnosing repairs. You are just documenting anything that looks or feels different so the vehicle is accurately represented.
          </p>
        </CardContent>
      </Card>

      {/* Important Behavior Standards */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Important Behavior Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {behaviorStandards.map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            One neutral question only if necessary: "Do you know what happened here?" Collect a short response and move on.
          </p>
        </CardContent>
      </Card>

      {/* Why This Sequence Works */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <h4 className="font-semibold text-foreground mb-3 text-center">Why This Sequence Works</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Feels calm and professional",
            "Shows consistency and discipline",
            "Avoids creating objections",
            "Builds credibility through action, not words",
            "Makes Step 3 disclosure easier and cleaner",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
