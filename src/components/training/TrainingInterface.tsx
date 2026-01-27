import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mic, MicOff } from "lucide-react";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { ChatBubble, TypingIndicator } from "@/components/training/ChatBubble";
import { ChecklistPanel } from "@/components/training/ChecklistPanel";
import { Scenario } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TrainingInterfaceProps {
  scenario: Scenario;
  onComplete: (results: any) => void;
}

export function TrainingInterface({ scenario, onComplete }: TrainingInterfaceProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    sessionState,
    isLoading,
    isTyping,
    startSession,
    sendMessage,
    endSession,
    formatTime,
  } = useTrainingSession();

  // Start session on mount
  useEffect(() => {
    startSession(scenario);
  }, [scenario]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionState.messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndSession = async () => {
    const results = await endSession();
    if (results) {
      onComplete(results);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording would be implemented here
  };

  if (isLoading || !sessionState.scenario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">
          Starting training session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border px-6 flex items-center bg-card">
          <div>
            <h1 className="font-semibold text-foreground">Training Session</h1>
            <p className="text-sm text-muted-foreground">
              Practice with: {sessionState.scenario.name}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {sessionState.messages.map((message) => (
              <ChatBubble
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? "bg-destructive text-destructive-foreground recording-pulse"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="btn-gradient px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ChecklistPanel
        scenario={sessionState.scenario}
        checklistState={sessionState.checklistState}
        elapsedTime={formatTime(sessionState.elapsedSeconds)}
        onEndSession={handleEndSession}
      />
    </div>
  );
}
