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

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setMicPermission("granted");

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
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
        if (data.text && options.onTranscription) {
          options.onTranscription(data.text);
        }
      } catch (error) {
        console.error("Transcription error:", error);
        toast({
          variant: "destructive",
          title: "Transcription Error",
          description: "Failed to transcribe your audio. Please try again.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [options, toast]
  );

  const speakText = useCallback(
    async (text: string, voice: string = "alloy") => {
      if (isSpeaking) {
        // Stop current playback
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsSpeaking(false);
        return;
      }

      try {
        setIsSpeaking(true);

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
          throw new Error("Speech generation failed");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        console.error("Speech error:", error);
        setIsSpeaking(false);
        toast({
          variant: "destructive",
          title: "Speech Error",
          description: "Failed to generate speech. Please try again.",
        });
      }
    },
    [isSpeaking, toast]
  );

  const stopSpeaking = useCallback(() => {
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
