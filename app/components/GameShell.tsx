"use client";

import type { ReactNode } from "react";
import type { Cluster, ClusterId, Progress } from "@/app/lib/types";
import { Mark } from "./Mark";

type GameShellProps = {
  cluster: Cluster;
  phase: "intro" | "play" | "outro";
  progress: Progress;
  animate?: ClusterId | null;
  children: ReactNode;
};

export function GameShell({ cluster, phase, progress, animate, children }: GameShellProps) {
  return (
    <main className="mx-auto w-full max-w-[1040px] px-6 py-8 md:py-14">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p
            className="text-[12px] font-medium tracking-[0.16em] uppercase"
            style={{ color: cluster.accent }}
          >
            {cluster.name}
          </p>
          <h1
            className={`mt-3 font-light tracking-[-0.04em] ${
              phase === "play"
                ? "text-3xl leading-tight md:text-4xl"
                : "text-4xl leading-[0.95] md:text-6xl"
            }`}
          >
            {cluster.gameTitle}
          </h1>
        </div>
        <Mark
          progress={progress}
          animate={animate}
          className="h-14 shrink-0 md:h-16"
        />
      </div>
      <div className="mt-8 md:mt-10">{children}</div>
    </main>
  );
}
