import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export function LoyalBuyerSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">The Brand-Loyal Buyer (The Repeat Customer)</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          This customer already knows what they want — and it's the same brand they've driven for years. Your job isn't to sell them on the brand. It's to make the experience seamless.
        </p>
      </div>

      <Card className="border-purple-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">What Drives Them</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Prefers a specific brand and returns to it repeatedly</li>
            <li>• Values familiarity, trust, and consistency</li>
            <li>• Less likely to cross-shop aggressively</li>
            <li>• Wants to feel recognized and appreciated for their loyalty</li>
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
              <li>✓ Acknowledge their history with the brand</li>
              <li>✓ Streamline the process — they don't need the full pitch</li>
              <li>✓ Focus on what's new and improved in the latest model</li>
              <li>✓ Make them feel like a VIP, not a first-timer</li>
              <li>✓ Reference their previous vehicle positively</li>
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
              <li>✗ Try to switch them to a different brand</li>
              <li>✗ Give them the same spiel you give a walk-in</li>
              <li>✗ Make the process longer than it needs to be</li>
              <li>✗ Ignore their loyalty or treat them like a stranger</li>
              <li>✗ Over-explain features they already know</li>
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
            <strong>Keep it simple and efficient.</strong> "You've been with [Brand] for years — you know what you're getting. Let's get you into the new one and make it easy." Loyalty customers close when friction is removed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">🔍 Signals to Watch For</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• "I've always driven [Brand]"</li>
            <li>• They come in knowing the exact model and trim</li>
            <li>• They mention their previous vehicle from the same brand</li>
            <li>• They're less interested in comparisons</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
