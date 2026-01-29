import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { commonObjections } from "@/lib/module3Content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ObjectionExamplesSection() {
  const [expandedObjection, setExpandedObjection] = useState<string | null>(null);

  const categoryColors: Record<string, string> = {
    Price: "bg-red-500/10 text-red-600 dark:text-red-400",
    Trade: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    Timing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Payment: "bg-green-500/10 text-green-600 dark:text-green-400",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Real Objection Examples
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Here are common objections you'll encounter on the sales floor, with complete AEAIR responses. 
          Study these examples to see how each step flows naturally into the next.
        </p>
      </div>

      {/* Objection Categories Overview */}
      <div className="flex flex-wrap gap-2">
        {["Price", "Trade", "Timing", "Payment"].map((category) => (
          <Badge key={category} className={categoryColors[category]}>
            {category}
          </Badge>
        ))}
      </div>

      {/* Objection Cards */}
      <div className="space-y-4">
        {commonObjections.map((obj) => (
          <Card key={obj.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Objection Header */}
              <button
                onClick={() => setExpandedObjection(expandedObjection === obj.id ? null : obj.id)}
                className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <Badge className={categoryColors[obj.category]}>{obj.category}</Badge>
                  </div>
                  <p className="text-lg font-medium text-foreground">{obj.objection}</p>
                </div>
                {expandedObjection === obj.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                )}
              </button>

              {/* AEAIR Response */}
              {expandedObjection === obj.id && (
                <div className="px-6 pb-6 border-t bg-muted/20">
                  <div className="pt-4 space-y-4">
                    {/* Acknowledge */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">A</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Acknowledge</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{obj.aeairResponse.acknowledge}"
                        </p>
                      </div>
                    </div>

                    {/* Explain */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">E</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Explain</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{obj.aeairResponse.explain}"
                        </p>
                      </div>
                    </div>

                    {/* Anchor */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">A</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Anchor</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{obj.aeairResponse.anchor}"
                        </p>
                      </div>
                    </div>

                    {/* Invite */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">I</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Invite</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{obj.aeairResponse.invite}"
                        </p>
                      </div>
                    </div>

                    {/* Reality */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">R</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Reality</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{obj.aeairResponse.reality}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Practice Tip */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">💡 Practice Tip</h3>
          <p className="text-muted-foreground">
            Don't memorize these responses word-for-word. Instead, understand the <strong>structure</strong> and 
            the <strong>intent</strong> behind each step. Then adapt the language to your own style and each 
            unique customer situation. Authenticity builds trust.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
