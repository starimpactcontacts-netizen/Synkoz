import { seededShuffle } from './rng';

// Produces a decreasing headcount curve like 184 -> 92 -> 39 -> 14 -> 4 -> 2 -> 1:
// always strictly decreasing, always ends 2, 1 (so the tail can become a duel + reveal).
export function buildMilestones(total: number): number[] {
  if (total <= 1) return [Math.max(total, 1)];
  if (total === 2) return [2, 1];

  const ratios = [0.5, 0.42, 0.35, 0.32, 0.4, 0.45, 0.5];
  const milestones = [total];
  let remaining = total;
  let i = 0;
  while (remaining > 2) {
    const ratio = ratios[Math.min(i, ratios.length - 1)];
    const next = Math.max(2, Math.min(Math.round(remaining * ratio), remaining - 1));
    milestones.push(next);
    remaining = next;
    i++;
  }
  milestones.push(1);
  return milestones;
}

export type SpinPlan = {
  /** Headcount after each transition, e.g. [184, 92, 39, 14, 4, 2, 1]. */
  milestones: number[];
  /** Which elimination wave (index into waveDurations) removes a given id. */
  waveOfId: Map<string, number>;
  /** Duration in ms of each elimination wave (everything before the final duel). */
  waveDurations: number[];
  /** The id facing the winner in the final 1-on-1, if there were >= 2 participants. */
  opponentId: string | null;
};

/**
 * Builds a deterministic elimination plan from a seed so all viewers (and
 * re-renders) replay the identical sequence of cuts for the same spin.
 */
export function buildSpinPlan(ids: string[], winnerId: string, seed: number): SpinPlan {
  const milestones = buildMilestones(ids.length);
  const others = seededShuffle(
    ids.filter((id) => id !== winnerId),
    seed,
  );

  const waveOfId = new Map<string, number>();
  const numElimWaves = Math.max(0, milestones.length - 2);
  let cursor = 0;
  for (let w = 0; w < numElimWaves; w++) {
    const removeCount = milestones[w] - milestones[w + 1];
    for (let k = 0; k < removeCount; k++) {
      waveOfId.set(others[cursor], w);
      cursor++;
    }
  }
  const opponentId = others[cursor] ?? null;

  const waveDurations = Array.from({ length: numElimWaves }, (_, w) => Math.min(700, 260 + w * 130));

  return { milestones, waveOfId, waveDurations, opponentId };
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
