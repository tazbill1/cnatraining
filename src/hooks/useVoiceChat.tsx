import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface UseVoiceChatOptions {
  onTranscription?: (text: string) => void;
  autoSend?: boolean; // If true, auto-sends after silence detection
  onAutoSend?: (text: string) => void; // Called when auto-sending
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

export type VoiceStatus = "idle" | "listening" | "countdown" | "sending";

const SILENCE_COUNTDOWN_SECONDS = 2;
const MAX_RETRY_ATTEMPTS = 2;

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unavailable">("prompt");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState(SILENCE_COUNTDOWN_SECONDS);
  const [handsFreeModeEnabled, setHandsFreeModeEnabled] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const retryCountRef = useRef(0);
  const isRetryingRef = useRef(false);

  const safeCloseAudioContext = useCallback((ctx: AudioContext | null) => {
    if (!ctx) return;
    try {
      // AudioContext.close() returns a Promise and may reject in some browsers
      // if called at an unexpected time/state. We never want that to bubble up.
      void ctx.close().catch((e) => {
        logger.warn("AudioContext.close() rejected:", e);
      });
    } catch (e) {
      logger.warn("AudioContext.close() threw:", e);
    }
  }, []);

  // Check for Speech Recognition support
  const getSpeechRecognition = useCallback(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        safeCloseAudioContext(audioContextRef.current);
        audioContextRef.current = null;
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
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      logger.error("Error starting audio monitoring:", error);
    }
  }, []);

  // Stop audio level monitoring
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      safeCloseAudioContext(audioContextRef.current);
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  }, [safeCloseAudioContext]);

  // Start silence countdown
  const startSilenceCountdown = useCallback(() => {
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
  }, []);

  // Reset countdown when speech detected
  const resetCountdown = useCallback(() => {
    if (voiceStatus === "countdown") {
      setVoiceStatus("listening");
      setSilenceCountdown(SILENCE_COUNTDOWN_SECONDS);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [voiceStatus]);

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

      // Start audio level monitoring
      startAudioLevelMonitoring();

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      finalTranscriptRef.current = "";
      setInterimTranscript("");
      setVoiceStatus("listening");
      setSilenceCountdown(SILENCE_COUNTDOWN_SECONDS);
      lastSpeechTimeRef.current = Date.now();
      retryCountRef.current = 0;
      isRetryingRef.current = false;

      recognition.onstart = () => {
        logger.log("Speech recognition started");
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript + " ";
            lastSpeechTimeRef.current = Date.now();
            resetCountdown();
          } else {
            interim += result[0].transcript;
          }
        }
        
        setInterimTranscript(finalTranscriptRef.current + interim);

        // Start silence detection after getting some text (only if autoSend is enabled)
        if (options.autoSend && finalTranscriptRef.current.trim()) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            if (finalTranscriptRef.current.trim() && voiceStatus === "listening") {
              startSilenceCountdown();
            }
          }, 1500);
        }
      };

      recognition.onerror = (event) => {
        logger.error("Speech recognition error:", event.error);
        
        // Handle recoverable errors with retry
        if ((event.error === "audio-capture" || event.error === "network") && retryCountRef.current < MAX_RETRY_ATTEMPTS && !isRetryingRef.current) {
          logger.log(`Retrying speech recognition (attempt ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS})`);
          retryCountRef.current++;
          isRetryingRef.current = true;
          
          // Brief delay before retry
          setTimeout(() => {
            isRetryingRef.current = false;
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                logger.error("Retry failed:", e);
                // Cleanup on retry failure
                setIsRecording(false);
                setIsProcessing(false);
                setVoiceStatus("idle");
                stopAudioLevelMonitoring();
                retryCountRef.current = 0;
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                toast({
                  variant: "destructive",
                  title: "Speech Recognition Error",
                  description: "Could not restart microphone. Please try again.",
                });
              }
            }
          }, 300);
          return;
        }
        
        // Cleanup after non-recoverable error
        setIsRecording(false);
        setIsProcessing(false);
        setVoiceStatus("idle");
        stopAudioLevelMonitoring();
        retryCountRef.current = 0;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        
        if (event.error === "not-allowed") {
          setMicPermission("denied");
          toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings.",
          });
        } else if (event.error === "no-speech") {
          // Only show if we don't have any transcript yet
          if (!finalTranscriptRef.current.trim()) {
            toast({
              title: "No Speech Detected",
              description: "Please speak clearly into your microphone.",
            });
          }
        } else if (event.error === "audio-capture") {
          toast({
            variant: "destructive",
            title: "Microphone Lost",
            description: "Microphone connection interrupted. Please try again.",
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
        logger.log("Speech recognition ended, final:", finalTranscriptRef.current.trim());
        setIsRecording(false);
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
        
        const transcript = finalTranscriptRef.current.trim();
        if (transcript) {
          if (options.autoSend && options.onAutoSend) {
            setVoiceStatus("sending");
            options.onAutoSend(transcript);
          } else if (options.onTranscription) {
            setIsProcessing(true);
            options.onTranscription(transcript);
            setIsProcessing(false);
          }
        }
        
        if (!options.autoSend) {
          setVoiceStatus("idle");
        }
        setInterimTranscript("");
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error: any) {
      logger.error("Error starting speech recognition:", error);
      
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
  }, [getSpeechRecognition, options, toast, startAudioLevelMonitoring, stopAudioLevelMonitoring, startSilenceCountdown, resetCountdown, voiceStatus]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
    setVoiceStatus("idle");
    finalTranscriptRef.current = "";
    stopAudioLevelMonitoring();
    toast({
      title: "Recording cancelled",
      description: "Your message was not sent.",
    });
  }, [stopAudioLevelMonitoring, toast]);

  // Reset voice status (for external control)
  const resetVoiceStatus = useCallback(() => {
    setVoiceStatus("idle");
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
            // Auto-restart recording if hands-free mode is enabled
            if (handsFreeModeEnabled) {
              setTimeout(() => {
                startRecording();
              }, 300);
            }
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
    [isSpeaking, toast, handsFreeModeEnabled, startRecording]
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
    // Recording state
    isRecording,
    isProcessing,
    isSpeaking,
    micPermission,
    interimTranscript,
    
    // New voice features
    voiceStatus,
    audioLevel,
    silenceCountdown,
    handsFreeModeEnabled,
    setHandsFreeModeEnabled,
    
    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    speakText,
    stopSpeaking,
    resetVoiceStatus,
    
    // Constants
    SILENCE_COUNTDOWN_SECONDS,
  };
}
