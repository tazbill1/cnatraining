import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, XCircle, Shield, MessageSquare, Target, Users } from "lucide-react";

export function FramingSection() {
  const whatCustomersObjectTo = [
    "Feeling surprised",
    "Feeling judged",
    "Feeling like the process is arbitrary or subjective",
    "Feeling like the rules changed mid-stream",
  ];

  const whatCustomerShouldUnderstand = [
    "The process is consistent",
    "Every vehicle is evaluated the same way",
    "The appraisal is based on market data and condition",
    "The outcome will be explained, not defended",
  ];

  const whatWeDoNotAsk = [
    "What do you think your car is worth?",
    "What are you hoping to get for it?",
    "Have you done anything that adds value?",
    "What did you see online?",
  ];

  const whyThirdParty = [
    "Removes personalization",
    'Removes "me vs them" dynamics',
    "Establishes neutrality",
    "Reinforces fairness and consistency",
  ];

  const ourRole = [
    "We gather accurate, complete information",
    "We document the vehicle's condition thoroughly",
    "We make sure nothing is overstated or overlooked",
    "We represent the vehicle honestly so it lands correctly in the market",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Step 1: Framing the Conversation
        </h2>
        <p className="text-muted-foreground">
          Setting expectations before the numbers - how to create alignment before information.
        </p>
      </div>

      {/* Core Principle */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">The Core Principle</h3>
          </div>
          <p className="text-lg text-foreground mb-2">
            Trade appraisal is not a negotiation yet. It's an evaluation process.
          </p>
          <p className="text-muted-foreground">
            How we introduce it determines whether the customer leans in — or braces for impact.
          </p>
        </CardContent>
      </Card>

      {/* What Customers Object To */}
      <Card className="border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Customers don't object to numbers first
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">They object to:</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {whatCustomersObjectTo.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-foreground">
              The purpose of the introduction is to remove those fears before they exist.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* The Frame We Must Set */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            The Frame We Must Set Before Any Inspection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Before touching the vehicle, the customer should clearly understand:
          </p>
          <div className="space-y-2">
            {whatCustomerShouldUnderstand.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-300">
              When this frame is set correctly: Resistance drops. Emotion stays low. Explanations feel logical instead of argumentative.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What We Do NOT Do */}
      <Card className="border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            What We Do NOT Do in This Phase
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            To protect the process, we deliberately avoid questions that create emotional anchors or false expectations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-foreground">We do not ask:</p>
          <div className="space-y-2">
            {whatWeDoNotAsk.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-muted-foreground italic">"{item}"</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-700 dark:text-red-300">
              These questions invite negotiation too early, create personal attachment to a number, and turn a scientific process into a debate.
            </p>
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mt-2">
              We do not invite a number before the process runs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Positioning */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Why We Lead With a Third-Party Evaluator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
            "Great news, trade evaluations have become incredibly easy and are very accurate."
          </div>
          <p className="text-sm text-muted-foreground">
            Introducing the appraisal this way accomplishes several things at once:
          </p>
          <div className="space-y-2">
            {whyThirdParty.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm text-muted-foreground">
              The customer should understand that: Every vehicle goes through the same system. The same standards apply to everyone. The outcome is based on data, not judgment.
            </p>
            <p className="text-sm font-medium text-foreground mt-2">
              This prevents the appraisal from feeling subjective or adversarial.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Our Role */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            How We Explain Our Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once the third-party system is established, we clearly define our responsibility:
          </p>
          <div className="space-y-2">
            {ourRole.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm font-medium text-primary">
              Accuracy is what protects value. The more accurate the information, the more accurate the ACV.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What This Does for the Customer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            What This Framing Does for the Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">This framing reassures the customer that:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "The process is designed to be fair",
              'Their vehicle is not being "picked apart"',
              "Accuracy works in their favor",
              "The outcome will be explained clearly",
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-foreground mt-4 text-center">
            It shifts the focus from negotiation to representation.
          </p>
        </CardContent>
      </Card>

      {/* Key Takeaway */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-center text-lg font-medium text-foreground">
          Step 1 is strictly about process alignment, not outcome.
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          When Step 1 is done correctly, Step 2 feels expected — not uncomfortable.
        </p>
      </div>
    </div>
  );
}
