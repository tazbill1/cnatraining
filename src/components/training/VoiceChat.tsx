import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
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

export function VoiceChat({ persona, onMessagesChange }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcribe audio using Whisper
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setInput(data.text);

      // Auto-send after transcription
      await sendMessage(data.text);
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription Error",
        description: "Could not transcribe audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Send message to Claude
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isProcessing) return;

    const userMessage: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsProcessing(true);

    try {
      // Get response from Claude
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

        {isRecording && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-destructive">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span>Recording... Click mic to stop</span>
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
