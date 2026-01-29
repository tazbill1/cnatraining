import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Route, 
  Wrench, 
  Truck, 
  Users, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";

const steps = [
  {
    id: "step1",
    number: 1,
    title: "Market Reality (MMR & Wholesale Data)",
    icon: BarChart3,
    content: {
      intro: "MMR = Manheim Market Report. It shows the liquid value based on actual auction transactions across the country.",
      keyInsight: "MMR is not a single number. It's a range based on condition tier (Clean, Average, Rough), mileage bracket, vehicle history, and current market timing.",
      example: {
        title: "Example: 2018 Honda Accord EX-L with 65,000 miles",
        items: [
          { condition: "Clean condition MMR", value: "$18,500" },
          { condition: "Average condition MMR", value: "$16,800" },
          { condition: "Rough condition MMR", value: "$14,200" },
        ],
      },
      warning: "If you overstate condition, you're not protecting profit - you're creating a loss when reality hits.",
      prevents: [
        "Unexpected reconditioning costs",
        "Arbitration issues at auction",
        "Wholesale losses",
        "Vehicles sitting in inventory too long",
      ],
    },
  },
  {
    id: "step2",
    number: 2,
    title: "Exit Strategy",
    icon: Route,
    content: {
      intro: "Decision Point: Retail or Wholesale?",
      basedOn: [
        "Accurate condition assessment",
        "Reconditioning needs",
        "Current market demand",
        "Brand fit with dealership",
        "Speed to sell expectations",
      ],
      outcomes: {
        clean: [
          "Higher MMR tier placement",
          "Retail path justification",
          "Reduced cost to market",
          "Faster turn time",
        ],
        rough: [
          "Lower MMR band placement",
          "Higher recon investment needed",
          "Wholesale path more likely",
          "Margin risk increases",
        ],
      },
    },
  },
  {
    id: "step3",
    number: 3,
    title: "Cost to Market",
    icon: Wrench,
    content: {
      intro: "Expected Recon vs. Actual Recon - This is where profit is protected or destroyed.",
      expected: {
        title: "Expected recon = What you can see:",
        items: [
          "Visible wear and tear",
          "Mileage-appropriate service",
          "Obvious cosmetic issues",
          "Tire condition",
        ],
      },
      actual: {
        title: "Actual recon = What the shop finds:",
        items: [
          "Mechanical issues discovered during inspection",
          "Safety items (brakes, suspension, lights)",
          "Hidden cosmetic damage",
          "Required state inspection items",
        ],
      },
      includes: [
        "Detail and reconditioning labor",
        "Safety and mechanical repairs",
        "Cosmetic touch-ups",
        "Shop labor hours",
        "Time vehicle sits off the market",
      ],
    },
  },
  {
    id: "step4",
    number: 4,
    title: "Fees, Transport & Risk (Wholesale Path)",
    icon: Truck,
    content: {
      intro: "If the vehicle goes to auction, these costs come into play:",
      fees: [
        { title: "Auction fees", desc: "Seller fees (typically $300-500), title and documentation fees" },
        { title: "Transportation", desc: "Getting the vehicle to and from auction" },
        { title: "Arbitration risk", desc: "Buyer can challenge condition - if arbitrated, it comes back with additional costs" },
        { title: "Market volatility", desc: "Values can shift between taking the trade and selling it" },
      ],
      keyPrinciple: "Focus on net proceeds after all costs, not gross sale price.",
    },
  },
  {
    id: "step5",
    number: 5,
    title: "Competitive Set & Market Position",
    icon: Users,
    content: {
      intro: "Market analysis considers:",
      factors: [
        "Similar vehicles currently for sale in the region",
        "Local pricing trends",
        "Supply vs. demand balance",
        "Average days-to-sell for this vehicle type",
      ],
      determines: [
        "How aggressively to price",
        "Realistic margin expectations",
        "Expected turn time",
        "Movement speed",
      ],
    },
  },
  {
    id: "step6",
    number: 6,
    title: "Profit Earned, Not Assumed",
    icon: TrendingUp,
    content: {
      intro: "Profit only exists after:",
      afterSteps: [
        "True market value is established (Step 1)",
        "Condition is accurately reported (Step 2)",
        "Recon costs are deducted (Step 3)",
        "Fees and risk are accounted for (Step 4)",
        "Market position is understood (Step 5)",
      ],
      whyDifferent: {
        title: "This is why two similar vehicles have different values:",
        reasons: [
          "Different condition = different MMR tier",
          "Different recon needs = different cost to market",
          "Different market timing = different demand",
          "Different accuracy = different risk",
        ],
      },
    },
  },
];

export function TradeValueSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          How Trade Values Are Actually Determined
        </h2>
        <p className="text-muted-foreground">
          This is the process that happens behind the scenes. Understanding it helps you explain values confidently.
        </p>
      </div>

      {/* Steps Accordion */}
      <Accordion type="single" collapsible className="space-y-3">
        {steps.map((step) => (
          <AccordionItem
            key={step.id}
            value={step.id}
            className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {step.number}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <step.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-left text-foreground">
                    {step.title}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pl-14">
              {step.id === "step1" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{step.content.intro}</p>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium text-foreground">{step.content.keyInsight}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground mb-2">{step.content.example.title}</p>
                    <div className="space-y-1">
                      {step.content.example.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.condition}:</span>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">{step.content.warning}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Accurate condition prevents:</p>
                    <div className="space-y-1">
                      {step.content.prevents.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step.id === "step2" && (
                <div className="space-y-4">
                  <p className="text-foreground font-medium">{step.content.intro}</p>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">This decision is based on:</p>
                    <div className="space-y-1">
                      {step.content.basedOn.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Clean vehicle supports:</p>
                      <div className="space-y-1">
                        {step.content.outcomes.clean.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Rough vehicle indicates:</p>
                      <div className="space-y-1">
                        {step.content.outcomes.rough.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.id === "step3" && (
                <div className="space-y-4">
                  <p className="text-foreground font-medium">{step.content.intro}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-2">{step.content.expected.title}</p>
                      <div className="space-y-1">
                        {step.content.expected.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-primary">•</span>
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-2">{step.content.actual.title}</p>
                      <div className="space-y-1">
                        {step.content.actual.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-primary">•</span>
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium text-foreground mb-2">Cost to market includes:</p>
                    <div className="space-y-1">
                      {step.content.includes.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step.id === "step4" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{step.content.intro}</p>
                  <div className="space-y-3">
                    {step.content.fees.map((fee, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground">{fee.title}</p>
                        <p className="text-xs text-muted-foreground">{fee.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium text-primary">{step.content.keyPrinciple}</p>
                  </div>
                </div>
              )}

              {step.id === "step5" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{step.content.intro}</p>
                  <div className="space-y-1">
                    {step.content.factors.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-primary">•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">This analysis determines:</p>
                    <div className="space-y-1">
                      {step.content.determines.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step.id === "step6" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{step.content.intro}</p>
                  <div className="space-y-1">
                    {step.content.afterSteps.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">{step.content.whyDifferent.title}</p>
                    <div className="space-y-1">
                      {step.content.whyDifferent.reasons.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-primary">•</span>
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Visual Flow */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 text-center">
            The Complete Flow
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {step.number}. {step.title.split(" ")[0]}
                </div>
                {i < steps.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
