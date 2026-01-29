import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, XCircle, Lightbulb, Clock, Target } from "lucide-react";

export function VehicleSelectionSection() {
  const yourRoleIs = [
    "Use product knowledge to ask better questions",
    "Ensure their choice will deliver what they expect",
    "Prepare thoughtful alternatives that align with their needs",
  ];

  const yourRoleIsNot = [
    "Scroll through websites with the customer",
    "Search inventory together in real-time",
    '"Fix" their choice',
    "Convince them they're wrong",
  ];

  const whyAlternativesMatter = [
    "You remain in control of the conversation",
    "You can pivot smoothly if the first vehicle doesn't work",
    "Customers respect preparation and expertise",
    'You avoid the dreaded "let me check what else we have" moment',
  ];

  const availableVehiclePriorities = [
    "Physically present on the lot",
    "Ready to show immediately",
    "Ready to test drive today",
  ];

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

      {/* What It Actually Is */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">What It Actually Is</h3>
              <p className="text-muted-foreground mb-4">
                Proper vehicle selection is an <strong className="text-foreground">intentional process</strong> that 
                uses information from the Customer Needs Analysis to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Understand why the customer chose their vehicle
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Build excitement and confidence in their decision
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Use product knowledge to ask better questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Ensure the vehicle delivers on expectations
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Principle */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">The Core Principle</h3>
          </div>
          <blockquote className="text-xl italic text-foreground border-l-2 border-primary pl-4">
            "Always start with the customer's choice. Honor their research."
          </blockquote>
        </CardContent>
      </Card>

      {/* Your Role IS / IS NOT */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Role IS NOT */}
        <Card className="border-red-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Your role is NOT to:
            </h3>
            <div className="space-y-2">
              {yourRoleIsNot.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Role IS */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Your role IS to:
            </h3>
            <div className="space-y-2">
              {yourRoleIs.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rule of Alternatives */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">The Rule of Alternatives</h3>
          </div>
          
          <p className="text-foreground font-medium">
            Always prepare <span className="text-amber-600 dark:text-amber-400">2 thoughtful alternatives</span> aligned 
            with the customer's needs.
          </p>
          
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Critical requirement: These alternatives must be chosen <strong>BEFORE</strong> the customer sees the first vehicle.
            </p>
          </div>

          <div className="pt-2">
            <h4 className="font-medium text-foreground mb-3">Why this matters:</h4>
            <div className="space-y-2">
              {whyAlternativesMatter.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority: Available Vehicles */}
      <Card className="border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-foreground">Priority: Available Vehicles</h3>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Focus on vehicles that are:
          </p>
          
          <div className="space-y-2 mb-6">
            {availableVehiclePriorities.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="font-medium text-green-700 dark:text-green-400 mb-2">
              Why? Because momentum matters.
            </p>
            <p className="text-sm text-muted-foreground">
              When you have to say "let me order that" or "it'll be here next week," desire starts to fade.
            </p>
          </div>

          <div className="mt-4 p-4 bg-primary/5 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary">
              "Time kills deals"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
