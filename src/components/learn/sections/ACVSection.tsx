import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Shield, TrendingUp, MessageSquare, AlertTriangle } from "lucide-react";

export function ACVSection() {
  const tradeAllowancePoints = [
    "A deal number that can be influenced by discounts, rebates, and deal structure",
    "Flexible based on negotiation",
    "NOT the true vehicle value",
    "Can vary dramatically between dealers",
  ];

  const tradeAllowanceProblems = [
    "Not transparent",
    "Difficult to explain when questioned",
    "Damages trust when customers research",
    'Creates "gotcha" moments',
  ];

  const acvBasedOn = [
    "Current wholesale sales data",
    "Actual mileage",
    "True condition",
    "Equipment and options",
    "Current market demand",
    "Reconditioning costs",
  ];

  const whyACV = [
    { title: "Transparent", desc: "Market-based and verifiable" },
    { title: "Consistent", desc: "Same approach for all customers" },
    { title: "Easy to Explain", desc: "Backed by real data" },
    { title: "Builds Trust", desc: "Defensible when challenged" },
  ];

  const explanationSteps = [
    {
      step: 1,
      title: "Normalize the difference",
      script: '"I understand - trade values can feel different than what we see online, and here\'s why that happens."',
    },
    {
      step: 2,
      title: "Explain the disconnect",
      script: '"Sites like KBB show retail asking prices - what dealers hope to sell for. ACV shows what vehicles actually sell for at wholesale."',
    },
    {
      step: 3,
      title: "Position ACV as market-based",
      script: '"We use a system connected to live auction data. It shows what dealers are actually paying today in our region."',
    },
    {
      step: 4,
      title: "Emphasize accuracy benefits them",
      script: '"The more accurate we are about condition and features, the stronger the value. That\'s why we do a thorough evaluation."',
    },
    {
      step: 5,
      title: "Offer transparency",
      script: '"I can show you the market report. If anything looks off, we\'ll correct it."',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Understanding the Critical Difference
        </h2>
        <p className="text-muted-foreground">
          ACV vs Trade Allowance - know which one builds trust and which one destroys it.
        </p>
      </div>

      {/* Two Column Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trade Allowance */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              Trade Allowance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">What it is:</h4>
              <div className="space-y-2">
                {tradeAllowancePoints.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                The problem:
              </h4>
              <div className="space-y-2">
                {tradeAllowanceProblems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ACV */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              ACV (Actual Cash Value)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">What it is:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Real wholesale market value based on actual auction transactions.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Based on:</h4>
              <div className="space-y-2">
                {acvBasedOn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why ACV is Better */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Why We Use ACV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {whyACV.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-primary/5 border border-primary/10"
              >
                <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Explanation Framework */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            The Customer Explanation Framework
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            When a customer asks "Why is my trade value only $X?" - use this 5-step process:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {explanationSteps.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{step.step}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
                  {step.script}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Handling Common Objections */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Handling Common Objections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objection 1 */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <h4 className="font-medium text-foreground mb-2">
              "The other dealer offered me more."
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="italic">"That's worth understanding. A few things could be happening:</p>
              <ul className="pl-4 space-y-1">
                <li>• They may be showing trade allowance, not ACV</li>
                <li>• They might be adding rebates or discounts into the number</li>
                <li>• Our ACV is based on what we could actually sell it for</li>
              </ul>
              <p className="italic">The question is: which number is real? Let me show you the market data so you can see where this value comes from."</p>
            </div>
          </div>

          {/* Objection 2 */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <h4 className="font-medium text-foreground mb-2">
              "But KBB says my car is worth $X."
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="italic">"KBB is a great research tool - and what you're seeing is the retail range, which is what dealers ask for.</p>
              <p className="italic">ACV is different. It reflects wholesale value - what dealers pay when buying vehicles.</p>
              <p className="italic">Think of it like this: if you were selling your house, the listing price and the offer price are different. Same principle here.</p>
              <p className="italic">Let me show you what similar vehicles are actually selling for at auction right now."</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaway */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-center text-lg font-medium text-foreground">
          ACV = Market Reality. Trade Allowance = Flexible Deal Number.
          <br />
          <span className="text-muted-foreground text-base">
            Always lead with transparency - it builds trust that lasts.
          </span>
        </p>
      </div>
    </div>
  );
}
