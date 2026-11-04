import { MAX_SCORE_PER_GAME } from "./types";

/** Calidad al resolver bien: 60–100 según qué tan óptimo. */
export const QUALITY_MIN = 60;
export const QUALITY_MAX = 100;
/** Tiempo: 1 pt por segundo bajo el techo (máx. 150 s → 150 pts). */
export const TIME_CAP_SECONDS = 150;
export const TIME_MAX = 150;

export type ScoreBreakdown = {
  quality: number;
  time: number;
  total: number;
};

/**
 * quality 60–100 si resolvió bien (el caller calcula el óptimo).
 * time = max(0, 150 − segundos) → más rápido = más puntos.
 */
export function scoreFromQualityAndTime(qualityRaw: number, elapsedMs: number): ScoreBreakdown {
  const quality = Math.max(
    QUALITY_MIN,
    Math.min(QUALITY_MAX, Math.round(qualityRaw)),
  );
  const seconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const time = Math.max(0, Math.min(TIME_MAX, TIME_CAP_SECONDS - seconds));
  const total = Math.max(0, Math.min(MAX_SCORE_PER_GAME, quality + time));
  return { quality, time, total };
}

/** Si no resolvió bien: 0 calidad; el tiempo no aplica (total 0). */
export function scoreFailed(): ScoreBreakdown {
  return { quality: 0, time: 0, total: 0 };
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(MAX_SCORE_PER_GAME, Math.round(value)));
}

/** Insight: ≤4 líneas = 100; cada línea extra −10, piso 60. */
export function insightQuality(lines: number) {
  if (lines <= 4) return QUALITY_MAX;
  return Math.max(QUALITY_MIN, QUALITY_MAX - (lines - 4) * 10);
}

/** Elefante: respuesta correcta = 100. */
export function elephantQuality(correct: boolean) {
  return correct ? QUALITY_MAX : 0;
}

/** Acertijo: sin pista 100; cada pista −40, piso 60 si resolvió. */
export function riddleQuality(hintsUsed: number) {
  return Math.max(QUALITY_MIN, QUALITY_MAX - hintsUsed * 40);
}

/** Wordle: 1 intento 100 … 6 intentos 60; si perdió, 0. */
export function wordleQuality(won: boolean, guessesUsed: number) {
  if (!won) return 0;
  const g = Math.max(1, Math.min(6, guessesUsed));
  return Math.max(QUALITY_MIN, QUALITY_MAX - (g - 1) * 8);
}
