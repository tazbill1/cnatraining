import { Card, CardContent } from "@/components/ui/card";
import { fullBaseStatement } from "@/lib/baseStatementContent";

export function BaseStatementPillarsSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          The Script — Part 2: Two Pillars & Close
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The setup, the two pillars, and the transition close complete the Base Statement.
        </p>
      </div>

      {/* The Setup */}
      <Card className="border-muted">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">4</div>
            <h3 className="font-semibold text-foreground text-lg">The Setup</h3>
          </div>
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
            <p className="text-sm font-semibold text-primary mb-1">SAY:</p>
            <p className="text-foreground italic">"We focus on two big things that matter most to our customers:"</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">💡 Coaching:</span>
            <span className="text-muted-foreground">This is a transition line. It creates anticipation. Brief pause after this before moving to the two pillars.</span>
          </div>
        </CardContent>
      </Card>

      {/* Pillar 1 */}
      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">5</div>
            <h3 className="font-semibold text-foreground text-lg">Pillar 1 — The Buying Experience</h3>
          </div>
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-primary mb-1">SAY:</p>
            <p className="text-foreground italic">"First — giving you a great buying experience."</p>
            <p className="text-foreground italic">"We'll help you find the RIGHT vehicle — one that fits your needs, your dreams, and becomes part of the incredible memories you'll make along the way."</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">💡 Coaching:</span>
            <span className="text-muted-foreground">Emphasize "RIGHT" — it signals that you're not just trying to sell any car, you're trying to find THEIR car. The "memories" line connects the vehicle to their life, not just a transaction.</span>
          </div>
        </CardContent>
      </Card>

      {/* Pillar 2 */}
      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">6</div>
            <h3 className="font-semibold text-foreground text-lg">Pillar 2 — The Ownership Experience</h3>
          </div>
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-primary mb-1">SAY:</p>
            <p className="text-foreground italic">"Second — delivering a great ownership experience."</p>
            <p className="text-foreground italic">"We care just as much about how you feel owning this vehicle years from now as we do today."</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">💡 Coaching:</span>
            <span className="text-muted-foreground">This is where you separate yourself from every other dealership. Most customers expect to be forgotten after the sale. This line tells them you won't.</span>
          </div>
        </CardContent>
      </Card>

      {/* The Close */}
      <Card className="border-muted">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">7</div>
            <h3 className="font-semibold text-foreground text-lg">The Close — Transition</h3>
          </div>
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
            <p className="text-sm font-semibold text-primary mb-1">SAY:</p>
            <p className="text-foreground italic">"There are a lot of ways we bring this commitment to life, and I'm excited to show you how we take care of you every step of the way."</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">💡 Coaching:</span>
            <span className="text-muted-foreground">End with energy. This line bridges into whatever comes next — the CNA, the walkaround, the test drive. It should feel like an invitation, not a conclusion.</span>
          </div>
        </CardContent>
      </Card>

      {/* Full Script for Reference */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground text-lg">📝 Full Script — Uninterrupted</h3>
          <p className="text-sm text-muted-foreground mb-3">Use this version for memorization and practice:</p>
          <div className="bg-card rounded-lg p-5 border">
            <p className="text-foreground italic leading-relaxed whitespace-pre-line">{fullBaseStatement}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
