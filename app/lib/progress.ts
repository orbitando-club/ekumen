"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClusterId, Progress, ScoreBreakdown } from "./types";
import { CLUSTER_ORDER, emptyProgress, emptyScores } from "./types";

const STORAGE_KEY = "ekumen-sandbox-v2";
const EVENT = "ekumen-progress";

export type Phase = "intro" | "axis" | "closing";
export type AxisStep = "story" | "play" | "reveal";

export type ViewState = {
  phase: Phase;
  axisIndex: number;
  axisStep: AxisStep;
};

export type SessionState = {
  progress: Progress;
  scores: ScoreBreakdown;
  displayName: string;
  submitted: boolean;
  view: ViewState;
};

export const defaultView: ViewState = {
  phase: "intro",
  axisIndex: 0,
  axisStep: "story",
};

const emptySession: SessionState = {
  progress: emptyProgress,
  scores: emptyScores,
  displayName: "",
  submitted: false,
  view: defaultView,
};

function isPhase(value: unknown): value is Phase {
  return value === "intro" || value === "axis" || value === "closing";
}

function isAxisStep(value: unknown): value is AxisStep {
  return value === "story" || value === "play" || value === "reveal";
}

function clampAxisIndex(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(CLUSTER_ORDER.length - 1, Math.floor(n)));
}

/** Migra sesiones viejas sin `view` hacia un punto sensato según el progreso. */
function inferView(progress: Progress, raw?: Partial<ViewState> | null): ViewState {
  if (raw && isPhase(raw.phase) && isAxisStep(raw.axisStep)) {
    return {
      phase: raw.phase,
      axisIndex: clampAxisIndex(raw.axisIndex),
      axisStep: raw.axisStep,
    };
  }

  const done = Object.values(progress).filter(Boolean).length;
  if (done === CLUSTER_ORDER.length) {
    return { phase: "closing", axisIndex: CLUSTER_ORDER.length - 1, axisStep: "reveal" };
  }
  if (done > 0) {
    const nextIndex = CLUSTER_ORDER.findIndex((id) => !progress[id]);
    return {
      phase: "axis",
      axisIndex: nextIndex >= 0 ? nextIndex : 0,
      axisStep: "story",
    };
  }
  return defaultView;
}

export function readSession(): SessionState {
  if (typeof window === "undefined") return emptySession;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    const progress: Progress = {
      think: Boolean(parsed.progress?.think),
      together: Boolean(parsed.progress?.together),
      happen: Boolean(parsed.progress?.happen),
      deliver: Boolean(parsed.progress?.deliver),
    };
    return {
      progress,
      scores: {
        think: Number(parsed.scores?.think) || 0,
        together: Number(parsed.scores?.together) || 0,
        happen: Number(parsed.scores?.happen) || 0,
        deliver: Number(parsed.scores?.deliver) || 0,
      },
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
      submitted: Boolean(parsed.submitted),
      view: inferView(progress, parsed.view),
    };
  } catch {
    return emptySession;
  }
}

export function writeSession(session: SessionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
}

export function completedCount(progress: Progress) {
  return Object.values(progress).filter(Boolean).length;
}

export function totalScore(scores: ScoreBreakdown) {
  return scores.think + scores.together + scores.happen + scores.deliver;
}

export function useProgress() {
  const [session, setSession] = useState<SessionState>(emptySession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
    const sync = () => setSession(readSession());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const markComplete = useCallback((id: ClusterId, score: number) => {
    const current = readSession();
    const next: SessionState = {
      ...current,
      progress: { ...current.progress, [id]: true },
      scores: { ...current.scores, [id]: score },
      submitted: false,
    };
    writeSession(next);
    setSession(next);
    return next;
  }, []);

  const setDisplayName = useCallback((displayName: string) => {
    const next = { ...readSession(), displayName };
    writeSession(next);
    setSession(next);
  }, []);

  const markSubmitted = useCallback(() => {
    const next = { ...readSession(), submitted: true };
    writeSession(next);
    setSession(next);
  }, []);

  const setView = useCallback((view: ViewState) => {
    const next = { ...readSession(), view };
    writeSession(next);
    setSession(next);
  }, []);

  const reset = useCallback(() => {
    writeSession(emptySession);
    setSession(emptySession);
  }, []);

  return {
    progress: session.progress,
    scores: session.scores,
    displayName: session.displayName,
    submitted: session.submitted,
    view: session.view,
    ready,
    markComplete,
    setDisplayName,
    markSubmitted,
    setView,
    reset,
  };
}
