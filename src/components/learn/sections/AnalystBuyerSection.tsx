import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

export function AnalystBuyerSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">The Research-Driven Buyer (The Analyst)</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          This customer did their homework before they ever set foot in your store. They know the specs, the reviews, the competitor pricing — probably better than you do.
        </p>
      </div>

      <Card className="border-blue-500/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">What Drives Them</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Highly informed and data-focused</li>
            <li>• Compares specs, pricing, reviews, and reliability ratings</li>
            <li>• Values transparency and detailed information above all</li>
            <li>• Will test your knowledge — if you can't keep up, you lose credibility</li>
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
              <li>✓ Acknowledge and validate their research</li>
              <li>✓ Provide comparison sheets and data they haven't seen</li>
              <li>✓ Be honest about trade-offs between vehicles</li>
              <li>✓ Use logical explanations, not emotional appeals</li>
              <li>✓ Let them lead the conversation — then add value</li>
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
              <li>✗ Make vague or unsupported claims</li>
              <li>✗ Rush them through the process</li>
              <li>✗ Use high-pressure tactics</li>
              <li>✗ Dismiss their research or try to "one-up" them</li>
              <li>✗ Wing it on specs — they'll catch you</li>
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
            <strong>Validate their decision.</strong> Say something like: "Based on everything you've researched, this checks every box. You've clearly done your homework — I think you've made a great choice." The Analyst doesn't want to feel sold. They want to feel <em>confirmed.</em>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground">🔍 Signals to Watch For</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• They arrive with printed specs or a phone full of notes</li>
            <li>• They ask detailed questions about reliability, resale value, or warranty</li>
            <li>• They compare your numbers to what they've found online</li>
            <li>• They seem calm and methodical, not emotional</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
