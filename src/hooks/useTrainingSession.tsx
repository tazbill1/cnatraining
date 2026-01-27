import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Scenario } from "@/lib/scenarios";
import { analyzeChecklistFromConversation, calculateChecklistProgress } from "@/lib/checklist";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SessionState {
  id: string | null;
  scenario: Scenario | null;
  messages: Message[];
  checklistState: Record<string, boolean>;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
}

export function useTrainingSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<SessionState>({
    id: null,
    scenario: null,
    messages: [],
    checklistState: {},
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (sessionState.isActive && sessionState.startTime) {
      timerRef.current = setInterval(() => {
        setSessionState((prev) => ({
          ...prev,
          elapsedSeconds: Math.floor(
            (Date.now() - prev.startTime!.getTime()) / 1000
          ),
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.startTime]);

  const startSession = useCallback(
    async (scenario: Scenario) => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Create session in database
        const { data, error } = await supabase
          .from("training_sessions")
          .insert({
            user_id: user.id,
            scenario_type: scenario.id,
            status: "in_progress",
            conversation: [],
            checklist_state: {},
          })
          .select()
          .single();

        if (error) throw error;

        // Set initial message from customer
        const initialMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: scenario.openingLine,
          timestamp: new Date(),
        };

        setSessionState({
          id: data.id,
          scenario,
          messages: [initialMessage],
          checklistState: {},
          isActive: true,
          startTime: new Date(),
          elapsedSeconds: 0,
        });

        // Save initial message
        await supabase
          .from("training_sessions")
          .update({ 
            conversation: [{ ...initialMessage, timestamp: initialMessage.timestamp.toISOString() }] 
          })
          .eq("id", data.id);
      } catch (error) {
        console.error("Error starting session:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start training session",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionState.id || !sessionState.scenario || !content.trim()) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...sessionState.messages, userMessage];
      setSessionState((prev) => ({
        ...prev,
        messages: updatedMessages,
      }));
      setIsTyping(true);

      try {
        // Call AI edge function
        const response = await supabase.functions.invoke("training-chat", {
          body: {
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            scenario: sessionState.scenario,
          },
        });

        if (response.error) throw response.error;

        const aiContent = response.data.content;
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: aiContent,
          timestamp: new Date(),
        };

        const allMessages = [...updatedMessages, aiMessage];

        // Analyze checklist
        const newChecklistState = analyzeChecklistFromConversation(
          allMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionState.checklistState
        );

        setSessionState((prev) => ({
          ...prev,
          messages: allMessages,
          checklistState: newChecklistState,
        }));

        // Save to database - convert dates to strings
        const conversationForDb = allMessages.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        }));
        
        await supabase
          .from("training_sessions")
          .update({
            conversation: conversationForDb,
            checklist_state: newChecklistState,
          })
          .eq("id", sessionState.id);
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get AI response. Please try again.",
        });
      } finally {
        setIsTyping(false);
      }
    },
    [sessionState, toast]
  );

  const endSession = useCallback(async () => {
    if (!sessionState.id) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      // Calculate scores
      const checklistProgress = calculateChecklistProgress(sessionState.checklistState);
      
      // Get AI evaluation
      const evalResponse = await supabase.functions.invoke("evaluate-session", {
        body: {
          messages: sessionState.messages,
          scenario: sessionState.scenario,
          checklistState: sessionState.checklistState,
          durationSeconds: sessionState.elapsedSeconds,
        },
      });

      const evaluation = evalResponse.data || {
        overallScore: Math.round(checklistProgress * 0.7 + 30),
        rapportScore: 75,
        infoGatheringScore: 70,
        needsIdentificationScore: 72,
        cnaCompletionScore: checklistProgress,
        feedback: {
          strengths: ["Good questioning technique", "Built rapport with customer"],
          improvements: ["Could probe deeper on priorities", "Ask more follow-up questions"],
          examples: [],
        },
      };

      // Update session in database
      await supabase
        .from("training_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          duration_seconds: sessionState.elapsedSeconds,
          score: evaluation.overallScore,
          rapport_score: evaluation.rapportScore,
          info_gathering_score: evaluation.infoGatheringScore,
          needs_identification_score: evaluation.needsIdentificationScore,
          cna_completion_score: evaluation.cnaCompletionScore,
          ai_feedback: evaluation.feedback,
        })
        .eq("id", sessionState.id);

      setSessionState((prev) => ({
        ...prev,
        isActive: false,
      }));

      return {
        sessionId: sessionState.id,
        ...evaluation,
        conversation: sessionState.messages,
        checklistState: sessionState.checklistState,
        durationSeconds: sessionState.elapsedSeconds,
        scenarioType: sessionState.scenario?.id,
      };
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save session results",
      });
      return null;
    }
  }, [sessionState, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    sessionState,
    isLoading,
    isTyping,
    startSession,
    sendMessage,
    endSession,
    formatTime,
  };
}
