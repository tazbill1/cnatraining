import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aeairSteps } from "@/lib/module3Content";

export function AEAIRSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          The AEAIR Objection Handling Framework
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          AEAIR is a five-step method for handling any customer objection with professionalism and empathy. 
          Instead of arguing or giving in, you guide customers toward confident decisions.
        </p>
      </div>

      {/* Framework Overview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {aeairSteps.map((step, index) => (
              <div key={step.letter} className="flex items-center">
                <Badge variant="secondary" className="text-lg px-4 py-2 font-bold">
                  {step.letter}
                </Badge>
                <span className="ml-2 text-sm text-muted-foreground">{step.title}</span>
                {index < aeairSteps.length - 1 && (
                  <span className="mx-3 text-muted-foreground/50">→</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Each Step in Detail */}
      <div className="space-y-6">
        {aeairSteps.map((step, index) => (
          <Card key={step.letter} className="overflow-hidden">
            <div className="flex">
              {/* Letter Badge */}
              <div className="w-20 bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-4xl font-bold text-primary">{step.letter}</span>
              </div>
              
              <CardContent className="p-6 flex-1">
                {/* Step Title & Number */}
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="text-xs">
                    Step {index + 1}
                  </Badge>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground mb-4">{step.description}</p>
                
                {/* Example */}
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-foreground/80 mb-1">Example:</p>
                  <p className="text-sm text-muted-foreground italic">{step.example}</p>
                </div>
                
                {/* Key Points */}
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-2">Key Points:</p>
                  <ul className="space-y-1">
                    {step.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Remember</h3>
          <p className="text-muted-foreground">
            AEAIR works because it respects the customer while maintaining your position. 
            You're not caving to pressure or applying pressure—you're having a professional conversation 
            that addresses concerns and moves toward a solution. Practice each step until it becomes natural.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
