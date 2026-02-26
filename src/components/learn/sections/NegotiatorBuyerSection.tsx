import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export function NegotiatorBuyerSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">The Deal-Hunter (The Negotiator)</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          This customer measures success by the deal itself. They may love the car, but they won't feel good about buying it unless they believe they won the negotiation.
        </p>
      </div>

      <Card className="border-emerald-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">What Drives Them</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Laser-focused on price, incentives, and monthly payment</li>
            <li>• Shops multiple dealerships and uses competing offers</li>
            <li>• Motivated by rebates, discounts, and trade-in value</li>
            <li>• The negotiation IS the experience for them</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-green-500/20">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-foreground">Do This</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Provide clear, transparent pricing breakdowns</li>
              <li>✓ Frame value — not just price — in every conversation</li>
              <li>✓ Let them feel like they "earned" the deal</li>
              <li>✓ Use strategic concessions ("Let me see what I can do")</li>
              <li>✓ Highlight savings, incentives, and total value</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-foreground">Don't Do This</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✗ Give your best price immediately — they'll assume there's more</li>
              <li>✗ Act insulted by their counter-offers</li>
              <li>✗ Make them feel like they lost</li>
              <li>✗ Be vague about what's included</li>
              <li>✗ Rush to numbers before building value</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Closing Approach</h3>
          </div>
          <p className="text-muted-foreground">
            <strong>Make them feel like they won.</strong> "I went to bat for you on this one — this is a strong deal and you should feel great about it." The Negotiator needs the story of how they got a deal nobody else could get.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">🔍 Signals to Watch For</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• First question is about price or "best offer"</li>
            <li>• They mention other dealers or competing quotes</li>
            <li>• They ask "Is that the best you can do?" multiple times</li>
            <li>• They focus on monthly payments rather than the vehicle</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
