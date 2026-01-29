import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Shield, TrendingUp, MessageSquare, AlertTriangle, Lightbulb, Users, ArrowRight } from "lucide-react";

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
    "What similar vehicles are actually selling for right now",
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
      title: "Set the Frame",
      script: '"You may hear different dealerships talk about trade value differently. Some use allowances, we use actual market value."',
      note: "This normalizes the difference without criticizing anyone.",
    },
    {
      step: 2,
      title: "Explain Allowances Simply",
      script: '"An allowance is a number that can be influenced by discounts, rebates, or how the deal is structured. It can look higher, but it doesn\'t always reflect what the vehicle is actually worth."',
      note: "No judgment. Just clarity.",
    },
    {
      step: 3,
      title: "Explain Why ACV Is Different",
      script: '"We use ACV because it\'s based on real sales happening right now. Vehicles like yours, with similar mileage and condition, selling in today\'s market."',
      note: "Positions ACV as: Honest, verifiable, and fair.",
    },
    {
      step: 4,
      title: "Address Online Tools (KBB, etc.)",
      script: '"Online tools are helpful starting points, but they\'re rules of thumb. They don\'t see condition, real-time demand, or what vehicles are actually selling for today."',
      note: "Online tools = general. ACV = specific. Today's market matters more than averages.",
    },
    {
      step: 5,
      title: "Reinforce the Big Picture",
      script: '"Different dealerships may explain the number differently, but at the end of the day, the vehicle will sell at the same market. We just prefer to show you the real number upfront."',
      note: "Removes emotion and reframes as education, not negotiation.",
    },
  ];

  const whatThisMeansForYou = [
    "You no longer feel the need to defend the number",
    "You don't sound hesitant or unsure when a customer brings up another offer",
    "You don't need to position yourself against another dealership",
    "You're able to explain, not argue",
  ];

  const mindsetPoints = [
    "Trust",
    "Confidence", 
    "Long-term relationships",
    "Repeat and referral business",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ACV vs Trade Allowance
        </h2>
        <p className="text-muted-foreground">
          Two very different approaches to trade value - and why understanding the difference changes everything.
        </p>
      </div>

      {/* Context Setting */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed">
            Trade value is one of the most confusing and mistrusted parts of buying a car. Not because customers are unreasonable, 
            but because the industry explains it poorly. Most frustration comes from different dealerships using different methods, 
            customers hearing bigger numbers with no explanation, and salespeople struggling to explain why numbers don't match.
          </p>
          <p className="text-foreground font-medium mt-3">
            It's important you can explain trade value in a way that feels fair, transparent, and professional.
          </p>
        </CardContent>
      </Card>

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
            <p className="text-xs text-muted-foreground mt-1">What Many Dealerships Use</p>
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
            
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-300 italic">
                "They gave me way more for my trade."
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                In reality, the extra money often came from somewhere else in the deal.
              </p>
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
            <p className="text-xs text-muted-foreground mt-1">What We Use</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                ACV is the real, wholesale market value of the vehicle today, in its actual condition.
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

            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                ACV answers one simple question:
              </p>
              <p className="text-sm text-muted-foreground mt-1 italic">
                "If this vehicle went to the open wholesale market today, what would it truly bring?"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why ACV is Better */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Why We Use ACV (And Not Allowances)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
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
          <p className="text-sm text-muted-foreground text-center">
            At the end of the day: We all buy vehicles from the same places. We all sell them at the same wholesale markets. We all pay roughly the same money.
          </p>
        </CardContent>
      </Card>

      {/* Customer Explanation Framework */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Explaining This to a Customer (The Right Way)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            A 5-step process for building understanding, not defensiveness:
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
                <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg mb-2">
                  {step.script}
                </p>
                <p className="text-xs text-muted-foreground">{step.note}</p>
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
            <h4 className="font-medium text-foreground mb-3">
              "The other dealer offered me more."
            </h4>
            <div className="text-sm text-muted-foreground space-y-3">
              <p className="italic bg-primary/5 p-3 rounded-lg">"That makes sense. Different stores structure trade numbers differently. What we focus on is the actual market value of the vehicle so you can compare apples to apples."</p>
              <p className="italic bg-primary/5 p-3 rounded-lg">"That's worth understanding. A few things could be happening: They may be showing trade allowance, not ACV. They might be adding rebates or discounts into the number. Our ACV is based on what we could actually sell it for. The question is: which number is real? Let me show you the market data so you can see where this value comes from."</p>
              <div className="flex gap-2 mt-2">
                <ArrowRight className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs">Avoids criticizing another dealership. Reframes the comparison around clarity, not competition.</p>
              </div>
            </div>
          </div>

          {/* Objection 2 */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <h4 className="font-medium text-foreground mb-3">
              "But KBB says my car is worth $X."
            </h4>
            <div className="text-sm text-muted-foreground space-y-3">
              <p className="italic bg-primary/5 p-3 rounded-lg">"Those tools are a great starting point. What we're doing here is narrowing it down to what your specific vehicle is worth today, in this market, in this condition."</p>
              <p className="italic bg-primary/5 p-3 rounded-lg">"KBB is a great research tool - and what you're seeing is the retail range, which is what dealers ask for. ACV is different. It reflects wholesale value - what dealers pay when buying vehicles. Think of it like this: if you were selling your house, the listing price and the offer price are different. Same principle here. Let me show you what similar vehicles are actually selling for at auction right now."</p>
              <div className="flex gap-2 mt-2">
                <ArrowRight className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs">Acknowledges the tool's usefulness. Positions ACV as refinement, not contradiction.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What This Means For You */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Why This Matters for You as a Salesperson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When you truly understand ACV versus trade allowance, something important shifts:
          </p>
          <div className="space-y-2">
            {whatThisMeansForYou.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Not because you're trying to be right, but because what you're saying makes sense. <strong className="text-foreground">Customers don't need the highest number first. They need a number they can understand and trust.</strong>
          </p>
        </CardContent>
      </Card>

      {/* The Mindset to Remember */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <h4 className="font-semibold text-foreground mb-3 text-center">The Mindset to Remember</h4>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Trade allowances often feel good in the moment because they sound bigger. ACV feels better over time because it's real. 
          Transparency may not always get the biggest initial reaction, but it builds something far more valuable:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {mindsetPoints.map((point, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-primary/20 text-sm font-medium text-primary">
              {point}
            </span>
          ))}
        </div>
        <p className="text-center text-sm text-foreground font-medium mt-4">
          And that's how you stop "selling cars" and start building a book of customers.
        </p>
      </div>
    </div>
  );
}
