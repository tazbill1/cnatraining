/**
 * Keeps drill rounds fresh across replays.
 *
 * Each drill remembers which question ids the learner has already been served
 * (per browser) and which ones they missed. A new round prefers:
 *   1. questions they have never seen,
 *   2. questions they previously got wrong (spaced repetition),
 *   3. everything else.
 * Once the whole bank has been seen, the "seen" list resets so the cycle repeats
 * with a different random order.
 */

const SEEN_PREFIX = "drill_seen_";
const MISSED_PREFIX = "drill_missed_";

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids.slice(-500)));
  } catch {
    /* storage full or unavailable — rotation just degrades to random */
  }
}

export function getSeenIds(drillKey: string): string[] {
  return read(SEEN_PREFIX + drillKey);
}

export function markSeen(drillKey: string, ids: string[]) {
  const key = SEEN_PREFIX + drillKey;
  const merged = Array.from(new Set([...read(key), ...ids]));
  write(key, merged);
}

export function resetSeen(drillKey: string) {
  write(SEEN_PREFIX + drillKey, []);
}

export function markMissed(drillKey: string, id: string) {
  const key = MISSED_PREFIX + drillKey;
  const merged = Array.from(new Set([...read(key), id]));
  write(key, merged);
}

export function clearMissed(drillKey: string, id: string) {
  const key = MISSED_PREFIX + drillKey;
  write(
    key,
    read(key).filter((v) => v !== id)
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Picks `count` items from `pool`, favouring unseen then previously-missed items. */
export function pickRotatedRound<T extends { id: string }>(
  pool: T[],
  count: number,
  drillKey: string
): T[] {
  if (pool.length === 0) return [];
  const size = Math.min(count, pool.length);

  let seen = new Set(getSeenIds(drillKey));
  // Everything (or nearly everything) has been served — start a fresh cycle.
  if (pool.filter((q) => !seen.has(q.id)).length < Math.ceil(size / 2)) {
    resetSeen(drillKey);
    seen = new Set();
  }

  const missed = new Set(read(MISSED_PREFIX + drillKey));
  const unseen = shuffle(pool.filter((q) => !seen.has(q.id)));
  const missedSeen = shuffle(pool.filter((q) => seen.has(q.id) && missed.has(q.id)));
  const rest = shuffle(pool.filter((q) => seen.has(q.id) && !missed.has(q.id)));

  const picked = [...unseen, ...missedSeen, ...rest].slice(0, size);
  markSeen(drillKey, picked.map((q) => q.id));
  return shuffle(picked);
}
