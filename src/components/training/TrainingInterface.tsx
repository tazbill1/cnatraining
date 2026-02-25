import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, ArrowLeft, RotateCcw, AlertCircle, ExternalLink, X, Keyboard, ClipboardList } from "lucide-react";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { ChatBubble, TypingIndicator } from "@/components/training/ChatBubble";
import { ChecklistPanel } from "@/components/training/ChecklistPanel";
import { Scenario } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrainingInterfaceProps {
  scenario: Scenario;
  onComplete: (results: any) => void;
}

// Audio Level Indicator Component
function AudioLevelIndicator({ level }: { level: number }) {
  const bars = 5;
  return (
    <div className="flex items-center gap-0.5 h-4">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i + 1) / bars;
        const isActive = level >= threshold * 0.8;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            style={{
              height: `${((i + 1) / bars) * 100}%`,
              minHeight: "4px",
            }}
          />
        );
      })}
    </div>
  );
}

export function TrainingInterface({ scenario, onComplete }: TrainingInterfaceProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    micPermission,
    interimTranscript,
    voiceStatus,
    audioLevel,
    silenceCountdown,
    handsFreeModeEnabled,
    setHandsFreeModeEnabled,
    startRecording,
    stopRecording,
    cancelRecording,
    speakText,
    stopSpeaking,
    resetVoiceStatus,
    SILENCE_COUNTDOWN_SECONDS,
  } = useVoiceChat({
    autoSend: true,
    onAutoSend: async (text) => {
      if (text.trim()) {
        await sendMessage(text.trim());
        resetVoiceStatus();
      }
    },
    onTranscription: (text) => {
      // Fallback: put transcription in input field
      if (text.trim()) {
        setInputValue(text.trim());
        inputRef.current?.focus();
      }
    },
  });

  const isMicUnavailable = micPermission === "denied" || micPermission === "unavailable";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Only handle Escape in input
        if (e.key === "Escape" && isRecording) {
          e.preventDefault();
          cancelRecording();
        }
        return;
      }

      if (e.code === "Space" && !isProcessing && !isTyping) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (voiceStatus === "idle") {
          startRecording();
        }
      }

      if (e.key === "Escape" && (isRecording || voiceStatus === "countdown")) {
        e.preventDefault();
        cancelRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, isProcessing, isTyping, voiceStatus, startRecording, stopRecording, cancelRecording]);

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
        <header className="h-14 sm:h-16 border-b border-border px-3 sm:px-6 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/scenarios")}
              className="shrink-0 px-2 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base text-foreground truncate">Training Session</h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                Practice with: {sessionState.scenario.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Hands-free mode toggle - hidden on mobile for space */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
              <Switch
                id="hands-free"
                checked={handsFreeModeEnabled}
                onCheckedChange={setHandsFreeModeEnabled}
                className="scale-90"
              />
              <Label htmlFor="hands-free" className="text-xs cursor-pointer">
                Hands-free
              </Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => startSession(scenario)}
              title="Start over with fresh conversation"
              className="px-2 sm:px-3"
            >
              <RotateCcw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
              className="px-2 sm:px-3"
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
        <div className="flex-1 overflow-auto p-3 sm:p-6">
          <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
            {sessionState.messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {sessionState.scenario?.customerName
                    ? "Time to explain the trade process!"
                    : "Your turn to greet the customer!"}
                </h3>
                {sessionState.scenario?.customerName && (
                  <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border text-sm">
                    <p className="font-medium text-foreground">Customer: {sessionState.scenario.customerName}</p>
                    {sessionState.scenario.tradeVehicle && (
                      <p className="text-muted-foreground">Trade Vehicle: {sessionState.scenario.tradeVehicle}</p>
                    )}
                    {sessionState.scenario.tradeValue && (
                      <p className="text-muted-foreground">ACV: <span className="font-semibold text-foreground">{sessionState.scenario.tradeValue}</span></p>
                    )}
                  </div>
                )}
                <p className="text-muted-foreground max-w-md mx-auto">
                  {sessionState.scenario?.customerName
                    ? "The CNA is complete. Now explain how the trade evaluation works before inspecting the vehicle."
                    : "A customer just walked onto the lot. Use the mic button or type your opening greeting to begin the conversation."}
                </p>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Scenario: {sessionState.scenario?.name}
                </p>
                {/* Keyboard shortcuts hint */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">Space</kbd>
                    <span>to talk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">Esc</kbd>
                    <span>to cancel</span>
                  </div>
                </div>
              </div>
            )}
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

        {/* Mic Permission Warning */}
        {isMicUnavailable && (
          <div className="border-t border-border px-4 py-3 bg-muted/50">
            <Alert variant="default" className="max-w-2xl mx-auto border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm">
                <span className="font-medium">Microphone unavailable.</span>{" "}
                {micPermission === "denied" 
                  ? "Please allow microphone access in your browser settings."
                  : "Voice recording isn't available in this view."}{" "}
                <span className="text-muted-foreground">
                  You can still type your responses below, or{" "}
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    open in a new tab <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  for voice features.
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Voice Status Indicator */}
        {(voiceStatus === "listening" || voiceStatus === "countdown" || voiceStatus === "sending") && (
          <div className="border-t border-border px-4 py-3 bg-primary/5">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {voiceStatus === "countdown" ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-600">{silenceCountdown}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600">Sending in {silenceCountdown}s...</p>
                      <p className="text-xs text-muted-foreground">Keep talking to continue</p>
                    </div>
                  </>
                ) : voiceStatus === "sending" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">Sending your message...</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <AudioLevelIndicator level={audioLevel} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Listening...</p>
                      <p className="text-xs text-muted-foreground">Speak clearly into your microphone</p>
                    </div>
                  </>
                )}
              </div>
              
              {voiceStatus !== "sending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelRecording}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Live transcript display */}
        {isRecording && interimTranscript && (
          <div className="border-t border-primary/20 px-4 py-3 bg-muted/30">
            <div className="max-w-2xl mx-auto">
              <p className="text-foreground">{interimTranscript}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-3 sm:p-4 bg-card">
          <div className="max-w-2xl mx-auto flex items-center gap-2 sm:gap-3">
            {/* Mobile: Checklist drawer trigger */}
            {isMobile && (
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="p-3 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Session Progress</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-auto">
                    <ChecklistPanel
                      scenario={sessionState.scenario}
                      checklistState={sessionState.checklistState}
                      elapsedTime={formatTime(sessionState.elapsedSeconds)}
                      onEndSession={handleEndSession}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleRecording}
                  disabled={isProcessing || isMicUnavailable || voiceStatus === "sending"}
                  className={`p-3 sm:p-3 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center ${
                    isRecording
                      ? "bg-destructive text-destructive-foreground recording-pulse"
                      : isProcessing || voiceStatus === "sending"
                      ? "bg-muted text-muted-foreground"
                      : isMicUnavailable
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {isProcessing || voiceStatus === "sending" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? "Stop recording (Space)" : "Start recording (Space)"}</p>
              </TooltipContent>
            </Tooltip>
            
            <button
              onClick={handleSpeakLastMessage}
              className={`p-3 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center shrink-0 ${
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
              placeholder={isRecording ? "Listening..." : isMicUnavailable ? "Type your response..." : "Type or tap mic..."}
              disabled={isTyping || isRecording || voiceStatus === "sending"}
              className="flex-1 min-w-0"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping || voiceStatus === "sending"}
              className="btn-gradient px-3 sm:px-6 shrink-0"
            >
              <Send className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <ChecklistPanel
          scenario={sessionState.scenario}
          checklistState={sessionState.checklistState}
          elapsedTime={formatTime(sessionState.elapsedSeconds)}
          onEndSession={handleEndSession}
        />
      )}
    </div>
  );
}
