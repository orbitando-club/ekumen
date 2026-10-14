export type ClusterId = "think" | "together" | "happen" | "deliver";

export type Progress = Record<ClusterId, boolean>;

export const emptyProgress: Progress = {
  think: false,
  together: false,
  happen: false,
  deliver: false,
};

export type ValueDef = {
  name: string;
  line: string;
};

export type Cluster = {
  id: ClusterId;
  name: string;
  minutes: string;
  accent: string;
  gameTitle: string;
  scene: string;
  opening: string;
  closing: string;
  values: [ValueDef, ValueDef];
};
