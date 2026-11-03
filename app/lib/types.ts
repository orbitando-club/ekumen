export type ClusterId = "think" | "together" | "happen" | "deliver";

export type Progress = Record<ClusterId, boolean>;

export const emptyProgress: Progress = {
  think: false,
  together: false,
  happen: false,
  deliver: false,
};

export type ScoreBreakdown = Record<ClusterId, number>;

export const emptyScores: ScoreBreakdown = {
  think: 0,
  together: 0,
  happen: 0,
  deliver: 0,
};

export const CLUSTER_ORDER: ClusterId[] = ["think", "together", "happen", "deliver"];

export const MAX_SCORE_PER_GAME = 250;
export const MAX_TOTAL_SCORE = MAX_SCORE_PER_GAME * 4;

export type ValueDef = {
  name: string;
  line: string;
};

export type AxisContent = {
  id: ClusterId;
  name: string;
  accent: string;
  minutes: string;
  gameTitle: string;
  story: string[];
  gamePrompt: string;
  closing: string;
  values: [ValueDef, ValueDef];
};

export type GameResult = {
  score: number;
  meta?: Record<string, number | string | boolean>;
};
