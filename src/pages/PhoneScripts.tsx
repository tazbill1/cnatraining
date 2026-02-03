import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, Copy, Check, PhoneIncoming, PhoneOutgoing, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Script {
  id: string;
  title: string;
  context: string;
  script: string;
  tips?: string[];
}

const inboundScripts: Script[] = [
  {
    id: "greeting",
    title: "Standard Greeting",
    context: "Use when answering any incoming call",
    script: `"Thank you for calling [Dealership Name], this is [Your Name] in sales. How may I help you today?"`,
    tips: [
      "Smile when you answer - it comes through in your voice",
      "Speak clearly and at a moderate pace",
      "Use your first name only - it's more personal",
    ],
  },
  {
    id: "capture-info",
    title: "Capturing Contact Info",
    context: "Within the first 2 minutes of the call",
    script: `"Before we go further, may I get your name and the best number to reach you in case we get disconnected?"`,
    tips: [
      "Get this early in case the call drops",
      "Ask for email too if they're an internet lead",
    ],
  },
  {
    id: "price-redirect",
    title: "Price Question Redirect",
    context: "When caller asks 'What's the price?'",
    script: `"Great question - pricing depends on a few factors like trade-in value and available incentives. I want to make sure I give you accurate numbers. The best way to do that is to spend about 15 minutes together so I can understand exactly what you need. Does [time] work for you?"`,
    tips: [
      "Never quote price on the phone",
      "Create value first, then invite them in",
      "Always end with a specific time option",
    ],
  },
  {
    id: "availability-check",
    title: "Vehicle Availability",
    context: "When caller asks about specific vehicle",
    script: `"Yes, I do see that vehicle in stock. Let me ask you a few quick questions to make sure it's the right fit for you. What will you primarily be using this vehicle for?"`,
    tips: [
      "Confirm you have it, then gather needs",
      "Transition into CNA questions",
      "Don't just answer 'yes' and let them hang up",
    ],
  },
];

const outboundScripts: Script[] = [
  {
    id: "orphan-owner",
    title: "Orphan Owner Introduction",
    context: "First contact with a previous customer",
    script: `"Hi [Name], this is [Your Name] from [Dealership]. I'm reaching out because I've been assigned as your new sales consultant. I wanted to introduce myself and see how your [Vehicle] is treating you?"`,
    tips: [
      "Research their purchase history before calling",
      "Be warm and conversational",
      "Listen for upgrade opportunities",
    ],
  },
  {
    id: "service-followup",
    title: "Service Customer Follow-Up",
    context: "Calling a recent service customer",
    script: `"Hi [Name], this is [Your Name] from [Dealership]. I saw you were in for service recently and wanted to check - were you happy with how everything went? Also, have you thought about what you might drive next?"`,
    tips: [
      "Lead with service satisfaction",
      "Transition naturally to sales",
      "Don't be pushy - plant seeds",
    ],
  },
  {
    id: "internet-followup",
    title: "Internet Lead Follow-Up",
    context: "Following up on a cold internet lead",
    script: `"Hi [Name], this is [Your Name] from [Dealership]. You reached out to us a few weeks ago about a [Vehicle]. I wanted to follow up - are you still in the market?"`,
    tips: [
      "Reference the specific vehicle they inquired about",
      "Keep it brief and to the point",
      "Have alternatives ready if that vehicle sold",
    ],
  },
  {
    id: "voicemail",
    title: "Voicemail Script",
    context: "When you get their voicemail",
    script: `"Hi [Name], this is [Your Name] from [Dealership]. I have some information about the [Vehicle/Topic] you were interested in. Please call me back at [Number]. Again, that's [Your Name] at [Number]. Thanks!"`,
    tips: [
      "Keep under 30 seconds",
      "Speak slowly, especially your number",
      "Create curiosity but don't give everything away",
      "Repeat your name and number at the end",
    ],
  },
];

