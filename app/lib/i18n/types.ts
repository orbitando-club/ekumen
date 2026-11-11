import type { ClusterId } from "@/app/lib/types";

export type Locale = "es" | "en";

export type ValueCopy = {
  /** Nombre canónico del brandbook (siempre en inglés). */
  name: string;
  line: string;
};

export type AxisCopy = {
  id: ClusterId;
  name: string;
  accent: string;
  minutes: string;
  gameTitle: string;
  story: string[];
  gamePrompt: string;
  closing: string;
  values: [ValueCopy, ValueCopy];
  startChallenge: string;
};

export type Dictionary = {
  locale: Locale;
  localeLabel: string;
  otherLocale: Locale;
  otherLocaleLabel: string;
  intro: {
    title: string;
    headline: string;
    lead: string;
    dilemmas: string[];
    bridge: string;
    question: string;
    setup: string;
    /** Las 4 dimensiones, en el mismo orden que los clusters/axisCards. */
    dimensions: [string, string, string, string];
    ekuthon: string;
    cta: string;
  };
  ui: {
    reset: string;
    valuesReveal: string;
    axisPoints: string;
    nextAxis: string;
    seeClosing: string;
    outOf: string;
    pts: string;
    ready: string;
    emptyRanking: string;
  };
  closing: {
    title: string;
    subtitle: string;
    scoreLabel: string;
    ekuthonTicket: string;
    ekuthonDetail: string;
    ekuthonSpoiler: string;
    namePrompt: string;
    namePlaceholder: string;
    submit: string;
    rankingTitle: string;
    rankingLocal: string;
    replay: string;
  };
  insight: {
    hint: string;
    undoHint: string;
    lines: string;
    dots: string;
    check: string;
    clear: string;
    needAll: string;
    tooMany: string;
    success: string;
    solutionTitle: string;
  };
  elephant: {
    scrubHint: string;
    question: string;
    options: string[];
    correct: string;
    success: string;
    fail: string;
  };
  axisCards: {
    id: "think" | "together" | "happen" | "deliver";
    /** Ruta a ícono plain (p. ej. /icons/brain.png). */
    icon: string;
    label: string;
    color: string;
  }[];
  riddle: {
    clues: string;
    extraHintBtn: string;
    extraHint: string;
    assign: string;
    check: string;
    needAll: string;
    uniqueRoles: string;
    wrong: string;
    success: string;
    people: string[];
    roles: string[];
  };
  wordle: {
    needFive: string;
    success: string;
    fail: string;
    legendPresent: string;
    legendCorrect: string;
    legendAbsent: string;
  };
  axes: AxisCopy[];
};
