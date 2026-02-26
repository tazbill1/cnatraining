import { Card, CardContent } from "@/components/ui/card";
import { Users, Brain, Target } from "lucide-react";

export function BuyerTypeIntroSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Why Buyer Types Matter</h2>
        <p className="text-muted-foreground text-lg">
          Every customer who walks onto your lot has a different buying style. Understanding that style is the difference between a smooth close and a lost deal.
        </p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">The Core Idea</h3>
              <p className="text-muted-foreground">
                People don't buy cars the same way they buy groceries. A car purchase is emotional, financial, and personal — all at once. The way a customer approaches this decision tells you everything about how to serve them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">5 Behavioral Types</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Research-Driven, Deal-Hunter, Emotional, Brand-Loyal, and Urgent — each with distinct motivations, triggers, and closing strategies.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Adapt in Real Time</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll learn to spot signals within the first few minutes of conversation and adjust your approach before the customer even realizes you've done it.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">What Happens When You Get It Right</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span>Customers feel understood — not "sold"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span>Objections decrease because you've preempted them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span>Close rates go up without being pushy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span>CSI scores improve because the experience matched the customer</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
