"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/app/components/Button";
import { RichText } from "@/app/components/RichText";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import type { GameResult } from "@/app/lib/types";
import { insightQuality, scoreFromQualityAndTime } from "@/app/lib/scoring";

const COLS = 3;
/** Distancia entre puntos del 3×3. */
const GAP = 100;
/**
 * Margen mínimo para que la solución clásica (1 GAP fuera del 3×3) no se corte.
 * El cuadrado visual ocupa ~75% del viewBox; el SVG llena el contenedor.
 */
const EDGE = 10;
const GRID0 = EDGE + GAP;
const VIEW = EDGE * 2 + GAP * 4;
/** Cuadrado con los puntos ≈ 75% del alto/ancho del SVG. */
const BOX_SIZE = VIEW * 0.75;
const BOX_PAD = (BOX_SIZE - GAP * 2) / 2;

const DOTS = [0, 1, 2].flatMap((row) =>
  [0, 1, 2].map((col) => ({
    id: row * COLS + col,
    x: GRID0 + col * GAP,
    y: GRID0 + row * GAP,
  })),
);

/** Solución clásica (solo se muestra si usó más de 4 líneas). */
const SOLUTION: { x: number; y: number }[] = [
  { x: GRID0, y: GRID0 + 2 * GAP },
  { x: GRID0 + 3 * GAP, y: GRID0 + 2 * GAP },
  { x: GRID0, y: GRID0 - GAP },
  { x: GRID0, y: GRID0 + 2 * GAP },
  { x: GRID0 + 2 * GAP, y: GRID0 },
];

const HIT_R = 30;
const ANCHOR_HIT = 22;
const MAX_LINES = 4;
const DOT_R = 13;
const DOT_R_ACTIVE = 15;

type Pt = { x: number; y: number };

type Props = {
  prompt: string;
  onFinish: (result: GameResult) => void;
};

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointNearSegment(p: Pt, a: Pt, b: Pt, radius: number) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return dist(p, a) <= radius;
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * abx, y: a.y + t * aby };
  return dist(p, proj) <= radius;
}

function hitsForSegment(a: Pt, b: Pt) {
  return DOTS.filter(
    (dot) => dist(a, dot) <= HIT_R || dist(b, dot) <= HIT_R || pointNearSegment(dot, a, b, HIT_R),
  ).map((d) => d.id);
}

function hitsFromAnchors(anchors: Pt[]) {
  const ids = new Set<number>();
  for (let i = 1; i < anchors.length; i += 1) {
    hitsForSegment(anchors[i - 1], anchors[i]).forEach((id) => ids.add(id));
  }
  return ids;
}

