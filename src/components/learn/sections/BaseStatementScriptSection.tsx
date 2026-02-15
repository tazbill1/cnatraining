import { Card, CardContent } from "@/components/ui/card";

interface ScriptPart {
  number: string;
  title: string;
  say: string;
  coachingNote: string;
  alternative?: string;
}

const scriptParts: ScriptPart[] = [
  {
    number: "1",
    title: "Community Connection",
    say: `"We've been a part of [City/Town] for a long time, and we're proud to be part of such an amazing community. Here at [Dealership Name], your experience is our top priority."`,
    coachingNote: `If your dealership is NEW to the area, swap to: "We're new to [City/Town], and we are so excited to be here." Smile when you say it — genuine excitement is contagious.`,
  },
  {
    number: "2",
    title: "Core Mission",
    say: `"At the heart of everything we do is one big goal: to earn your trust and create a lifetime customer."`,
    coachingNote: `This is the anchor line. Slow down here. Let it breathe. This is the single most important sentence in the entire base statement.`,
    alternative: `"Our core focus is to earn your trust and create lifetime customers."`,
  },
  {
    number: "3",
    title: "Differentiation",
    say: `"We know the only way to do that is by doing things differently — and doing them right."`,
    coachingNote: `Pause briefly after "differently." Let the customer wonder what you mean. Then land "and doing them right" with quiet confidence.`,
  },
];

export function BaseStatementScriptSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          The Script — Part 1
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The first three parts of the Base Statement set up who you are, what you stand for, and why you're different.
        </p>
      </div>

      {scriptParts.map((part) => (
        <Card key={part.number} className="border-muted">
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {part.number}
              </div>
              <h3 className="font-semibold text-foreground text-lg">{part.title}</h3>
            </div>

            {/* Say */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
              <p className="text-sm font-semibold text-primary mb-1">SAY:</p>
              <p className="text-foreground italic leading-relaxed">{part.say}</p>
            </div>

            {/* Alternative */}
            {part.alternative && (
              <div className="bg-muted/50 border-l-4 border-muted-foreground/30 rounded-r-lg p-4">
                <p className="text-sm font-semibold text-muted-foreground mb-1">ALTERNATIVE:</p>
                <p className="text-muted-foreground italic">{part.alternative}</p>
              </div>
            )}

            {/* Coaching Note */}
            <div className="flex gap-2 text-sm">
              <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">💡 Coaching:</span>
              <span className="text-muted-foreground">{part.coachingNote}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
