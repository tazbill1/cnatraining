import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Shield, TrendingUp } from "lucide-react";

export function ACVSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Understanding the Difference
        </h2>
        <p className="text-muted-foreground">
          Trade Allowance vs. Actual Cash Value (ACV) - know which one builds trust.
        </p>
      </div>

      {/* Two Column Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trade Allowance */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              Trade Allowance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                "Deal number that can be influenced by discounts, rebates, deal structure",
                "Not the true vehicle value",
                "Can fluctuate based on negotiation",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ACV */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              ACV (Actual Cash Value)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                "Real wholesale market value",
                "Based on: current sales, mileage, condition, equipment, market demand, reconditioning costs",
                "Transparent, consistent, easy to explain",
                "Builds long-term trust",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why ACV is Better */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Why ACV is Better</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Transparent", desc: "Market-based and verifiable" },
              { title: "Consistent", desc: "Same approach for all customers" },
              { title: "Defensible", desc: "Easy to explain with data" },
              { title: "Trust-Building", desc: "Honesty over manipulation" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-primary/5 border border-primary/10"
              >
                <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaway */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-center text-lg font-medium text-foreground">
          ACV = Truth. Trade Allowance = Flexible number.
          <br />
          <span className="text-muted-foreground text-base">
            Always lead with transparency.
          </span>
        </p>
      </div>
    </div>
  );
}
