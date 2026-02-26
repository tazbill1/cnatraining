import { Card, CardContent } from "@/components/ui/card";
import { Heart, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export function EmotionalBuyerSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">The Impulse Buyer (The Emotional Buyer)</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          This customer buys with their heart first and rationalizes later. Excitement, aesthetics, and the "feel" of the car matter more than the spreadsheet.
        </p>
      </div>

      <Card className="border-amber-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">What Drives Them</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Driven by excitement, appearance, and experience</li>
            <li>• Makes faster decisions — often same-day purchases</li>
            <li>• Heavily influenced by test drives and emotional connection</li>
            <li>• Responds to lifestyle messaging and enthusiasm from you</li>
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
              <li>✓ Mirror their excitement and energy</li>
              <li>✓ Get them in the driver's seat fast</li>
              <li>✓ Paint the picture: "Imagine pulling into your driveway…"</li>
              <li>✓ Focus on color, design, tech, and how it feels</li>
              <li>✓ Keep the momentum — don't let them cool off</li>
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
              <li>✗ Drown them in specs and data</li>
              <li>✗ Suggest they "sleep on it"</li>
              <li>✗ Kill the energy with long waits or paperwork delays</li>
              <li>✗ Switch vehicles after they've connected with one</li>
              <li>✗ Be monotone or low-energy</li>
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
            <strong>Maintain momentum and close while excitement is high.</strong> "I can see you love this one — let's make it yours today." Don't overthink it. The Emotional Buyer wants permission to say yes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">🔍 Signals to Watch For</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• They light up when they see the car — big smile, touching the paint</li>
            <li>• They talk about how it looks, not what it costs</li>
            <li>• They want to test drive immediately</li>
            <li>• They say things like "I love it" or "This is the one"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
