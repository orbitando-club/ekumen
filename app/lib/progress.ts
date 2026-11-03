"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClusterId, Progress, ScoreBreakdown } from "./types";
import { emptyProgress, emptyScores } from "./types";

const STORAGE_KEY = "ekumen-sandbox-v2";
const EVENT = "ekumen-progress";

export type SessionState = {
  progress: Progress;
  scores: ScoreBreakdown;
  displayName: string;
  submitted: boolean;
};

const emptySession: SessionState = {
  progress: emptyProgress,
  scores: emptyScores,
  displayName: "",
  submitted: false,
};

export function readSession(): SessionState {
  if (typeof window === "undefined") return emptySession;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      progress: {
        think: Boolean(parsed.progress?.think),
        together: Boolean(parsed.progress?.together),
        happen: Boolean(parsed.progress?.happen),
        deliver: Boolean(parsed.progress?.deliver),
      },
      scores: {
        think: Number(parsed.scores?.think) || 0,
        together: Number(parsed.scores?.together) || 0,
        happen: Number(parsed.scores?.happen) || 0,
        deliver: Number(parsed.scores?.deliver) || 0,
      },
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
      submitted: Boolean(parsed.submitted),
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

  const reset = useCallback(() => {
    writeSession(emptySession);
    setSession(emptySession);
  }, []);

  return {
    progress: session.progress,
    scores: session.scores,
    displayName: session.displayName,
    submitted: session.submitted,
    ready,
    markComplete,
    setDisplayName,
    markSubmitted,
    reset,
  };
}
