import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Volume2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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

export function VoiceChat({ persona, onMessagesChange }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "processing" | "sending">("idle");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const finalTranscriptRef = useRef("");

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

  // Send message from voice input (bypasses input state)
  const sendMessageFromVoice = useCallback(async (transcript: string) => {
    if (!transcript || isProcessing) return;
    setInput(""); // Clear any interim text
    setVoiceStatus("sending");
    
    const userMessage: Message = { role: "user", content: transcript };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            persona: persona,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages([...newMessages, assistantMessage]);
      setVoiceStatus("idle");

      // Convert response to speech
      await speakText(data.message, data.voice);
    } catch (error) {
      console.error("Chat error:", error);
      setVoiceStatus("idle");
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, isProcessing, persona, toast]);

  // Start voice recording with Web Speech API
  const startRecording = useCallback(() => {
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    finalTranscriptRef.current = "";
    setInterimTranscript("");
    setVoiceStatus("listening");

    recognition.onstart = () => {
      console.log("Speech recognition started");
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
      }
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended, final:", finalTranscriptRef.current.trim());
      setIsRecording(false);
      setInterimTranscript("");
      
      const transcript = finalTranscriptRef.current.trim();
      if (transcript) {
        setVoiceStatus("sending");
        // Auto-send after speech ends
        sendMessageFromVoice(transcript);
      } else {
        setVoiceStatus("idle");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setInterimTranscript("");
      setVoiceStatus("idle");
      
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
  }, [initSpeechRecognition, sendMessageFromVoice, toast]);

  // Stop recording manually (will auto-send)
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // Cancel recording without sending
  const cancelRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort(); // Use abort instead of stop to prevent onend from sending
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript("");
    setInput("");
    setVoiceStatus("idle");
    finalTranscriptRef.current = "";
    toast({
      title: "Recording cancelled",
      description: "Your message was not sent.",
    });
  }, [toast]);

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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            persona: persona,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
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

  // Convert text to speech using OpenAI TTS
  const speakText = async (text: string, voice: string) => {
    setIsSpeaking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speak`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voice }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      // Continue even if TTS fails - user can still read the text
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
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
            placeholder="Type your message or use voice..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isProcessing || isRecording}
          />

          <div className="flex flex-col space-y-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              disabled={isProcessing}
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
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Voice Status Indicator */}
        {voiceStatus !== "idle" && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-2">
            {voiceStatus === "listening" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1" /> {/* Spacer */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-4 h-4 bg-destructive rounded-full animate-ping opacity-50" />
                    </div>
                    <span className="text-sm font-medium text-destructive">Listening...</span>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelRecording}
                      className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Speak naturally, then pause to send automatically
                </p>
                {(interimTranscript || input) && (
                  <div className="p-2 bg-background rounded border">
                    <p className="text-sm text-foreground">
                      {input}{interimTranscript && <span className="text-muted-foreground">{interimTranscript}</span>}
                    </p>
                  </div>
                )}
              </>
            )}
            
            {voiceStatus === "sending" && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-primary">Sending your message...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
