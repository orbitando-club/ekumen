"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { FinishFeedback } from "@/app/components/FinishFeedback";
import { RichText } from "@/app/components/RichText";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import type { GameResult } from "@/app/lib/types";
import { elephantQuality, scoreFailed, scoreFromQualityAndTime } from "@/app/lib/scoring";

/**
 * Vértices y aristas parseados de `elefante.svg`.
 * Cada arista = un trazo del dibujo; los puntos son inicios/fines de esos trazos.
 */
const RAW_POINTS: [number, number][] = [
  [248.507, 179.502], [246.007, 140.502], [239.007, 90.002], [233.007, 60.502],
  [218.507, 32.502], [198.507, 13.502], [172.507, 2.502], [146.507, 0.502],
  [131.007, 2.502], [109.007, 10.502], [93.507, 24.503], [239.007, 218.002],
  [198.007, 218.002], [198.007, 171.002], [157.507, 218.002], [157.507, 186.002],
  [171.507, 129.002], [198.007, 151.002], [129.007, 182.002], [143.007, 186.002],
  [183.007, 179.502], [163.507, 186.002], [56.507, 35.002], [45.007, 52.002],
  [74.007, 140.502], [98.007, 137.502], [120.507, 116.502], [129.007, 86.002],
  [123.507, 51.502], [105.007, 27.503], [82.007, 20.003], [67.007, 24.503],
  [38.507, 32.502], [22.507, 40.002], [5.507, 59.502], [0.507, 82.002],
  [18.007, 220.502], [28.007, 220.502], [28.007, 142.079], [85.507, 219.502],
  [87.007, 158.002], [72.515, 134.002], [63.007, 138.161], [48.507, 144.502],
  [32.507, 144.502], [13.007, 134.002], [32.507, 134.002], [48.507, 128.502],
  [67.007, 110.002], [136.007, 111.502], [129.007, 127.002], [128.507, 219.502],
  [61.507, 218.502],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [2, 11], [11, 12], [12, 13], [12, 14], [14, 15], [16, 17], [17, 13], [18, 19],
  [19, 15], [13, 20], [20, 21], [21, 15], [22, 23], [24, 25], [25, 26], [26, 27],
  [27, 28], [28, 29], [29, 30], [30, 31], [31, 22], [22, 32], [32, 33], [33, 34],
  [34, 35], [35, 36], [36, 37], [37, 38], [39, 40], [40, 24], [24, 41], [42, 43],
  [43, 44], [44, 38], [38, 45], [45, 46], [46, 47], [47, 48], [48, 41], [41, 42],
  [49, 50], [50, 51], [51, 39], [39, 52], [52, 42],
];

const OUTLINE_PATHS = [
  "M248.507 179.502L246.007 140.502L239.007 90.0025L233.007 60.5025L218.507 32.5025L198.507 13.5025L172.507 2.50247L146.507 0.502472L131.007 2.50247L109.007 10.5025L93.507 24.5025M239.007 90.0025V218.002H198.007M198.007 218.002V171.002M198.007 218.002H157.507V186.002M171.507 129.002L198.007 151.002V171.002M129.007 182.002L143.007 186.002H157.507M198.007 171.002L183.007 179.502L163.507 186.002H157.507M56.507 35.0025L45.007 52.0025",
  "M74.007 140.502L98.007 137.502L120.507 116.502L129.007 86.0025L123.507 51.5025L105.007 27.5025L82.007 20.0025L67.007 24.5025L56.507 35.0025L38.507 32.5025L22.507 40.0025L5.50696 59.5025L0.506958 82.0025L18.007 220.502H28.007V142.079M85.507 219.502L87.007 158.002L74.007 140.502L72.5152 134.002M63.007 138.161L48.507 144.502H32.507L28.007 142.079L13.007 134.002H32.507L48.507 128.502L67.007 110.002L72.5152 134.002M72.5152 134.002L63.007 138.161M136.007 111.502L129.007 127.002L128.507 219.502H85.507L61.507 218.502L63.007 138.161",
];

const EYE = { cx: 37.507, cy: 82.5025, r: 7 };
/** Radio de hit en coords SVG; un poco generoso para no “saltar” puntos. */
const HIT = 20;
/** Con un cuarto de los puntos ya se puede intentar adivinar. */
const GUESS_AT = Math.ceil(RAW_POINTS.length * 0.25);
/** Padding para que puntos/trazos no se corten en el borde */
const PAD = 12;
const VB = { w: 249, h: 221 };
const FINISH_MS = 2400;

