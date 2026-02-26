import { Card, CardContent } from "@/components/ui/card";
import { Zap, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export function UrgentBuyerSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">The Urgent Buyer (The Life-Event Buyer)</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Something happened — an accident, a breakdown, a new baby, a relocation. This customer needs a vehicle now, and every minute of delay is frustration.
        </p>
      </div>

      <Card className="border-rose-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">What Drives Them</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Needs a vehicle quickly due to life circumstances</li>
            <li>• Focused on speed, availability, and financing approval</li>
            <li>• Less concerned with getting the "perfect" deal</li>
            <li>• Stress is high — empathy matters more than expertise</li>
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
              <li>✓ Acknowledge their situation with empathy</li>
              <li>✓ Present solutions immediately — "Here's what I can do right now"</li>
              <li>✓ Pre-qualify financing quickly</li>
              <li>✓ Have 2-3 ready options based on their budget and needs</li>
              <li>✓ Remove every unnecessary step from the process</li>
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
              <li>✗ Make them wait for anything avoidable</li>
              <li>✗ Upsell aggressively — they're stressed, not browsing</li>
              <li>✗ Ask unnecessary CNA questions</li>
              <li>✗ Treat their urgency as leverage</li>
              <li>✗ Be slow to respond or follow up</li>
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
            <strong>Remove obstacles and move efficiently.</strong> "I know you need to get this handled. Let me take care of everything — you'll be driving out of here today." The Urgent Buyer closes when you make the hard thing easy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">🔍 Signals to Watch For</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• "My car was totaled" or "I need something today"</li>
            <li>• They arrived via Uber, rental, or someone else's car</li>
            <li>• They ask about same-day financing and availability</li>
            <li>• They seem stressed, not excited</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
