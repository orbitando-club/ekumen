"use client";

import { useState } from "react";
import { SiteHeader } from "@/app/components/SiteChrome";
import { GameShell } from "@/app/components/GameShell";
import { Button } from "@/app/components/Button";
import { getCluster, getNextCluster } from "@/app/lib/clusters";
import { completedCount, useProgress } from "@/app/lib/progress";
import type { ClusterId } from "@/app/lib/types";
import { ThinkGame } from "@/app/games/ThinkGame";
import { TogetherGame } from "@/app/games/TogetherGame";
import { HappenGame } from "@/app/games/HappenGame";
import { DeliverGame } from "@/app/games/DeliverGame";

type Phase = "intro" | "play" | "outro";

export function GameExperience({ id }: { id: ClusterId }) {
  const cluster = getCluster(id);
  const { progress, ready, markComplete } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [completed, setCompleted] = useState(false);
  const [animate, setAnimate] = useState<ClusterId | null>(null);

  function finish(didComplete: boolean) {
    if (didComplete) {
      markComplete(id);
      setAnimate(id);
    }
    setCompleted(didComplete);
    setPhase("outro");
  }

  const shown = ready ? progress : undefined;
  const total = completedCount(progress);
  const allDone = completed && total === 4;
  const nextId = getNextCluster(id, { ...progress, [id]: completed || progress[id] });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <GameShell cluster={cluster} phase={phase} progress={shown ?? progress} animate={animate}>
        {phase === "intro" ? (
          <div className="max-w-2xl">
            <p className="text-xl leading-relaxed font-light md:text-2xl">{cluster.opening}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#02043E]/65">
              Si te equivocás, deshacé o vaciá y volvé a comprobar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setPhase("play")}>Empezar</Button>
              <Button href="/" variant="secondary">
                Volver al inicio
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "play" ? (
          <div>
            {id === "think" ? <ThinkGame onFinish={finish} /> : null}
            {id === "together" ? <TogetherGame onFinish={finish} /> : null}
            {id === "happen" ? <HappenGame onFinish={finish} /> : null}
            {id === "deliver" ? <DeliverGame onFinish={finish} /> : null}
          </div>
        ) : null}

        {phase === "outro" ? (
          <div className="max-w-2xl">
            {completed ? (
              <p className="mb-4 text-sm font-medium" style={{ color: cluster.accent }}>
                Listo · {cluster.name}
              </p>
            ) : null}

            <ul className="mb-6 space-y-3">
              {cluster.values.map((value) => (
                <li key={value.name}>
                  <p className="font-medium" style={{ color: cluster.accent }}>
                    {value.name}
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#02043E]/70">{value.line}</p>
                </li>
              ))}
            </ul>

            <p className="text-xl leading-relaxed font-light md:text-2xl">{cluster.closing}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {allDone ? (
                <Button href="/cierre">Ver el isologo</Button>
              ) : (
                <Button href="/">Volver al inicio</Button>
              )}
              {!allDone && nextId ? (
                <Button href={`/jugar/${nextId}`} variant="secondary">
                  Siguiente práctica
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </GameShell>
    </div>
  );
}
