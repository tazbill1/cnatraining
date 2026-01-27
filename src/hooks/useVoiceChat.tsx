import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseVoiceChatOptions {
  onTranscription?: (text: string) => void;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unavailable">("prompt");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        // Check if mediaDevices is available (not in all contexts like iframes)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicPermission("unavailable");
          return;
        }

        // Try to query permission status
        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
            setMicPermission(result.state as "granted" | "denied" | "prompt");
            
            result.onchange = () => {
              setMicPermission(result.state as "granted" | "denied" | "prompt");
            };
          } catch {
            // Some browsers don't support microphone permission query
            setMicPermission("prompt");
          }
        }
      } catch {
        setMicPermission("unavailable");
      }
    };

    checkMicPermission();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission("unavailable");
        toast({
          variant: "destructive",
          title: "Microphone Unavailable",
          description: "Voice recording is not available in this browser context. Please open the app in a new tab or use text input.",
        });
        return;
      }

      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("Microphone access granted, setting up MediaRecorder...");
      setMicPermission("granted");

      // Check supported mime types
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      console.log("Using mime type:", mimeType || "default");

      const mediaRecorder = mimeType 
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available, size:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, chunks:", audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        console.log("Audio blob size:", audioBlob.size);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Only transcribe if we have audio data
        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        } else {
          console.error("No audio data captured");
          toast({
            variant: "destructive",
            title: "Recording Failed",
            description: "No audio was captured. Please try again and speak clearly.",
          });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      // Request data every 250ms to ensure we capture everything
      mediaRecorder.start(250);
      console.log("Recording started");
      setIsRecording(true);
    } catch (error: any) {
      console.error("Error starting recording:", error);
      
      // Check if it's a permission error
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicPermission("denied");
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings, or use text input instead.",
        });
      } else if (error.name === "NotFoundError") {
        setMicPermission("unavailable");
        toast({
          variant: "destructive",
          title: "No Microphone Found",
          description: "No microphone was detected. Please connect one or use text input.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Microphone Error",
          description: "Could not access your microphone. Please check permissions or use text input.",
        });
      }
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);
      try {
        // Check if browser supports Web Speech API for recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          // Fallback: try the edge function (requires OpenAI credits)
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
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 402) {
              throw new Error("Voice transcription requires API credits. Please use text input instead.");
            }
            throw new Error(errorData.error || "Transcription failed");
          }

          const data = await response.json();
          if (data.text && options.onTranscription) {
            options.onTranscription(data.text);
          }
        } else {
          // Use browser's built-in speech recognition (free)
          toast({
            title: "Voice Input",
            description: "Using browser speech recognition. Please speak clearly.",
          });
          
          // For now, show a message that browser recognition doesn't work with recorded audio
          // The user should use the browser's live speech recognition instead
          toast({
            variant: "destructive",
            title: "Recording Not Supported",
            description: "Please use text input. Voice recording requires API credits.",
          });
        }
      } catch (error) {
        console.error("Transcription error:", error);
        toast({
          variant: "destructive",
          title: "Transcription Error",
          description: error instanceof Error ? error.message : "Failed to transcribe your audio. Please use text input.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [options, toast]
  );

  const speakText = useCallback(
    async (text: string, _voice: string = "alloy") => {
      if (isSpeaking) {
        // Stop current playback
        window.speechSynthesis.cancel();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsSpeaking(false);
        return;
      }

      // Use browser's Web Speech API (free, works offline)
      if ('speechSynthesis' in window) {
        try {
          setIsSpeaking(true);
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          
          // Try to use a female voice for the customer persona
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('victoria') ||
            v.name.toLowerCase().includes('karen')
          );
          if (femaleVoice) {
            utterance.voice = femaleVoice;
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
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
  };
}