const appointmentScripts: Script[] = [
  {
    id: "set-appointment",
    title: "Setting the Appointment",
    context: "After building rapport and understanding needs",
    script: `"Based on what you've shared, I have two vehicles that would be perfect for you. I've already set them aside. I have availability today at [time] or tomorrow morning at [time]. Which works better for your schedule?"`,
    tips: [
      "Always offer two specific times",
      "Create urgency with 'set aside'",
      "Don't ask 'if' - ask 'when'",
    ],
  },
  {
    id: "confirm-commitment",
    title: "Confirming Commitment",
    context: "After they agree to a time",
    script: `"Perfect, I'll put you down for [time]. Now, I'm going to prepare everything and have the vehicles ready - can I count on you to be here?"`,
    tips: [
      "Get verbal commitment",
      "Make them feel valued by mentioning preparation",
      "Creates psychological obligation",
    ],
  },
  {
    id: "set-expectations",
    title: "Setting Expectations",
    context: "Before ending the appointment call",
    script: `"When you arrive, ask for me by name at the front desk. I'll have everything ready, and we'll take about 30-45 minutes to find the right vehicle for you. Let me confirm: That's [Day] at [Time]. I'll send you a text confirmation. What's the best cell number to reach you?"`,
    tips: [
      "Tell them exactly what to expect",
      "Get cell number for text confirmation",
      "Repeat the appointment details",
    ],
  },
  {
    id: "just-looking",
    title: "Handling 'Just Looking'",
    context: "When they say they're not ready",
    script: `"I completely understand - you want to make sure this is worth your time. Here's what I can do: I'll have the vehicles you're interested in pulled up and ready. You can take a look, ask any questions, and there's absolutely no pressure. If it's not right for you, you're free to leave. Does [time] work?"`,
    tips: [
      "Acknowledge their hesitation",
      "Remove the pressure",
      "Make it easy and low-commitment",
    ],
  },
];

const objectionScripts: Script[] = [
  {
    id: "email-info",
    title: "'Just Email Me Info'",
    context: "When they want to avoid coming in",
    script: `"I'd be happy to send some info. What specifically would you like me to include? ... You know, honestly, an email can't answer your questions the way I can in person. Let me suggest this: come in for 15 minutes, and if it's not for you, I'll email you anything you need. Does [time] work?"`,
  },
  {
    id: "not-ready",
    title: "'I'm Not Ready to Buy'",
    context: "When they feel pressured",
    script: `"No problem at all - there's no pressure. Most people aren't ready to buy on their first visit, and that's completely fine. This is just about gathering information and seeing what's out there. When would be a good time for you to take a look?"`,
  },
  {
    id: "shopping-around",
    title: "'I'm Still Shopping Around'",
    context: "When they're comparing dealerships",
    script: `"That makes total sense - you should compare. In fact, why not add us to your list? We may have something that surprises you, and at least you'll have all the information you need to make the best decision. I have time today at [time] or tomorrow at [time]. Which is better?"`,
  },
  {
    id: "working-with-someone",
    title: "'I'm Working With Someone Else'",
    context: "When they have an existing relationship",
    script: `"That's great - it sounds like you're in good hands. I just want to make sure you're aware of all your options. If you ever need a second opinion or want to see what else is available, I'm here. Can I at least send you my contact info in case anything changes?"`,
  },
];

function ScriptCard({ script }: { script: Script }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script.script);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{script.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{script.context}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
          <p className="text-foreground italic">{script.script}</p>
        </div>
        {script.tips && script.tips.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tips:</p>
            <ul className="space-y-1">
              {script.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PhoneScripts() {
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
              <h1 className="text-3xl font-bold text-foreground">Phone Scripts</h1>
            </div>
            <p className="text-muted-foreground">
              Ready-to-use scripts for every phone situation. Tap to copy.
            </p>
          </div>

          <Tabs defaultValue="inbound" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbound" className="flex items-center gap-2">
                <PhoneIncoming className="w-4 h-4" />
                <span className="hidden sm:inline">Inbound</span>
              </TabsTrigger>
              <TabsTrigger value="outbound" className="flex items-center gap-2">
                <PhoneOutgoing className="w-4 h-4" />
                <span className="hidden sm:inline">Outbound</span>
              </TabsTrigger>
              <TabsTrigger value="appointment" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="objections" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Objections</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbound" className="space-y-4">
              <div className="grid gap-4">
                {inboundScripts.map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outbound" className="space-y-4">
              <div className="grid gap-4">
                {outboundScripts.map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="appointment" className="space-y-4">
              <div className="grid gap-4">
                {appointmentScripts.map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="objections" className="space-y-4">
              <div className="grid gap-4">
                {objectionScripts.map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
