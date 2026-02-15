import { Card, CardContent } from "@/components/ui/card";

export function BaseStatementContextSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Purpose & Context
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The Base Statement is the foundation of every customer interaction. It sets the tone, establishes trust, and tells the customer exactly what makes this dealership different.
        </p>
      </div>

      {/* Where It Fits */}
      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground text-lg">Where This Fits</h3>
          <p className="text-muted-foreground">
            The Base Statement is the opening move of the entire sales process. It lives inside the <strong className="text-foreground">Meet & Greet</strong> — the very first structured interaction a customer has with you after walking through the door.
          </p>

          {/* Process Steps */}
          <div className="grid grid-cols-6 gap-1 mt-4">
            {[
              { step: "1", label: "Meet & Greet", active: true },
              { step: "2", label: "CNA", active: false },
              { step: "3", label: "Vehicle", active: false },
              { step: "4", label: "Test Drive", active: false },
              { step: "5", label: "Write Up", active: false },
              { step: "6", label: "Close", active: false },
            ].map((item) => (
              <div
                key={item.step}
                className={`text-center p-2 rounded-lg ${
                  item.active
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="text-xs font-bold">{item.step}</div>
                <div className="text-[10px] sm:text-xs leading-tight mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          {/* Arrow indicator */}
          <p className="text-center text-sm font-semibold text-primary">▲ YOU ARE HERE</p>
        </CardContent>
      </Card>

      {/* The Moment */}
      <Card className="border-muted">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground text-lg">The Moment</h3>
          <p className="text-muted-foreground leading-relaxed">
            The customer has just arrived. They're looking around, maybe a little guarded, probably expecting a high-pressure pitch. You've walked up, smiled, introduced yourself, and shaken their hand.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This is the moment right after <em>"Hi, I'm [Your Name]"</em> — before you ask a single question about what they're looking for. The Base Statement is how you set the tone for everything that follows.
          </p>
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">What comes before:</strong> Greeting, handshake, introduce yourself by name.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">What comes after:</strong> Transition into the Customer Needs Analysis (CNA) — <em>"Let me start by learning a little about what brings you in today."</em>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Guidelines */}
      <Card className="border-muted">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground text-lg">Delivery Guidelines</h3>
          <div className="space-y-3">
            {[
              { label: "Tone", desc: "Warm, confident, conversational — like you're talking to a neighbor, not reading a script." },
              { label: "Pace", desc: "Slow down on the key phrases. Let the important messages land." },
              { label: "Eye Contact", desc: "Maintain natural eye contact. This is a promise you're making, not a pitch you're reading." },
              { label: "Personalize", desc: "Fill in your dealership's name and city. Make it yours." },
            ].map((item) => (
              <div key={item.label} className="flex gap-3">
                <span className="font-semibold text-primary shrink-0 w-24">{item.label}:</span>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
