export function longestStreak(results: boolean[], lives = 3) {
  let streak = 0, best = 0, misses = 0;
  for (const correct of results) {
    if (misses >= lives) throw new Error("Answers continue after the round ended");
    if (correct) { streak += 1; best = Math.max(best, streak); }
    else { streak = 0; misses += 1; }
  }
  return { best, misses };
}

export function quizPercentage(
  questions: { id: string; choices: { id: string; correct: boolean }[] }[],
  answers: Record<string, string>,
) {
  if (!questions.length) return null;
  if (Object.keys(answers).length !== questions.length) throw new Error("Answer every quiz question");
  let correct = 0;
  for (const question of questions) {
    const choice = question.choices.find((c) => c.id === answers[question.id]);
    if (!choice) throw new Error("Invalid quiz answer");
    if (choice.correct) correct += 1;
  }
  return Math.round(correct / questions.length * 100);
}