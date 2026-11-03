import { MAX_SCORE_PER_GAME } from "./types";

/** Score 0–250: acierto + bonus de velocidad − penalidades. */
export function scoreFromTime(options: {
  correct: boolean;
  elapsedMs: number;
  idealMs?: number;
  floorMs?: number;
  penalties?: number;
}): number {
  if (!options.correct) return 0;
  const ideal = options.idealMs ?? 30_000;
  const floor = options.floorMs ?? 120_000;
  const elapsed = Math.max(0, options.elapsedMs);
  const timeRatio = Math.max(0, Math.min(1, 1 - (elapsed - ideal) / (floor - ideal)));
  const timePoints = Math.round(80 * timeRatio);
  const base = 170;
  const penalties = options.penalties ?? 0;
  return Math.max(0, Math.min(MAX_SCORE_PER_GAME, base + timePoints - penalties));
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(MAX_SCORE_PER_GAME, Math.round(value)));
}
