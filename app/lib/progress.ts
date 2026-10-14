"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClusterId, Progress } from "./types";
import { emptyProgress } from "./types";

const STORAGE_KEY = "ekumen-triangulos";
const EVENT = "ekumen-progress";

export function readProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      think: Boolean(parsed.think),
      together: Boolean(parsed.together),
      happen: Boolean(parsed.happen),
      deliver: Boolean(parsed.deliver),
    };
  } catch {
    return emptyProgress;
  }
}

export function writeProgress(progress: Progress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}

export function completedCount(progress: Progress) {
  return Object.values(progress).filter(Boolean).length;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    setReady(true);
    const sync = () => setProgress(readProgress());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const markComplete = useCallback((id: ClusterId) => {
    const next = { ...readProgress(), [id]: true };
    writeProgress(next);
    setProgress(next);
    return next;
  }, []);

  const reset = useCallback(() => {
    writeProgress(emptyProgress);
    setProgress(emptyProgress);
  }, []);

  return { progress, ready, markComplete, reset };
}
