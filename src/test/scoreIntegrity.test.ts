import { describe, expect, it } from "vitest";
import { longestStreak, quizPercentage } from "../../supabase/functions/_shared/scoreValidation";
import { staticDrillKeys, legacyQuizKeys } from "../../supabase/functions/_shared/staticScoreKeys";
import { phoneOpenerDrillQuestions } from "../lib/phoneOpenerDrillQuestions";
import { bypassDrillQuestions } from "../lib/bypassDrillQuestions";
import { spotTheMistakeDrillQuestions } from "../lib/spotTheMistakeDrillQuestions";
import { spacedMatchQuestions } from "../lib/spacedMatchQuestions";
import { eitherOrCloseQuestions } from "../lib/eitherOrCloseQuestions";
import { cricMatchQuestions } from "../lib/cricMatchQuestions";
import { hotButtonQuestions } from "../lib/hotButtonQuestions";
import { module1Quiz } from "../lib/moduleContent";
import { module2Quiz } from "../lib/module2Content";

describe("Server-computed scores", () => {
  it("computes the longest streak instead of trusting a submitted total", () => {
    expect(longestStreak([true, true, false, true, true, true])).toEqual({ best: 3, misses: 1 });
  });
  it("does not accept answers after three lost lives", () => {
    expect(() => longestStreak([false, false, false, true])).toThrow();
  });
  it("grades 80 percent from four correct answers out of five", () => {
    const questions = Object.entries(legacyQuizKeys['vehicle-selection-fundamentals']).map(([id, choices]) => ({ id, choices }));
    expect(quizPercentage(questions, { q1: 'b', q2: 'b', q3: 'b', q4: 'b', q5: 'a' })).toBe(80);
  });
  it("rejects incomplete quizzes rather than recording a completion", () => {
    expect(() => quizPercentage([{ id: 'q1', choices: [{ id: 'a', correct: true }] }], {})).toThrow();
  });
  it("rejects fabricated choice identifiers", () => {
    expect(() => quizPercentage([{ id: 'q1', choices: [{ id: 'a', correct: true }] }], { q1: 'fake' })).toThrow();
  });
  it("keeps every static game answer bank synchronized", () => {
    const banks = { phone_opener_drill_best_streak: phoneOpenerDrillQuestions, bypass_drill_best_streak: bypassDrillQuestions,
      spot_the_mistake_drill_best_streak: spotTheMistakeDrillQuestions, spaced_match_best_streak: spacedMatchQuestions,
      either_or_close_best_streak: eitherOrCloseQuestions, cric_match_best_streak: cricMatchQuestions, hot_button_best_streak: hotButtonQuestions };
    for (const [key, bank] of Object.entries(banks)) expect(staticDrillKeys[key as keyof typeof staticDrillKeys]).toEqual(
      Object.fromEntries(bank.map((q) => [q.id, q.choices.map((c) => ({ text: c.text, correct: c.correct }))])));
  });
  it("keeps both legacy quiz answer banks synchronized", () => {
    for (const [id, questions] of [['vehicle-selection-fundamentals', module1Quiz], ['trade-appraisal-process', module2Quiz]] as const) {
      expect(legacyQuizKeys[id]).toEqual(Object.fromEntries(questions.map((q) => [q.id, q.options.map((o) => ({ id: o.id, correct: o.isCorrect }))])));
    }
  });
});