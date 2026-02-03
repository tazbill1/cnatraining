import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Volume2, X, Keyboard } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceChatProps {
  persona: string;
  onMessagesChange?: (messages: Message[]) => void;
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const SILENCE_COUNTDOWN_SECONDS = 2;

export function VoiceChat({ persona, onMessagesChange }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "countdown" | "sending">("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState(SILENCE_COUNTDOWN_SECONDS);
  const [handsFreeModeEnabled, setHandsFreeModeEnabled] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const finalTranscriptRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());

  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Notify parent of message changes
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        // Only handle Escape in textarea
        if (e.key === "Escape" && isRecording) {
          e.preventDefault();
          cancelRecording();
        }
        return;
      }

      if (e.code === "Space" && !isProcessing) {
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
  }, [isRecording, isProcessing, voiceStatus]);

  // Start audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        setAudioLevel(normalizedLevel);

        // Detect speech activity for silence detection
        if (normalizedLevel > 0.1) {
          lastSpeechTimeRef.current = Date.now();
          if (voiceStatus === "countdown") {
            setVoiceStatus("listening");
            setSilenceCountdown(SILENCE_COUNTDOWN_SECONDS);
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      logger.error("Error starting audio monitoring:", error);
    }
  }, [voiceStatus]);

  // Stop audio level monitoring
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Please use Chrome.",
        variant: "destructive",
      });
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    return recognition;
  }, [toast]);

  // Send message from voice input
  const sendMessageFromVoice = useCallback(async (transcript: string) => {
    if (!transcript || isProcessing) return;
    setInput("");
    setVoiceStatus("sending");
    stopAudioLevelMonitoring();
    
    const userMessage: Message = { role: "user", content: transcript };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: persona,
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages([...newMessages, assistantMessage]);
      setVoiceStatus("idle");

      // Convert response to speech, then auto-restart if hands-free
      await speakText(data.message, data.voice);
    } catch (error) {
      logger.error("Chat error:", error);
      setVoiceStatus("idle");
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, isProcessing, persona, toast, stopAudioLevelMonitoring]);

  // Start silence countdown
  const startSilenceCountdown = useCallback(() => {
    if (voiceStatus !== "listening") return;
    
    setVoiceStatus("countdown");
    setSilenceCountdown(SILENCE_COUNTDOWN_SECONDS);

    countdownIntervalRef.current = setInterval(() => {
      setSilenceCountdown(prev => {
        if (prev <= 1) {
          // Time to send
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          // Stop recognition which will trigger send
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [voiceStatus]);

  // Start voice recording
  const startRecording = useCallback(() => {
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    finalTranscriptRef.current = "";
    setInterimTranscript("");
    setVoiceStatus("listening");
    setSilenceCountdown(SILENCE_COUNTDOWN_SECONDS);
    lastSpeechTimeRef.current = Date.now();

    // Start audio level monitoring
    startAudioLevelMonitoring();

    recognition.onstart = () => {
      logger.log("Speech recognition started");
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
        setInput(finalTranscriptRef.current.trim());
        lastSpeechTimeRef.current = Date.now();
        
        // Reset countdown if we got final text
        if (voiceStatus === "countdown") {
          setVoiceStatus("listening");
          setSilenceCountdown(SILENCE_COUNTDOWN_SECONDS);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      }
      setInterimTranscript(interim);

      // Start silence detection after getting some text
      if (finalTranscriptRef.current.trim()) {
        // Clear any existing timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        // Start new timer - if no speech for 1.5s, start countdown
        silenceTimerRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            startSilenceCountdown();
          }
        }, 1500);
      }
    };

    recognition.onend = () => {
      logger.log("Speech recognition ended, final:", finalTranscriptRef.current.trim());
      setIsRecording(false);
      setInterimTranscript("");
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      const transcript = finalTranscriptRef.current.trim();
      if (transcript) {
        sendMessageFromVoice(transcript);
      } else {
        setVoiceStatus("idle");
        stopAudioLevelMonitoring();
      }
    };

    recognition.onerror = (event: any) => {
      logger.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setInterimTranscript("");
      setVoiceStatus("idle");
      stopAudioLevelMonitoring();
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      if (event.error !== "aborted") {
        toast({
          title: "Voice Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [initSpeechRecognition, sendMessageFromVoice, startAudioLevelMonitoring, startSilenceCountdown, stopAudioLevelMonitoring, toast, voiceStatus]);

  // Stop recording manually (will auto-send)
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Cancel recording without sending
  const cancelRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript("");
    setInput("");
    setVoiceStatus("idle");
    finalTranscriptRef.current = "";
    stopAudioLevelMonitoring();
    toast({
      title: "Recording cancelled",
      description: "Your message was not sent.",
    });
  }, [stopAudioLevelMonitoring, toast]);

  // Send message (for text input, not voice)
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isProcessing) return;

    const userMessage: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: persona,
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages([...newMessages, assistantMessage]);

      // Convert response to speech
      await speakText(data.message, data.voice);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert text to speech
  const speakText = async (text: string, voice: string) => {
    setIsSpeaking(true);
    try {
      // Get the current session to use the user's JWT
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speak`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, voice }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          
          // Auto-restart recording if hands-free mode is enabled
          if (handsFreeModeEnabled && !isProcessing) {
            setTimeout(() => {
              startRecording();
            }, 500);
          }
        };
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      
      // Still auto-restart in hands-free mode even if TTS fails
      if (handsFreeModeEnabled && !isProcessing) {
        setTimeout(() => {
          startRecording();
        }, 500);
      }
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Audio level bars component
  const AudioLevelIndicator = () => (
    <div className="flex items-center justify-center space-x-1 h-6">
      {[0, 1, 2, 3, 4].map((i) => {
        const threshold = (i + 1) * 0.15;
        const isActive = audioLevel >= threshold;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive ? "bg-destructive" : "bg-muted-foreground/30"
            }`}
            style={{
              height: isActive ? `${12 + i * 4}px` : "4px",
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with hands-free toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Keyboard className="w-3 h-3" />
          <span>Space: start/stop • Esc: cancel</span>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="hands-free" className="text-xs text-muted-foreground cursor-pointer">
            Hands-free
          </Label>
          <Switch
            id="hands-free"
            checked={handsFreeModeEnabled}
            onCheckedChange={setHandsFreeModeEnabled}
            className="scale-75"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Speaking...</span>
            {handsFreeModeEnabled && (
              <span className="text-xs">(will auto-listen after)</span>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-end space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or press Space to talk..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isProcessing || isRecording}
          />

          <div className="flex flex-col space-y-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              disabled={isProcessing}
              title={isRecording ? "Stop recording (Space)" : "Start recording (Space)"}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isProcessing || isRecording}
              size="icon"
              title="Send message (Enter)"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Voice Status Indicator */}
        {(voiceStatus === "listening" || voiceStatus === "countdown") && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <AudioLevelIndicator />
              <div className="flex items-center space-x-2">
                {voiceStatus === "countdown" ? (
                  <>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {silenceCountdown}
                    </div>
                    <span className="text-sm font-medium text-primary">Sending in {silenceCountdown}...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-4 h-4 bg-destructive rounded-full animate-ping opacity-50" />
                    </div>
                    <span className="text-sm font-medium text-destructive">Listening...</span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelRecording}
                className="h-7 px-2 text-muted-foreground hover:text-destructive"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              {voiceStatus === "countdown" 
                ? "Keep talking to cancel countdown" 
                : "Speak naturally, pause to send"
              }
            </p>
            
            {(interimTranscript || input) && (
              <div className="p-2 bg-background rounded border">
                <p className="text-sm text-foreground">
                  {input}{interimTranscript && <span className="text-muted-foreground">{interimTranscript}</span>}
                </p>
              </div>
            )}
          </div>
        )}

        {voiceStatus === "sending" && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-primary">Sending your message...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
