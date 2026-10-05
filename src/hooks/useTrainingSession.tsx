import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Scenario } from "@/lib/scenarios";
import { analyzeChecklistFromConversation } from "@/lib/checklist";
import { analyzePhoneChecklistFromConversation } from "@/lib/phoneChecklist";
import { analyzePhoneModule1Checklist, phoneModule1Checklist } from "@/lib/phoneModule1Checklist";
import { analyzeCricChecklistFromConversation } from "@/lib/cricChecklist";
import { analyzeTradeChecklistFromConversation } from "@/lib/tradeChecklist";
import { calculateEffectiveProgress, getEffectiveChecklist } from "@/lib/effectiveChecklist";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

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
  const { user, profile } = useAuth();
  
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
  const [streamingText, setStreamingText] = useState("");
  const [isGrading, setIsGrading] = useState(false);
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
            dealership_id: profile?.dealership_id || null,
            scenario_type: scenario.id,
            status: "in_progress",
            conversation: [],
            checklist_state: {},
          })
          .select()
          .single();

        if (error) throw error;

        // For scenarios where the customer opens (e.g. objection handling),
        // inject the opening line as the first assistant message
        const initialMessages: Message[] = [];
        if (scenario.customerOpens && scenario.openingLine) {
          initialMessages.push({
            id: crypto.randomUUID(),
            role: "assistant",
            content: scenario.openingLine,
            timestamp: new Date(),
          });
        }

        setSessionState({
          id: data.id,
          scenario,
          messages: initialMessages,
          checklistState: {},
          isActive: true,
          startTime: new Date(),
          elapsedSeconds: 0,
        });
      } catch (error) {
        logger.error("Error starting session:", error);
        toast.error("Failed to start training session");
      } finally {
        setIsLoading(false);
      }
    },
    [user, profile]
  );

  const sendMessage = useCallback(
    async (content: string, options?: { onError?: (content: string) => void }) => {
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
        const payload = {
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          scenarioId: sessionState.scenario.id,
          difficulty: sessionState.scenario.difficulty,
          stream: true,
        };

        // Stream the reply word-by-word; retry automatically if nothing arrived yet.
        const streamOnce = async (): Promise<string> => {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/training-chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${session?.access_token ?? ""}`,
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok || !res.body) throw new Error(`training-chat ${res.status}`);
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let text = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let idx: number;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, idx).replace(/\r$/, "");
              buffer = buffer.slice(idx + 1);
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json || json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json) as { choices?: { delta?: { content?: string } }[] };
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  text += delta;
                  setStreamingText(text);
                }
              } catch {
                buffer = line + "\n" + buffer;
                break;
              }
            }
          }
          if (!text.trim()) throw new Error("Empty reply");
          return text.trim();
        };

        let aiContent: string;
        try {
          aiContent = await streamOnce();
        } catch (firstErr) {
          logger.warn("Reply failed, retrying once:", firstErr);
          setStreamingText("");
          await new Promise((r) => setTimeout(r, 800));
          aiContent = await streamOnce();
        }
        setStreamingText("");
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: aiContent,
          timestamp: new Date(),
        };

        const allMessages = [...updatedMessages, aiMessage];

        // Analyze checklist based on scenario category
        const isObjectionHandling = sessionState.scenario?.category === "objection-handling";
        const isPhone = sessionState.scenario?.category === "inbound-call";
        const isTrade =
          !isObjectionHandling &&
          !isPhone &&
          !!sessionState.scenario?.customerName &&
          !!sessionState.scenario?.tradeVehicle;
        const convo = allMessages.map((m) => ({ role: m.role, content: m.content }));
        const newChecklistState = isObjectionHandling
          ? analyzeCricChecklistFromConversation(convo, sessionState.checklistState)
          : isPhone
            ? analyzePhoneModule1Checklist(convo, sessionState.checklistState)
            : isTrade
              ? analyzeTradeChecklistFromConversation(
                  convo,
                  analyzeChecklistFromConversation(convo, sessionState.checklistState),
                  "trade",
                )
              : analyzeChecklistFromConversation(convo, sessionState.checklistState);

        setSessionState((prev) => ({
          ...prev,
          messages: allMessages,
          checklistState: newChecklistState,
        }));

        // Save to database in background (non-blocking)
        const conversationForDb = allMessages.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        }));
        
        supabase
          .from("training_sessions")
          .update({
            conversation: conversationForDb,
            checklist_state: newChecklistState,
          })
          .eq("id", sessionState.id)
          .then(
            () => {},
            (err) => logger.error("Failed to save conversation:", err)
          );
      } catch (error) {
        logger.error("Error sending message:", error);
        setStreamingText("");
        toast.error("The customer didn't respond. Your message is back in the box — tap send to try again.");
        options?.onError?.(content);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionState]
  );

  const endSession = useCallback(async () => {
    if (!sessionState.id) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsGrading(true);
    try {
      // Calculate scores based on scenario type
      const checklistProgress = sessionState.scenario
        ? calculateEffectiveProgress(sessionState.scenario, sessionState.checklistState)
        : 0;
      
      // Get AI evaluation
      const effectiveItems = sessionState.scenario
        ? getEffectiveChecklist(sessionState.scenario).map((i) => i.id)
        : [];
      const evalResponse = await supabase.functions.invoke("evaluate-session", {
        body: {
          messages: sessionState.messages,
          scenario: sessionState.scenario,
          checklistState: sessionState.checklistState,
          effectiveChecklistIds: effectiveItems,
          durationSeconds: sessionState.elapsedSeconds,
        },
      });

      const evaluation = evalResponse.data || {
        overallScore: Math.round(checklistProgress * 0.7 + 30),
        rapportScore: 75,
        infoGatheringScore: 70,
        needsIdentificationScore: 72,
        cnaCompletionScore: checklistProgress,
        categories: null,
        overallTip: null,
        feedback: {
          strengths: ["Good questioning technique", "Built rapport with customer"],
          improvements: ["Could probe deeper on priorities", "Ask more follow-up questions"],
          examples: [],
        },
      };

      // Save full evaluation (categories, personality, moments) so history replay can show it.
      const aiFeedbackPayload = {
        ...(evaluation.feedback || {}),
        categories: evaluation.categories || null,
        overallTip: evaluation.overallTip || null,
        personalityType: evaluation.personalityType || null,
        moments: evaluation.moments || [],
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
          ai_feedback: aiFeedbackPayload,
        })
        .eq("id", sessionState.id);

      setSessionState((prev) => ({
        ...prev,
        isActive: false,
      }));

      return {
        sessionId: sessionState.id,
        ...evaluation,
        categories: evaluation.categories || null,
        overallTip: evaluation.overallTip || null,
        personalityType: evaluation.personalityType || null,
        moments: evaluation.moments || [],
        conversation: sessionState.messages,
        checklistState: sessionState.checklistState,
        durationSeconds: sessionState.elapsedSeconds,
        scenarioType: sessionState.scenario?.id,
      };
    } catch (error) {
      logger.error("Error ending session:", error);
        toast.error("Failed to save session results");
      return null;
    } finally {
      setIsGrading(false);
    }
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    sessionState,
    isLoading,
    isTyping,
    streamingText,
    isGrading,
    startSession,
    sendMessage,
    endSession,
    formatTime,
  };
}
