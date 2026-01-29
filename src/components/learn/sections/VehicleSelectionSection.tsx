import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export function VehicleSelectionSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Proper Vehicle Selection Theory
        </h2>
        <p className="text-muted-foreground">
          Understanding the intentional approach to helping customers find the right vehicle.
        </p>
      </div>

      {/* Definition Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Definition</h3>
              <p className="text-muted-foreground">
                An <strong className="text-foreground">intentional process</strong> using Customer Needs Analysis 
                information to understand the customer's vehicle choice and build 
                <strong className="text-foreground"> excitement and confidence</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Principle */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">Core Principle</h3>
          <blockquote className="text-lg italic text-muted-foreground border-l-2 border-muted pl-4">
            "Always start with the customer's choice. Honor their research."
          </blockquote>
        </CardContent>
      </Card>

      {/* Rule of Alternatives */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">Rule of Alternatives</h3>
          </div>
          <p className="text-muted-foreground">
            Always prepare <strong className="text-foreground">2 thoughtful alternatives</strong> aligned 
            with their needs, chosen <strong className="text-foreground">BEFORE</strong> the customer 
            sees the first vehicle.
          </p>
          <p className="text-sm text-muted-foreground">
            This shows intentional preparation and keeps momentum going throughout the process.
          </p>
        </CardContent>
      </Card>

      {/* Priority */}
      <Card className="bg-green-500/5 border-green-500/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Priority: Available Vehicles</h3>
          <p className="text-muted-foreground mb-4">
            Available vehicles (physically present, ready to show/drive) maintain momentum.
          </p>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="font-medium text-green-700 dark:text-green-400">
              Remember: "Time kills deals"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What it's NOT */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">What it's NOT about:</h3>
        <div className="space-y-2">
          {[
            "Scrolling websites with the customer",
            'Searching inventory together',
            '"Fixing" their choice',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
