import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, MessageSquare, Target, Shield, ArrowRight, AlertTriangle, Users } from "lucide-react";

export function DisclosureSection() {
  const coreRules = [
    "Acknowledge the trade",
    "State the facts",
    "Move on",
  ];

  const whatWeDoNotDo = [
    "Tone change",
    "Pause",
    "Explanation",
    "Eye contact hold",
  ];

  const aeairSteps = [
    {
      letter: "A",
      title: "Acknowledge (Alignment First)",
      script: '"We want the most we can for your vehicle too. That\'s exactly why we use a third-party, live market appraisal with real-time regional pricing."',
      why: "Immediately aligns you and the customer. Removes \"dealer vs customer\". Reinforces shared goal.",
    },
    {
      letter: "E",
      title: "Explain (Process, Not Defense)",
      script: '"They look at what vehicles like yours are actually selling for right now, not asking prices. To get the most accurate number, the key is making sure the information going in is right. Correct mileage, options, history, and true condition, so the vehicle is represented correctly."',
      why: "Keeps the focus on inputs, not intent. Reinforces accuracy over argument. Connects directly back to Step 2 behavior.",
    },
    {
      letter: "A",
      title: "Anchor (Market Reality)",
      script: '"Based on their regional data, similar vehicles are trading in the $X to $Y range. After factoring in condition and recon, your vehicle\'s actual cash value comes in around $Z."',
      why: "Delivery: Calm. Matter-of-fact. No pause. No emphasis on the number. The anchor is context, not pressure.",
    },
    {
      letter: "I",
      title: "Invite (Partnership & Transparency)",
      script: '"Let\'s review the third-party report together. If anything looks off, we\'ll update it. We\'re on the same side of getting you the most accurate value possible."',
      why: "Keeps control while offering transparency. Signals confidence in the process. Invites collaboration without reopening negotiation.",
    },
    {
      letter: "R",
      title: "Reality (What We Could Buy Today)",
      script: '"Let me show you something that usually helps put this into context. These are similar vehicles we could go buy today at the auction."',
      why: "Grounds the value in real-world dealer alternatives. Answers the unspoken question: \"Is this number actually real?\"",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Step 3: Purchase Disclosure & Objection Handling
        </h2>
        <p className="text-muted-foreground">
          How to present trade values and handle objections with the AEAIR Framework.
        </p>
      </div>

      {/* Core Rule */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">The Core Rule of Disclosure</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            We do not present the trade as a standalone event. We:
          </p>
          <div className="flex flex-wrap gap-3">
            {coreRules.map((item, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-primary/20 text-sm font-medium text-primary">
                {item}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 font-medium">
            No buildup. No justification. No silence. Silence invites objection.
          </p>
        </CardContent>
      </Card>

      {/* Verbatim Disclosure Standard */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            How the Trade Is Disclosed (Verbatim Standard)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-foreground italic mb-2">
              "You're trading in a 2015 Toyota Camry LE with 118,000 miles."
            </p>
            <p className="text-foreground italic mb-2">
              "The actual cash value is $8,400."
            </p>
            <p className="text-sm text-muted-foreground italic">
              (continue immediately to the next purchase detail)
            </p>
          </div>
          <p className="text-sm font-medium text-foreground text-center">That's it.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {whatWeDoNotDo.map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border text-center">
                <XCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">No {item.toLowerCase()}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            The trade is treated the same way we treat the vehicle year, the trim, the mileage, the taxes. <strong className="text-foreground">It is a fact, not a moment.</strong>
          </p>
        </CardContent>
      </Card>

      {/* When Objections Appear */}
      <Card className="border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            When Objections Are Allowed to Appear
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Trade objections should not appear during disclosure. They should only surface after we ask for a purchase decision.
          </p>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
            "Based on everything we've gone through, are you comfortable moving forward with the purchase?"
          </div>
          <p className="text-sm text-muted-foreground">
            If a trade objection is raised at that point, it is now:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Isolated", "Specific", "Real"].map((item, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-amber-500/20 text-sm font-medium text-amber-700 dark:text-amber-300">
                {item}
              </span>
            ))}
          </div>
          <p className="text-sm font-medium text-foreground text-center">That's when we address it.</p>
        </CardContent>
      </Card>

      {/* What We Do Not Do */}
      <Card className="border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            What We Do NOT Do During Disclosure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Rehash the entire appraisal",
              "Emotionally re-engage the number",
              "Get defensive or desperate",
              "Allow them to introduce a negotiating anchor",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Step 3 is not about selling the trade value. It's about stating facts, maintaining flow, protecting momentum, and asking for a decision at the right time.
          </p>
          <p className="text-sm font-medium text-foreground mt-2 text-center">
            Objections belong after the disclosure, not during it. When the process is trusted, the number doesn't need defending.
          </p>
        </CardContent>
      </Card>

      {/* AEAIR Framework */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            AEAIR Framework: Market Value Alignment Script
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Used only after the purchase disclosure is complete, a decision has been requested, and a trade-related objection is clearly raised and isolated.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/30 border mb-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">The goal is not to "win" the objection.</strong> The goal is to re-anchor the customer to the process, re-establish partnership, shift the conversation from opinion back to market reality, and move forward collaboratively.
            </p>
          </div>

          {aeairSteps.map((step, i) => (
            <div key={i} className="border-l-4 border-l-primary/50 pl-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">{step.letter}</span>
                </div>
                <h4 className="font-semibold text-foreground">{step.title}</h4>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 italic text-foreground">
                {step.script}
              </div>
              <div className="flex gap-2">
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{step.why}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reality Step Detail */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            How to Show the Reality (If Needed)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Show similar vehicles that match:</p>
          <div className="grid grid-cols-2 gap-3">
            {["Similar year", "Similar mileage", "Similar trim / equipment", "Similar condition band"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm italic text-foreground mb-2">
              "These are vehicles similar to yours that dealers are actually buying right now. You'll notice they're trading in this general range. When we line that up with your vehicle's condition and cost to market, your ACV lands right in line with these."
            </p>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Then stop talking. Let the data speak.</p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            No challenge. No comparison to the customer personally. Just market reality.
          </p>
        </CardContent>
      </Card>

      {/* Key Takeaway */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-center text-lg font-medium text-foreground mb-2">
          Disclosure is about momentum. AEAIR is about partnership.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          When done correctly, objections do not surface during disclosure. They surface only when a decision is requested — and that's when you address them with confidence.
        </p>
      </div>
    </div>
  );
}