type Props = {
  prompt: string;
  accent: string;
  onFinish: (result: GameResult) => void;
};

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export function ElephantGame({ prompt, accent, onFinish }: Props) {
  const { t } = useLocale();
  const started = useRef(Date.now());
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const lastId = useRef<number | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const pendingResult = useRef<GameResult | null>(null);

  const [visited, setVisited] = useState<Set<number>>(() => new Set());
  const [drawn, setDrawn] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [forceReveal, setForceReveal] = useState(false);
  const [finishMessage, setFinishMessage] = useState<string | null>(null);

  const neighbors = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const [a, b] of EDGES) {
      if (!map.has(a)) map.set(a, []);
      if (!map.has(b)) map.set(b, []);
      map.get(a)!.push(b);
      map.get(b)!.push(a);
    }
    return map;
  }, []);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const allEdgesDrawn = drawn.size >= EDGES.length;
  const complete = allEdgesDrawn || visited.size >= RAW_POINTS.length;
  const showFull = complete || forceReveal;
  const canGuess = visited.size >= GUESS_AT || complete;

  function edgeKey(a: number, b: number) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }

  function clientToSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * (VB.w + PAD * 2) - PAD;
    const y = ((clientY - rect.top) / rect.height) * (VB.h + PAD * 2) - PAD;
    return { x, y };
  }

  function hitTest(x: number, y: number) {
    let best: { id: number; d: number } | null = null;
    for (let i = 0; i < RAW_POINTS.length; i += 1) {
      const [px, py] = RAW_POINTS[i];
      const d = dist(x, y, px, py);
      if (d <= HIT && (!best || d < best.d)) best = { id: i, d };
    }
    return best?.id ?? null;
  }

  /** Todos los puntos cercanos a un segmento (para no saltarlos al mover rápido). */
  function hitsAlongSegment(ax: number, ay: number, bx: number, by: number) {
    const span = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.ceil(span / (HIT * 0.45)));
    const found: number[] = [];
    const seen = new Set<number>();
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      const id = hitTest(x, y);
      if (id !== null && !seen.has(id)) {
        seen.add(id);
        found.push(id);
      }
    }
    return found;
  }

  function visit(id: number) {
    setActiveId(id);
    const prev = lastId.current;
    lastId.current = id;

    setVisited((v) => {
      const nextVisited = new Set(v);
      nextVisited.add(id);

      setDrawn((d) => {
        const nextDrawn = new Set(d);
        if (prev !== null && prev !== id) {
          const linked = neighbors.get(prev) ?? [];
          if (linked.includes(id)) nextDrawn.add(edgeKey(prev, id));
        }
        for (const [a, b] of EDGES) {
          if (nextVisited.has(a) && nextVisited.has(b)) {
            nextDrawn.add(edgeKey(a, b));
          }
        }
        return nextDrawn;
      });

      return nextVisited;
    });
  }

  function scrubAt(clientX: number, clientY: number) {
    const local = clientToSvg(clientX, clientY);
    if (!local) return;
    const prev = lastPoint.current;
    lastPoint.current = local;
    const ids = prev
      ? hitsAlongSegment(prev.x, prev.y, local.x, local.y)
      : (() => {
          const id = hitTest(local.x, local.y);
          return id !== null ? [id] : [];
        })();
    for (const id of ids) visit(id);
  }

  function onPointerDown(e: ReactPointerEvent) {
    if (done || complete) return;
    drawing.current = true;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    lastPoint.current = null;
    scrubAt(e.clientX, e.clientY);
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (done || complete) return;
    if (e.pointerType === "mouse" || drawing.current) {
      scrubAt(e.clientX, e.clientY);
    }
  }

  function onPointerUp() {
    drawing.current = false;
    lastId.current = null;
    lastPoint.current = null;
  }

  // Cuando todos los puntos están visitados, cerrar aristas restantes entre vecinos visitados
  useEffect(() => {
    if (visited.size < RAW_POINTS.length) return;
    setDrawn((d) => {
      const next = new Set(d);
      for (const [a, b] of EDGES) next.add(edgeKey(a, b));
      return next;
    });
  }, [visited]);

  function choose(option: string) {
    if (done || !canGuess) return;
    setAnswer(option);
    setDone(true);
    const correct = option === t.elephant.correct;
    const pointsFound = visited.size;
    if (correct) {
      setForceReveal(true);
      setVisited(new Set(RAW_POINTS.map((_, i) => i)));
      setDrawn(new Set(EDGES.map(([a, b]) => edgeKey(a, b))));
    }
    const elapsed = Date.now() - started.current;
    const breakdown = correct
      ? scoreFromQualityAndTime(elephantQuality(true), elapsed)
      : scoreFailed();
    setFinishMessage(correct ? t.elephant.success : t.elephant.fail);
    pendingResult.current = {
      score: breakdown.total,
      meta: {
        points: pointsFound,
        correct,
        answer: option,
        quality: breakdown.quality,
        time: breakdown.time,
      },
    };
  }

  return (
    <div className="grid h-full min-h-0 gap-6 md:grid-cols-2 md:items-stretch md:gap-8">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-sm bg-[#eef2fb] p-3 touch-none sm:p-5">
        <svg
          ref={svgRef}
          viewBox={`${-PAD} ${-PAD} ${VB.w + PAD * 2} ${VB.h + PAD * 2}`}
          className="mx-auto h-auto max-h-[min(100%,52dvh)] w-full max-w-[440px] flex-1 touch-none"
          style={{ touchAction: "none", cursor: "grab", aspectRatio: `${VB.w} / ${VB.h}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label={t.elephant.scrubHint}
        >
          {/* Líneas reveladas (solo las aristas visitadas) */}
          {!showFull
            ? EDGES.map(([a, b]) => {
                if (!drawn.has(edgeKey(a, b))) return null;
                const [x1, y1] = RAW_POINTS[a];
                const [x2, y2] = RAW_POINTS[b];
                return (
                  <line
                    key={edgeKey(a, b)}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#023D8F"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                );
              })
            : null}

          {/* Contorno SVG completo al terminar o acertar */}
          {showFull
            ? OUTLINE_PATHS.map((d) => (
                <path
                  key={d.slice(0, 28)}
                  d={d}
                  fill="none"
                  stroke="#023D8F"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="elephant-outline-in"
                />
              ))
            : null}

          {/* Puntos redondos */}
          {RAW_POINTS.map(([x, y], id) => {
            const on = showFull || visited.has(id);
            const isActive = !showFull && activeId === id;
            return (
              <circle
                key={id}
                cx={x}
                cy={y}
                r={isActive ? 4.5 : on ? 3.5 : 2.5}
                fill={on ? "#448FF4" : "#fff"}
                stroke={isActive ? "#023D8F" : on ? "#023D8F" : "rgba(2,4,62,0.4)"}
                strokeWidth={isActive ? 2 : 1.4}
                className="pointer-events-none"
              />
            );
          })}

          {/* Ojito al completar o acertar */}
          {showFull ? (
            <circle
              cx={EYE.cx}
              cy={EYE.cy}
              r={EYE.r}
              fill="#02043E"
              className="elephant-eye-in"
            />
          ) : null}
        </svg>
      </div>

      <div className="flex min-h-0 flex-col justify-center gap-4">
        <div className="space-y-3">
          <RichText
            as="p"
            html={prompt}
            className="text-[clamp(0.875rem,0.35vw+0.7rem,1rem)] font-bold leading-relaxed text-[#02043E]"
          />
          <p className="text-[clamp(0.8125rem,0.3vw+0.7rem,0.9375rem)] leading-relaxed text-[#02043E]/75">
            {t.elephant.scrubHint}
          </p>
        </div>

        {canGuess ? (
          <div className="space-y-3">
            <p className="font-medium">{t.elephant.question}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {t.elephant.options.map((option) => {
                const selected = answer === option;
                const correct = option === t.elephant.correct;
                let tone = "border-[#02043E]/15 bg-white hover:border-[#448FF4]";
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
                    className={`min-h-12 cursor-pointer rounded-sm border px-4 py-3 text-left text-[0.9375rem] transition-colors ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {finishMessage ? (
          <FinishFeedback
            message={finishMessage}
            accent={accent}
            durationMs={FINISH_MS}
            onDone={() => {
              if (pendingResult.current) onFinish(pendingResult.current);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
