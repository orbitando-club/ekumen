"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/Button";
import type { GameResult } from "@/app/lib/types";
import { clampScore, scoreFromTime } from "@/app/lib/scoring";

type PartId = "side" | "tusk" | "trunk" | "leg" | "ear" | "tail";

const PARTS: {
  id: PartId;
  label: string;
  simile: string;
  path: string;
}[] = [
  {
    id: "side",
    label: "Costado",
    simile: "como una pared",
    path: "M120 90 H210 V150 H120 Z",
  },
  {
    id: "tusk",
    label: "Colmillo",
    simile: "como una lanza",
    path: "M78 128 L42 158 L52 164 L88 132 Z",
  },
  {
    id: "trunk",
    label: "Trompa",
    simile: "como una serpiente",
    path: "M70 100 C40 110 28 150 48 175 C58 160 62 140 78 120 Z",
  },
  {
    id: "leg",
    label: "Pata",
    simile: "como un árbol",
    path: "M150 150 H178 V210 H150 Z",
  },
  {
    id: "ear",
    label: "Oreja",
    simile: "como un abanico",
    path: "M118 70 C150 40 200 55 205 95 C175 100 140 100 118 88 Z",
  },
  {
    id: "tail",
    label: "Cola",
    simile: "como una cuerda",
    path: "M210 120 C235 125 248 145 252 168 L242 170 C238 150 228 135 210 130 Z",
  },
];

const OPTIONS = ["Una pared", "Un elefante", "Seis animales distintos", "Una serpiente"];

type Props = {
  onFinish: (result: GameResult) => void;
};

export function ElephantGame({ onFinish }: Props) {
  const started = useRef(Date.now());
  const [found, setFound] = useState<Set<PartId>>(new Set());
  const [active, setActive] = useState<PartId | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const allFound = found.size === PARTS.length;

  function discover(id: PartId) {
    setActive(id);
    setFound((prev) => new Set(prev).add(id));
  }

  function choose(option: string) {
    if (done || !allFound) return;
    setAnswer(option);
    setDone(true);
    const correct = option === "Un elefante";
    const exploreScore = scoreFromTime({
      correct: true,
      elapsedMs: Date.now() - started.current,
      idealMs: 35_000,
      floorMs: 100_000,
      penalties: 0,
    });
    const discoveryShare = Math.round(exploreScore * 0.55);
    const answerShare = correct ? 110 : 0;
    const score = clampScore(discoveryShare + answerShare);
    window.setTimeout(
      () =>
        onFinish({
          score,
          meta: { parts: found.size, correct, answer: option },
        }),
      800,
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-[#eef2fb] p-4 md:p-6">
        <svg
          viewBox="0 0 280 230"
          className="mx-auto h-auto w-full max-w-[360px]"
          role="img"
          aria-label="Silueta interactiva: tocá cada parte"
        >
          <ellipse cx="155" cy="125" rx="78" ry="48" fill="#d7e4fb" />
          <circle cx="95" cy="105" r="42" fill="#d7e4fb" />
          {PARTS.map((part) => {
            const isFound = found.has(part.id);
            const isActive = active === part.id;
            return (
              <path
                key={part.id}
                d={part.path}
                fill={isFound ? "#448FF4" : "#b7c9e8"}
                fillOpacity={isActive ? 1 : isFound ? 0.85 : 0.55}
                stroke="#023D8F"
                strokeWidth={isActive ? 2.5 : 1.5}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => discover(part.id)}
                onFocus={() => discover(part.id)}
                onClick={() => discover(part.id)}
                tabIndex={0}
                role="button"
                aria-label={`${part.label}: ${part.simile}`}
              />
            );
          })}
        </svg>
        <p className="mt-3 text-center text-sm text-[#02043E]/55">
          Descubiertas: {found.size}/{PARTS.length}
        </p>
      </div>

      {active ? (
        <p className="text-[15px] leading-relaxed text-[#02043E]/80" role="status">
          <span className="font-medium" style={{ color: "#448FF4" }}>
            {PARTS.find((p) => p.id === active)?.label}
          </span>
          : un sabio dice que es {PARTS.find((p) => p.id === active)?.simile}.
        </p>
      ) : (
        <p className="text-[15px] text-[#02043E]/55">Explorá las seis partes.</p>
      )}

      {allFound ? (
        <div className="space-y-3">
          <p className="font-medium">¿Qué es el conjunto?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPTIONS.map((option) => {
              const selected = answer === option;
              const correct = option === "Un elefante";
              let tone = "border-[#02043E]/12 bg-white hover:border-[#448FF4]";
              if (done && correct) tone = "border-[#448FF4] bg-[#448FF4]/15";
              if (done && selected && !correct) tone = "border-[#02043E]/10 bg-[#02043E]/05 opacity-50";
              return (
                <button
                  key={option}
                  type="button"
                  disabled={done}
                  onClick={() => choose(option)}
                  className={`rounded-2xl border px-4 py-3 text-left text-[15px] transition-colors ${tone}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <Button type="button" disabled variant="secondary">
          Descubrí las 6 partes para continuar
        </Button>
      )}
    </div>
  );
}
