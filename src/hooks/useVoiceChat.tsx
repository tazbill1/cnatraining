import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseVoiceChatOptions {
  onTranscription?: (text: string) => void;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
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

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unavailable">("prompt");
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for Speech Recognition support
  const getSpeechRecognition = useCallback(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }, []);

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const SpeechRecognitionAPI = getSpeechRecognition();
        if (!SpeechRecognitionAPI) {
          setMicPermission("unavailable");
          return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicPermission("unavailable");
          return;
        }

        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
            setMicPermission(result.state as "granted" | "denied" | "prompt");
            
            result.onchange = () => {
              setMicPermission(result.state as "granted" | "denied" | "prompt");
            };
          } catch {
            setMicPermission("prompt");
          }
        }
      } catch {
        setMicPermission("unavailable");
      }
    };

    checkMicPermission();
  }, [getSpeechRecognition]);

  const startRecording = useCallback(async () => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    
    if (!SpeechRecognitionAPI) {
      setMicPermission("unavailable");
      toast({
        variant: "destructive",
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
      });
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true);
        setInterimTranscript("");
        finalTranscript = "";
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        
        setInterimTranscript(finalTranscript + interim);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsProcessing(false);
        
        if (event.error === "not-allowed") {
          setMicPermission("denied");
          toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings.",
          });
        } else if (event.error === "no-speech") {
          // No speech detected - not an error, just inform the user
          toast({
            title: "No Speech Detected",
            description: "Please speak clearly into your microphone and try again.",
          });
        } else if (event.error !== "aborted") {
          toast({
            variant: "destructive",
            title: "Speech Recognition Error",
            description: "Something went wrong. Please try again.",
          });
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended, final:", finalTranscript.trim());
        setIsRecording(false);
        
        if (finalTranscript.trim() && options.onTranscription) {
          setIsProcessing(true);
          options.onTranscription(finalTranscript.trim());
          setIsProcessing(false);
        }
        
        setInterimTranscript("");
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error: any) {
      console.error("Error starting speech recognition:", error);
      
      if (error.name === "NotAllowedError") {
        setMicPermission("denied");
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Microphone Error",
          description: "Could not access your microphone. Please check permissions.",
        });
      }
    }
  }, [getSpeechRecognition, options, toast]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speakText = useCallback(
    async (text: string, _voice: string = "alloy") => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsSpeaking(false);
        return;
      }

      if ('speechSynthesis' in window) {
        try {
          setIsSpeaking(true);
          
          // Cancel any ongoing speech first
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Slower, more natural speaking rate
          utterance.rate = 0.9;
          utterance.pitch = 1.05;
          utterance.volume = 1.0;
          
          // Get voices - may need to wait for them to load
          let voices = window.speechSynthesis.getVoices();
          
          // If no voices yet, wait for them to load
          if (voices.length === 0) {
            await new Promise<void>((resolve) => {
              window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                resolve();
              };
              // Timeout fallback
              setTimeout(resolve, 100);
            });
          }
          
          // Priority order for natural-sounding female voices
          const preferredVoices = [
            'google us english female',
            'google uk english female', 
            'samantha',
            'victoria',
            'karen',
            'moira',
            'fiona',
            'tessa',
            'veena',
            'female',
            'woman',
            'zira',
            'hazel'
          ];
          
          // Find the best available voice
          let selectedVoice = null;
          for (const preferred of preferredVoices) {
            selectedVoice = voices.find(v => 
              v.name.toLowerCase().includes(preferred)
            );
            if (selectedVoice) break;
          }
          
          // Fallback: prefer any English voice that's not the default robotic one
          if (!selectedVoice) {
            selectedVoice = voices.find(v => 
              v.lang.startsWith('en') && !v.name.toLowerCase().includes('microsoft')
            ) || voices.find(v => v.lang.startsWith('en'));
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("Using voice:", selectedVoice.name);
          }

          utterance.onend = () => {
            setIsSpeaking(false);
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
          };

          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Speech error:", error);
          setIsSpeaking(false);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Speech Unavailable",
          description: "Your browser doesn't support text-to-speech.",
        });
      }
    },
    [isSpeaking, toast]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    micPermission,
    interimTranscript,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
  };
}