export function InsightGame({ prompt, onFinish }: Props) {
  const { t } = useLocale();
  const started = useRef(Date.now());
  const svgRef = useRef<SVGSVGElement>(null);
  const finished = useRef(false);

  const [anchors, setAnchors] = useState<Pt[]>([]);
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [hit, setHit] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const lineCount = Math.max(0, anchors.length - 1);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const syncHits = useCallback((next: Pt[]) => {
    setHit(hitsFromAnchors(next));
  }, []);

  function clientToSvg(clientX: number, clientY: number): Pt | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  const complete = useCallback(
    (lines: number, attemptCount: number) => {
      if (finished.current) return;
      finished.current = true;
      setSolved(true);
      setCursor(null);
      const usedMoreThanFour = lines > MAX_LINES;
      setShowSolution(usedMoreThanFour);
      setFeedback(usedMoreThanFour ? t.insight.tooMany : t.insight.success);
      const { total, quality, time } = scoreFromQualityAndTime(
        insightQuality(lines),
        Date.now() - started.current,
      );
      window.setTimeout(
        () =>
          onFinish({
            score: total,
            meta: { lines, attempts: attemptCount, optimal: !usedMoreThanFour, quality, time },
          }),
        usedMoreThanFour ? 2400 : 1400,
      );
    },
    [onFinish, t.insight.success, t.insight.tooMany],
  );

  function placeAnchor(pt: Pt) {
    setAnchors((prev) => {
      const next = [...prev, pt];
      const hits = hitsFromAnchors(next);
      setHit(hits);
      const lines = Math.max(0, next.length - 1);
      // Autocomplete solo si cerró los 9 con 4 líneas o menos
      if (hits.size >= 9 && lines <= MAX_LINES) {
        window.setTimeout(() => complete(lines, attempts), 0);
      }
      return next;
    });
    setFeedback(null);
  }

  function removeFromAnchorIndex(index: number) {
    if (solved) return;
    setAnchors((prev) => {
      const next = prev.slice(0, index);
      syncHits(next);
      return next;
    });
    setFeedback(null);
  }

  function undoLastAnchor() {
    if (solved) return;
    setAnchors((prev) => {
      const next = prev.slice(0, -1);
      syncHits(next);
      return next;
    });
    setFeedback(null);
  }

  function clearAll() {
    if (solved) return;
    setAnchors([]);
    setHit(new Set());
    setCursor(null);
    setFeedback(null);
  }

  function onPointerDown(e: ReactPointerEvent) {
    if (solved) return;
    e.preventDefault();
    const pt = clientToSvg(e.clientX, e.clientY);
    if (!pt) return;

    for (let i = anchors.length - 1; i >= 0; i -= 1) {
      if (dist(pt, anchors[i]) <= ANCHOR_HIT) {
        removeFromAnchorIndex(i);
        return;
      }
    }

    const tappedDot = DOTS.find((d) => dist(pt, d) <= HIT_R + 4);
    if (tappedDot && hit.has(tappedDot.id) && anchors.length >= 2) {
      for (let i = anchors.length - 1; i >= 1; i -= 1) {
        const ids = hitsForSegment(anchors[i - 1], anchors[i]);
        if (ids.includes(tappedDot.id)) {
          removeFromAnchorIndex(i);
          return;
        }
      }
    }

    placeAnchor(pt);
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (solved) return;
    setCursor(clientToSvg(e.clientX, e.clientY));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (solved) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        undoLastAnchor();
      }
      if (e.key === "Escape") clearAll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [solved]);

  function check() {
    if (solved) return;
    if (hit.size < 9) {
      setAttempts((n) => n + 1);
      setFeedback(t.insight.needAll);
      return;
    }
    // Con más de 4 líneas también puede cerrar, pero mostramos una forma más directa
    complete(lineCount, attempts);
  }

  const solutionPath = SOLUTION.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const preview =
    !solved && anchors.length > 0 && cursor
      ? { a: anchors[anchors.length - 1], b: cursor }
      : null;
  const userOpacity = solved ? 0.28 : 1;

  return (
    <div className="grid h-full min-h-0 gap-6 md:grid-cols-2 md:items-stretch md:gap-8">
      <div className="h-full min-h-[18rem] overflow-hidden rounded-sm bg-[#eef2fb] p-2 touch-none sm:min-h-0 sm:p-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full cursor-crosshair touch-none"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setCursor(null)}
          role="img"
          aria-label={t.insight.hint}
        >
          <rect
            x={GRID0 - BOX_PAD}
            y={GRID0 - BOX_PAD}
            width={BOX_SIZE}
            height={BOX_SIZE}
            fill="none"
            stroke="rgba(2,4,62,0.1)"
            strokeWidth="1.5"
          />

          <g opacity={userOpacity} style={{ transition: "opacity 400ms ease" }}>
            {anchors.length > 1
              ? anchors.slice(0, -1).map((a, i) => (
                  <line
                    key={`seg-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={anchors[i + 1].x}
                    y2={anchors[i + 1].y}
                    stroke="#2B65E7"
                    strokeWidth="4"
                    strokeLinecap="square"
                  />
                ))
              : null}

            {preview ? (
              <line
                x1={preview.a.x}
                y1={preview.a.y}
                x2={preview.b.x}
                y2={preview.b.y}
                stroke="#2B65E7"
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeOpacity="0.45"
                strokeLinecap="square"
              />
            ) : null}

            {anchors.map((a, i) => (
              <circle
                key={`anchor-${i}`}
                cx={a.x}
                cy={a.y}
                r={i === anchors.length - 1 ? 7 : 5}
                fill="#023D8F"
                stroke="#fff"
                strokeWidth="2"
                className="pointer-events-none"
              />
            ))}
          </g>

          {showSolution ? (
            <path
              d={solutionPath}
              fill="none"
              stroke="#023D8F"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 7"
              opacity="0.9"
            />
          ) : null}

          {DOTS.map((dot) => {
            const active = hit.has(dot.id);
            return (
              <circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r={active ? DOT_R_ACTIVE : DOT_R}
                fill={active ? "#2B65E7" : "#fff"}
                stroke={active ? "#023D8F" : "rgba(2,4,62,0.35)"}
                strokeWidth={active ? 3 : 2.25}
                className="pointer-events-none"
              />
            );
          })}
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
            {t.insight.hint}
          </p>
          <p className="text-sm text-[#02043E]/50">{t.insight.undoHint}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[#02043E]/60">
          <span>
            {t.insight.dots}: {hit.size}/9
          </span>
        </div>

        {!solved ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={check} className="w-full sm:w-auto">
              {t.insight.check}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={clearAll}
              disabled={anchors.length === 0}
              className="w-full sm:w-auto"
            >
              {t.insight.clear}
            </Button>
          </div>
        ) : null}

        {feedback ? (
          <p
            className={`text-[0.9375rem] leading-relaxed ${solved ? "text-[#023D8F]" : "text-[#02043E]/70"}`}
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        {showSolution ? (
          <p className="text-sm font-medium text-[#023D8F]">{t.insight.solutionTitle}</p>
        ) : null}
      </div>
    </div>
  );
}
