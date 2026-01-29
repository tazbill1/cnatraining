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
  TrendingUp 
} from "lucide-react";

const steps = [
  {
    id: "step1",
    number: 1,
    title: "Market Reality (MMR & Wholesale Data)",
    icon: BarChart3,
    content: [
      "MMR = Manheim Market Report: Liquid value from actual auction transactions",
      "Not a flat price - it's a range based on condition, mileage, history, market timing",
      "Condition reporting directly impacts value",
    ],
  },
  {
    id: "step2",
    number: 2,
    title: "Exit Strategy",
    icon: Route,
    content: [
      "Decision: Retail or wholesale?",
      "Based on: condition accuracy, recon needs, demand, brand fit, speed to sell",
    ],
  },
  {
    id: "step3",
    number: 3,
    title: "Cost to Market",
    icon: Wrench,
    content: [
      "Expected recon vs. Actual recon",
      "Includes: detail, safety items, shop labor, time off market",
      "Gap between expected and actual = where profit is protected or destroyed",
    ],
  },
  {
    id: "step4",
    number: 4,
    title: "Fees, Transport & Risk (Wholesale)",
    icon: Truck,
    content: [
      "Auction fees, transportation, arbitration risk, market volatility",
      "Focus on net proceeds after costs",
    ],
  },
  {
    id: "step5",
    number: 5,
    title: "Competitive Set & Market Position",
    icon: Users,
    content: [
      "Similar vehicles for sale, local pricing, supply vs demand",
      "Determines pricing aggressiveness and movement speed",
    ],
  },
  {
    id: "step6",
    number: 6,
    title: "Profit Earned, Not Assumed",
    icon: TrendingUp,
    content: [
      "Only exists after all previous steps are complete",
      "Why two similar vehicles have different values",
    ],
  },
];

export function TradeValueSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          How Trade Values Are Actually Calculated
        </h2>
        <p className="text-muted-foreground">
          The 6-step process that determines what a trade-in is really worth.
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
              <ul className="space-y-2">
                {step.content.map((item, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Visual Flow */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 text-center">
            The Flow
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
