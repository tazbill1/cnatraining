import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { useVoiceChat } from "@/hooks/useVoiceChat";
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
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef(0);

  const {
    sessionState,
    isLoading,
    isTyping,
    startSession,
    sendMessage,
    endSession,
    formatTime,
  } = useTrainingSession();

  const {
    isRecording,
    isProcessing,
    isSpeaking,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
  } = useVoiceChat({
    onTranscription: (text) => {
      setInputValue(text);
    },
  });

  // Start session on mount
  useEffect(() => {
    startSession(scenario);
  }, [scenario]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionState.messages, isTyping]);

  // Auto-speak new assistant messages
  useEffect(() => {
    if (!autoSpeak) return;
    
    const messages = sessionState.messages;
    if (messages.length > lastMessageCountRef.current) {
      const newMessages = messages.slice(lastMessageCountRef.current);
      const lastAssistantMessage = newMessages.filter((m) => m.role === "assistant").pop();
      
      if (lastAssistantMessage) {
        speakText(lastAssistantMessage.content, "nova");
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [sessionState.messages, autoSpeak, speakText]);

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
    stopSpeaking();
    const results = await endSession();
    if (results) {
      onComplete(results);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSpeakLastMessage = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const lastAssistantMessage = sessionState.messages
        .filter((m) => m.role === "assistant")
        .pop();
      if (lastAssistantMessage) {
        speakText(lastAssistantMessage.content, "nova");
      }
    }
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
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/scenarios")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">Training Session</h1>
              <p className="text-sm text-muted-foreground">
                Practice with: {sessionState.scenario.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startSession(scenario)}
              title="Start over with fresh conversation"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
            >
              {autoSpeak ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">
                {autoSpeak ? "Voice On" : "Voice Off"}
              </span>
            </Button>
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
              disabled={isProcessing}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? "bg-destructive text-destructive-foreground recording-pulse"
                  : isProcessing
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleSpeakLastMessage}
              className={`p-3 rounded-full transition-colors ${
                isSpeaking
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
              title={isSpeaking ? "Stop speaking" : "Replay last message"}
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response or use the mic..."
              disabled={isTyping || isRecording}
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
