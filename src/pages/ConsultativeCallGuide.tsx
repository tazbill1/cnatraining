import { useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, ChevronDown, ChevronRight, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CallStep {
  step: number;
  title: string;
  salesperson: string;
  customer?: string;
  whyMatters?: string[];
  note?: string;
}

const callSteps: CallStep[] = [
  {
    step: 1,
    title: "Opening - Get Their Name",
    salesperson: "Great! Thanks for calling [Dealership]. I'm [Your Name]. Who am I speaking with?",
    customer: "This is Sarah.",
    note: "Get their name, find out what they're interested in",
  },
  {
    step: 2,
    title: "Qualify the Lead",
    salesperson: "Perfect! Did you happen to see that on our website, or somewhere else?",
    customer: "Yeah, on your website.",
    whyMatters: [
      "Source tracking: Where they found the car (helps with marketing)",
      "Location: Are they local or traveling from far away?",
      "Serious buyer check: Engaged customers answer these easily",
    ],
    note: "Understand where they found you and if they're local",
  },
  {
    step: 3,
    title: "Set the Stage for Alternatives",
    salesperson: "I can definitely check on availability for you. By the way, if we have a similar vehicle available, would you want me to check on that as well?",
    customer: "Sure, yeah that would be fine.",
    whyMatters: [
      "This opens the door to ask questions AND protects you if their specific vehicle is sold",
      "They've already said 'yes' to hearing about alternatives",
    ],
    note: "Get permission to explore options",
  },
  {
    step: 4,
    title: "Ask Questions to Understand Their Needs",
    salesperson: "Perfect. So I can find the best options for you, tell me - what drew you to the CR-V? What are you looking for in a vehicle?",
    whyMatters: [
      "What they like about it (size, features, reliability, brand)",
      "What they're using it for (family, commute, work)",
      "What's most important to them (safety, economy, performance)",
    ],
    note: "Understand what they actually need (not just what they asked for)",
  },
  {
    step: 5,
    title: "Tie Information Collection to Value",
    salesperson: "Perfect! Let me check on that CR-V and see what similar options we have. The number you're calling from - is that the best number to reach you?",
    customer: "Yes, that's my cell.",
    whyMatters: [
      "You're not just asking for their info - you're asking so you can HELP them",
      "It feels natural, not invasive",
    ],
    note: "Get contact info by tying it to the value you're providing",
  },
  {
    step: 6,
    title: "Check Availability & Deliver News",
    salesperson: "Great news, Sarah! We do have that CR-V in stock. Would you like to come take a look, or is there other information I can help you gather?",
    whyMatters: [
      "You're not PUSHING them to come in - you're ASKING what they want",
      "'Come take a look' (soft) vs 'make an appointment' (hard)",
      "You're still offering to help either way",
    ],
    note: "Let them tell you the next step",
  },
];

interface PathStep {
  speaker: "customer" | "salesperson";
  text: string;
  note?: string;
}

interface CustomerPath {
  id: string;
  title: string;
  emoji: string;
  description: string;
  steps: PathStep[];
  checklist?: string[];
}

const customerPaths: CustomerPath[] = [
  {
    id: "ready",
    title: "Ready to Come In",
    emoji: "✅",
    description: "Customer is engaged and wants to visit",
    steps: [
      { speaker: "customer", text: "Yeah, I'd like to come see it." },
      { speaker: "salesperson", text: "Perfect! Let me get you scheduled. Just to confirm, I have your number as [number], and your name is Sarah...?" },
      { speaker: "salesperson", text: "Great, Sarah. What works better for you - today/tomorrow or this weekend?" },
      { speaker: "salesperson", text: "Excellent. I'm going to text you our address and a confirmation right now while we're on the phone. You should get it in just a second... Did you get it?", note: "Set specific time - '2:00 PM' not 'afternoon'" },
    ],
    checklist: [
      "Confirmed full name",
      "Confirmed phone number",
      "Set specific date and time",
      "Sent confirmation text while on phone",
      "Confirmed they received it",
    ],
  },
  {
    id: "info",
    title: "Wants More Information",
    emoji: "📋",
    description: "Customer needs more details before visiting",
    steps: [
      { speaker: "customer", text: "I'm not ready to come in yet. Can you tell me more about it?" },
      { speaker: "salesperson", text: "Absolutely! What specific information would be most helpful for you?" },
      { speaker: "salesperson", text: "I can get that information for you. When's the best time for me to call you back with those details?", note: "Secure a callback time" },
      { speaker: "salesperson", text: "Perfect. I'll gather all that info and call you at [time]. If I find something even better than what you asked about, would you want to know about that too?" },
    ],
  },
  {
    id: "not-ready",
    title: "Not Ready to Come In",
    emoji: "⏳",
    description: "Customer is early in the process",
    steps: [
      { speaker: "customer", text: "I'm just starting to look. I'm not ready to come in yet." },
      { speaker: "salesperson", text: "No problem at all - I completely understand. When do you think you might be ready to take the next step?" },
      { speaker: "salesperson", text: "Perfect. Would it be okay if I followed up with you around that time? I can also send you updates if we get anything new that matches what you're looking for.", note: "Plant seeds for future relationship" },
      { speaker: "salesperson", text: "Great! I'll reach out in a few weeks. In the meantime, feel free to call me directly if you have any questions. I'll text you my contact info right now." },
    ],
  },
];

const mistakesToAvoid = [
  "Quoting price immediately (always redirect to value)",
  "Letting them control the entire conversation",
  "Not getting their contact information early",
  "Saying 'we don't have that' without offering alternatives",
  "Arguing or getting defensive when they push back",
  "Making promises you can't keep",
  "Not confirming the appointment with a text",
];

const keysToSuccess = [
  "Get their name early - use it throughout the call",
  "Ask permission to explore alternatives BEFORE you need to",
  "Tie every question to how it helps THEM",
  "Let them tell you the next step - don't push",
  "Always send a confirmation text while on the phone",
  "Keep a friendly, helpful tone - you're solving their problem",
  "If you have to call back, set a specific time",
];

export default function ConsultativeCallGuide() {
  const navigate = useNavigate();

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/toolbox")}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Toolbox
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Consultative Sales Call Guide</h1>
            </div>
            <p className="text-muted-foreground">
              Visual step-by-step guide for handling incoming sales calls
            </p>
          </div>

          <Tabs defaultValue="process" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="process">6-Step Process</TabsTrigger>
              <TabsTrigger value="paths">3 Customer Paths</TabsTrigger>
              <TabsTrigger value="tips">Keys to Success</TabsTrigger>
            </TabsList>

            <TabsContent value="process" className="space-y-4">
              <div className="space-y-4">
                {callSteps.map((step, index) => (
                  <Card key={step.step}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Salesperson script */}
                      <div className="flex gap-3">
                        <div className="w-2 bg-primary rounded-full shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-primary mb-1">SALESPERSON:</p>
                          <p className="text-foreground italic">"{step.salesperson}"</p>
                        </div>
                      </div>

                      {/* Customer response */}
                      {step.customer && (
                        <div className="flex gap-3">
                          <div className="w-2 bg-muted-foreground/30 rounded-full shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">CUSTOMER:</p>
                            <p className="text-muted-foreground italic">"{step.customer}"</p>
                          </div>
                        </div>
                      )}

                      {/* Why this matters */}
                      {step.whyMatters && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                          <p className="text-sm font-semibold text-foreground mb-2">💡 Why this matters:</p>
                          <ul className="space-y-1">
                            {step.whyMatters.map((reason, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Note */}
                      {step.note && (
                        <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                          {step.note}
                        </div>
                      )}

                      {/* Arrow to next step */}
                      {index < callSteps.length - 1 && (
                        <div className="flex justify-center pt-2">
                          <ChevronDown className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="paths" className="space-y-6">
              <p className="text-muted-foreground">
                After checking availability and delivering the news, the customer will typically fall into one of these three paths:
              </p>

              {customerPaths.map((path) => (
                <Card key={path.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{path.emoji}</span>
                      <div>
                        <CardTitle className="text-lg">Path: {path.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{path.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {path.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div
                          className={cn(
                            "w-2 rounded-full shrink-0",
                            step.speaker === "salesperson" ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        />
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-xs font-medium mb-1",
                              step.speaker === "salesperson" ? "text-primary" : "text-muted-foreground"
                            )}
                          >
                            {step.speaker === "salesperson" ? "SALESPERSON:" : "CUSTOMER:"}
                          </p>
                          <p
                            className={cn(
                              "italic",
                              step.speaker === "salesperson" ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            "{step.text}"
                          </p>
                          {step.note && (
                            <p className="text-xs text-primary mt-1">💡 {step.note}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {path.checklist && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                        <p className="text-sm font-semibold text-foreground mb-2">✅ Appointment Checklist:</p>
                        <ul className="space-y-1">
                          {path.checklist.map((item, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              {/* Keys to Success */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-500" />
                    Keys to Success
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {keysToSuccess.map((key, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{key}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Mistakes to Avoid */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    Mistakes to Avoid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {mistakesToAvoid.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
