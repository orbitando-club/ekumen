"use client";

import { useEffect, useRef, useState } from "react";
import type { GameResult } from "@/app/lib/types";
import { clampScore, scoreFromTime } from "@/app/lib/scoring";

/** Unir puntos en orden: cada trazo revela lo que “ve” un sabio. */
const DOTS = [
  { id: 0, x: 72, y: 108, label: "Trompa", simile: "como una serpiente" },
  { id: 1, x: 108, y: 72, label: "Oreja", simile: "como un abanico" },
  { id: 2, x: 168, y: 58, label: "Cabeza", simile: "como una piedra redonda" },
  { id: 3, x: 228, y: 96, label: "Costado", simile: "como una pared" },
  { id: 4, x: 248, y: 148, label: "Cola", simile: "como una cuerda" },
  { id: 5, x: 190, y: 188, label: "Pata", simile: "como un árbol" },
  { id: 6, x: 120, y: 178, label: "Colmillo", simile: "como una lanza" },
];

const TOTAL_EDGES = DOTS.length - 1;

const OPTIONS = ["Una pared", "Un elefante", "Seis animales distintos", "Una serpiente"];

type Props = {
  onFinish: (result: GameResult) => void;
};

export function ElephantGame({ onFinish }: Props) {
  const started = useRef(Date.now());
  const [nextIndex, setNextIndex] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [lastReveal, setLastReveal] = useState<(typeof DOTS)[number] | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const complete = nextIndex >= DOTS.length - 1;
  const connected = DOTS.slice(0, nextIndex + 1);

  function onDotClick(id: number) {
    if (done || complete) return;
    if (id === nextIndex + 1) {
      setNextIndex(id);
      setLastReveal(DOTS[id]);
      setWrongFlash(null);
      return;
    }
    if (id === nextIndex) return;
    setMistakes((n) => n + 1);
    setWrongFlash(id);
    window.setTimeout(() => setWrongFlash(null), 350);
  }

  function choose(option: string) {
    if (done || !complete) return;
    setAnswer(option);
    setDone(true);
    const correct = option === "Un elefante";
    const exploreScore = scoreFromTime({
      correct: true,
      elapsedMs: Date.now() - started.current,
      idealMs: 40_000,
      floorMs: 110_000,
      penalties: mistakes * 20,
    });
    const discoveryShare = Math.round(exploreScore * 0.55);
    const answerShare = correct ? 110 : 0;
    const score = clampScore(discoveryShare + answerShare);
    window.setTimeout(
      () =>
        onFinish({
          score,
          meta: { edges: TOTAL_EDGES, correct, mistakes, answer: option },
        }),
      800,
    );
  }

  const silhouetteOpacity = complete ? 0.35 : nextIndex / TOTAL_EDGES * 0.22;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-[#eef2fb] p-4 md:p-6">
        <svg
          viewBox="0 0 300 230"
          className="mx-auto h-auto w-full max-w-[400px]"
          role="img"
          aria-label="Uní los puntos en orden para descubrir la figura"
        >
          {/* Silueta fantasma que gana presencia al conectar */}
          <path
            d="M72 108 C48 120 40 155 58 175 C78 150 95 130 108 72 C140 40 200 48 228 96 C250 120 260 145 248 148 C230 160 210 175 190 188 C150 195 130 185 120 178 C100 160 85 140 72 108 Z"
            fill="#448FF4"
            fillOpacity={silhouetteOpacity}
            stroke="#448FF4"
            strokeOpacity={silhouetteOpacity + 0.15}
            strokeWidth="2"
            className="transition-opacity duration-500"
          />

          {/* Líneas ya unidas */}
          {connected.length > 1
            ? connected.slice(0, -1).map((dot, i) => {
                const next = connected[i + 1];
                return (
                  <line
                    key={`e-${dot.id}`}
                    x1={dot.x}
                    y1={dot.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="#023D8F"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })
            : null}

          {DOTS.map((dot) => {
            const reached = dot.id <= nextIndex;
            const isNext = !complete && dot.id === nextIndex + 1;
            const isWrong = wrongFlash === dot.id;
            return (
              <g key={dot.id}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isNext ? 16 : 13}
                  fill={isWrong ? "#c45c5c" : reached ? "#448FF4" : "#fff"}
                  stroke={isNext ? "#023D8F" : "#02043E"}
                  strokeWidth={isNext ? 3 : 1.5}
                  className="cursor-pointer"
                  onClick={() => onDotClick(dot.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onDotClick(dot.id);
                  }}
                  aria-label={`Punto ${dot.id + 1}${isNext ? ", siguiente" : ""}`}
                />
                <text
                  x={dot.x}
                  y={dot.y + 4}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fontSize="11"
                  fontWeight="600"
                  fill={reached || isNext ? (isWrong ? "#fff" : reached ? "#fff" : "#023D8F") : "#02043E"}
                >
                  {dot.id + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-3 text-center text-sm text-[#02043E]/55">
          Trazos: {Math.max(0, nextIndex)}/{TOTAL_EDGES}
          {mistakes > 0 ? ` · errores: ${mistakes}` : ""}
        </p>
      </div>

      {lastReveal && nextIndex > 0 ? (
        <p className="text-[15px] leading-relaxed text-[#02043E]/80" role="status">
          <span className="font-medium" style={{ color: "#448FF4" }}>
            {lastReveal.label}
          </span>
          : un sabio dice que es {lastReveal.simile}.
        </p>
      ) : (
        <p className="text-[15px] text-[#02043E]/55">
          Empezá en el 1 y uní los puntos en orden. Cada trazo revela una perspectiva.
        </p>
      )}

      {complete ? (
        <div className="space-y-3">
          <p className="font-medium">¿Qué es el conjunto?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPTIONS.map((option) => {
              const selected = answer === option;
              const correct = option === "Un elefante";
              let tone = "border-[#02043E]/12 bg-white hover:border-[#448FF4]";
              if (done && correct) tone = "border-[#448FF4] bg-[#448FF4]/15";
              if (done && selected && !correct) {
                tone = "border-[#02043E]/10 bg-[#02043E]/05 opacity-50";
              }
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
      ) : null}
    </div>
  );
}
