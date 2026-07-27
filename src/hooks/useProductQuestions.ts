import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDealershipContext } from "@/hooks/useDealershipContext";
import type { DrillItem, DrillChoice } from "@/components/drills/StreakDrill";

export type ProductGameType = "quiz" | "wrong_claim" | "comparison";

interface ProductQuestionRow {
  id: string;
  game_type: string;
  make: string | null;
  model: string;
  model_year: number | null;
  trim: string | null;
  topic: string | null;
  difficulty: string;
  prompt: string;
  prompt_label: string | null;
  scenario: string | null;
  choices: unknown;
  explanation: string | null;
  coaching: string | null;
  sort_order: number;
}

function toChoices(raw: unknown): DrillChoice[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .map((c) => ({
      text: String(c.text ?? ""),
      correct: Boolean(c.correct),
      why: String(c.why ?? ""),
    }))
    .filter((c) => c.text.length > 0);
}

/** Loads a dealership's product-knowledge question bank for a given game type. */
export function useProductQuestions(gameType: ProductGameType) {
  const { profile } = useAuth();
  const { dealerships, previewDealershipId, selectedDealershipId } = useDealershipContext();
  const dealershipId =
    previewDealershipId ||
    selectedDealershipId ||
    profile?.dealership_id ||
    (dealerships.length === 1 ? dealerships[0].id : null);

  const [rows, setRows] = useState<ProductQuestionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!dealershipId) {
        setRows([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("product_questions")
        .select("*")
        .eq("dealership_id", dealershipId)
        .eq("game_type", gameType)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.warn("Failed to load product questions", error);
        setRows([]);
      } else {
        setRows((data || []) as ProductQuestionRow[]);
      }
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dealershipId, gameType]);

  const questions: DrillItem[] = useMemo(
    () =>
      rows
        .map((r) => ({
          id: r.id,
          topic: r.topic,
          vehicle: [r.model_year, r.make, r.model].filter(Boolean).join(" ") || null,
          prompt: r.prompt,
          promptLabel:
            r.prompt_label ||
            (gameType === "quiz"
              ? "Question:"
              : gameType === "comparison"
                ? "The customer says:"
                : "Spot the wrong claim:"),
          scenario: r.scenario || undefined,
          choices: toChoices(r.choices),
          explanation: r.explanation,
          coaching: r.coaching,
        }))
        .filter((q) => q.choices.some((c) => c.correct)),
    [rows, gameType]
  );

  const vehicles = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add([r.model_year, r.make, r.model].filter(Boolean).join(" ")));
    return Array.from(set);
  }, [rows]);

  return { questions, vehicles, isLoading, dealershipId };
}

/** Lightweight check used to decide whether to surface the product games. */
export function useHasProductQuestions(dealershipId: string | null) {
  const [available, setAvailable] = useState<Record<ProductGameType, boolean>>({
    quiz: false,
    wrong_claim: false,
    comparison: false,
  });
  const [vehicles, setVehicles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!dealershipId) {
        setAvailable({ quiz: false, wrong_claim: false, comparison: false });
        setVehicles([]);
        return;
      }
      const { data } = await supabase
        .from("product_questions")
        .select("game_type, make, model, model_year")
        .eq("dealership_id", dealershipId)
        .eq("is_active", true);
      if (cancelled) return;
      const types = new Set((data || []).map((r) => r.game_type));
      setAvailable({
        quiz: types.has("quiz"),
        wrong_claim: types.has("wrong_claim"),
        comparison: types.has("comparison"),
      });
      const labels = new Set<string>();
      (data || []).forEach((r) =>
        labels.add([r.model_year, r.make, r.model].filter(Boolean).join(" "))
      );
      setVehicles(Array.from(labels).filter(Boolean));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [dealershipId]);

  return { ...available, vehicles };
}
