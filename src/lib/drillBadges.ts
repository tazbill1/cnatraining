export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface BadgeContext {
  total: number;
  correctCount: number;
  bestStreak: number;
  livesRemaining: number;
  startingLives: number;
}

export function computeBadges(ctx: BadgeContext): Badge[] {
  const badges: Badge[] = [];
  const { total, correctCount, bestStreak, livesRemaining, startingLives } = ctx;

  if (total > 0 && correctCount === total) {
    badges.push({
      id: "perfect",
      label: "Perfect Round",
      emoji: "🏆",
      description: "Every answer correct.",
    });
  }
  if (livesRemaining === startingLives && total > 0) {
    badges.push({
      id: "flawless",
      label: "No Lives Lost",
      emoji: "❤️",
      description: "Finished with all hearts intact.",
    });
  }
  if (bestStreak >= 5) {
    badges.push({
      id: "streak5",
      label: "On Fire",
      emoji: "🔥",
      description: "Hit a 5+ answer streak.",
    });
  }
  if (bestStreak >= 10) {
    badges.push({
      id: "streak10",
      label: "Unstoppable",
      emoji: "⚡️",
      description: "Hit a 10+ answer streak.",
    });
  }
  if (correctCount >= Math.ceil(total * 0.8) && livesRemaining === 0) {
    badges.push({
      id: "clutch",
      label: "Clutch",
      emoji: "💪",
      description: "Finished strong with no hearts to spare.",
    });
  }
  return badges;
}
