import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { VoiceChat } from "@/components/training/VoiceChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Search, RefreshCw, Users, DollarSign, Gauge } from "lucide-react";

const PERSONAS = [
  {
    id: "first-time-buyer",
    name: "First-Time Buyer",
    description: "Nervous and needs guidance through the process",
    difficulty: "beginner",
    icon: User,
  },
  {
    id: "researcher",
    name: "The Researcher",
    description: "95% decided, wants validation for their choice",
    difficulty: "intermediate",
    icon: Search,
  },
  {
    id: "trade-up",
    name: "The Trade-Up",
    description: "Knows exactly what they don't want from current car",
    difficulty: "intermediate",
    icon: RefreshCw,
  },
  {
    id: "budget-shopper",
    name: "Budget Shopper",
    description: "Price-focused, needs help seeing total value",
    difficulty: "intermediate",
    icon: DollarSign,
  },
  {
    id: "enthusiast",
    name: "The Enthusiast",
    description: "Car expert who knows specs, wants performance",
    difficulty: "advanced",
    icon: Gauge,
  },
];

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function VoiceTraining() {
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const handleBack = () => {
    if (selectedPersona) {
      setSelectedPersona(null);
      setMessages([]);
    } else {
      navigate("/scenarios");
    }
  };

  if (!selectedPersona) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <header className="h-16 border-b border-border px-6 flex items-center bg-card">
            <Button variant="ghost" size="sm" onClick={() => navigate("/scenarios")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="ml-4">
              <h1 className="font-semibold text-foreground">Voice Training</h1>
              <p className="text-sm text-muted-foreground">Select a customer persona to practice with</p>
            </div>
          </header>

          <main className="max-w-4xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                return (
                  <Card
                    key={persona.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className={difficultyColors[persona.difficulty as keyof typeof difficultyColors]}>
                          {persona.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{persona.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersona);

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-background">
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="ml-4">
              <h1 className="font-semibold text-foreground">Training: {currentPersona?.name}</h1>
              <p className="text-sm text-muted-foreground">
                {messages.length} messages • Voice-enabled
              </p>
            </div>
          </div>
          <Badge variant="outline" className={difficultyColors[currentPersona?.difficulty as keyof typeof difficultyColors]}>
            {currentPersona?.difficulty}
          </Badge>
        </header>

        <main className="flex-1 overflow-hidden">
          <VoiceChat
            persona={selectedPersona}
            onMessagesChange={setMessages}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
