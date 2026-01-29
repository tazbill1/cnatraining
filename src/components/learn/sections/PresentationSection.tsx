import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Brain, Eye, Key, AlertTriangle } from "lucide-react";

export function PresentationSection() {
  const properPresentation = [
    "Clean exterior (no dirt, bird droppings, pollen)",
    "Clean interior (vacuumed, wiped down, no debris)",
    "Climate controlled (comfortable temperature)",
    "Bluetooth paired and ready",
    "Proper fuel level (not empty or warning light on)",
    "Staged intentionally (positioned for easy approach)",
  ];

  const smallMisses = [
    { issue: "Dirty exterior", impact: "makes them wonder about maintenance" },
    { issue: "Interior debris", impact: "makes them question attention to detail" },
    { issue: "Smudges and fingerprints", impact: "signals lack of care" },
    { issue: "Dead battery or dashboard lights", impact: "creates instant red flags" },
    { issue: "Low fuel", impact: "feels like you weren't prepared" },
  ];

  const customerBrainScans = [
    '"Does this match what I pictured?"',
    '"Does this feel right?"',
    '"Would I be proud to own this?"',
  ];

  const poorKeyManagement = [
    "Breaks conversational flow",
    "Creates awkward pauses while you search",
    "Introduces doubt during dead time",
    "Gives customers space to second-guess",
    "Signals disorganization",
  ];

  const standardKeyManagement = [
    "Keys signed out properly before approaching vehicle",
    "Keys returned promptly after demonstration",
    "Key count verified early in process",
    "Keys never stored casually or left in vehicles",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Vehicle Presentation & Key Management
        </h2>
        <p className="text-muted-foreground">
          Why first impressions happen before the features discussion.
        </p>
      </div>

      {/* Critical Insight */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Critical Insight</h3>
              <p className="text-muted-foreground">
                First impressions are formed <strong className="text-foreground">BEFORE</strong>:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• The test drive</li>
                <li>• The features discussion</li>
                <li>• Any price conversation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer's Brain */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              The customer's brain is scanning for alignment:
            </h3>
          </div>
          <div className="space-y-3 pl-8">
            {customerBrainScans.map((question, i) => (
              <p key={i} className="text-muted-foreground italic text-lg">
                🧠 {question}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proper Presentation */}
      <Card className="border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Proper Presentation Signals Quality
          </CardTitle>
          <p className="text-sm text-muted-foreground">When a vehicle is presented correctly:</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {properPresentation.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Small Misses */}
      <Card className="border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Small Misses Create Big Doubt
          </CardTitle>
          <p className="text-sm text-muted-foreground">When presentation is off:</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {smallMisses.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{item.issue}</strong> — {item.impact}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* The Impact */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
          <h4 className="font-medium text-green-700 dark:text-green-400 mb-3">
            When presentation is right:
          </h4>
          <p className="text-sm text-muted-foreground mb-2">The customer focuses on:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• How it drives</li>
            <li>• How it fits their life</li>
            <li>• How it feels to sit in</li>
            <li>• Whether it meets their needs</li>
          </ul>
        </div>
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
          <h4 className="font-medium text-red-700 dark:text-red-400 mb-3">
            When presentation is wrong:
          </h4>
          <p className="text-sm text-muted-foreground mb-2">The customer questions:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• The decision itself</li>
            <li>• Whether this is "the one"</li>
            <li>• If they should keep looking</li>
            <li>• Whether you really prepared for them</li>
          </ul>
        </div>
      </div>

      {/* Key Management Section */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            Key Management as Sales Enablement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="font-medium text-amber-700 dark:text-amber-300">
              Key management is NOT an administrative task.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              It's a sales enablement system that controls whether a vehicle can be shown, speed of showing, smoothness of transition, and preservation of customer desire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Poor Key Management */}
            <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Poor key management:
              </h4>
              <div className="space-y-1">
                {poorKeyManagement.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <XCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Key Management */}
            <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Standard key management:
              </h4>
              <div className="space-y-1">
                {standardKeyManagement.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Count Warning */}
      <Card className="border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Why Key Count Matters</h3>
              <p className="text-muted-foreground mb-3">
                Customers expect what originally came with the vehicle.
              </p>
              <div className="p-3 bg-muted/30 rounded-lg mb-3">
                <p className="text-sm font-medium text-foreground">Scenario:</p>
                <p className="text-sm text-muted-foreground">
                  Customer is ready to buy. During final paperwork, they discover only one key exists instead of two.
                </p>
              </div>
              <p className="text-sm font-medium text-foreground mb-2">Impact:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Introduces last-minute doubt</li>
                <li>• Creates negotiation point at worst possible time</li>
                <li>• Damages trust in your thoroughness</li>
                <li>• Can delay or kill the deal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaway */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-center text-lg font-medium text-foreground">
          Presentation isn't optional — it's non-negotiable.
          <br />
          <span className="text-muted-foreground text-base">
            Their brain is already deciding if this "feels right" before you say a word.
          </span>
        </p>
      </div>
    </div>
  );
}
