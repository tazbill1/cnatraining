import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Brain, Eye } from "lucide-react";

export function PresentationSection() {
  const properPresentation = [
    "Clean inside and out",
    "Staged intentionally",
    "Climate controlled",
    "Bluetooth paired",
    "Proper fuel level",
  ];

  const smallMisses = [
    "Dirty exterior",
    "Interior debris",
    "Smudges",
    "Dead battery",
    "Dashboard lights",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          First Impressions
        </h2>
        <p className="text-muted-foreground">
          Why vehicle presentation is critical to the sale.
        </p>
      </div>

      {/* Key Insight */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Key Insight</h3>
              <p className="text-muted-foreground">
                First impressions are formed <strong className="text-foreground">BEFORE</strong> the 
                test drive, features discussion, or price mention.
              </p>
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
              Customer's brain scans for alignment:
            </h3>
          </div>
          <div className="space-y-3 pl-8">
            {[
              '"Does this match what I pictured?"',
              '"Does this feel right?"',
              '"Would I be proud to own this?"',
            ].map((question, i) => (
              <p key={i} className="text-muted-foreground italic">
                {question}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proper vs Misses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Proper Presentation */}
        <Card className="border-green-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Proper presentation signals:
            </h3>
            <div className="space-y-2">
              {properPresentation.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Small Misses */}
        <Card className="border-red-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Small misses create doubt:
            </h3>
            <div className="space-y-2">
              {smallMisses.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* When Right vs Wrong */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
          <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
            When presentation is right:
          </h4>
          <p className="text-sm text-muted-foreground">
            Customer focuses on how it drives, fits their life, feels to sit in
          </p>
        </div>
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
          <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
            When wrong:
          </h4>
          <p className="text-sm text-muted-foreground">
            Customer questions the decision itself
          </p>
        </div>
      </div>
    </div>
  );
}
