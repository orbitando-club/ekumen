"use client";

import { useEffect, useId, useState } from "react";
import type { ClusterId, Progress } from "@/app/lib/types";
import { emptyProgress } from "@/app/lib/types";

/**
 * Orden de llenado antihorario empezando por el azul claro (arriba-derecha):
 * think → together → happen → deliver
 * = TR → TL → BL → BR
 */
const facets: { id: ClusterId; points: string; from: string; to: string }[] = [
  { id: "think", points: "43,0 129,0 86,80", from: "#2B65E7", to: "#448FF4" },
  { id: "together", points: "43,0 0,80 86,80", from: "#023D8F", to: "#2B65E7" },
  { id: "happen", points: "0,80 86,80 43,160", from: "#453CA3", to: "#775DFD" },
  { id: "deliver", points: "86,80 129,160 43,160", from: "#683C95", to: "#AE66FF" },
];

const seams = ["M43 0 L86 80", "M0 80 L86 80", "M43 160 L86 80"];

/** Proporciones de la carita de referencia, sobre la altura del facet. */
const EYE_W = 6.4;
const EYE_H = 16.6;
const EYE_GAP = 7.4;
const EYE_SPAN = EYE_W * 2 + EYE_GAP;

/** El triángulo claro ocupa la parte ancha, pegado al lado izquierdo:
 *  arranca un 23% debajo del vértice y corta un 12% antes de la base. */
const EDGE_NEAR = 0.23;
const EDGE_FAR = 0.88;
const INNER_ACROSS = 0.72;

type Pt = [number, number];

function parsePoints(points: string): Pt[] {
  return points.split(" ").map((pair) => pair.split(",").map(Number) as Pt);
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Base horizontal del facet, vértice opuesto, y extremos izquierdo/derecho. */
function faceFrame(points: string): { apex: Pt; left: Pt; right: Pt } {
  const pts = parsePoints(points);
  let base = 0;
  let bestDy = Infinity;
  for (let i = 0; i < 3; i += 1) {
    const dy = Math.abs(pts[i][1] - pts[(i + 1) % 3][1]);
    if (dy < bestDy) {
      bestDy = dy;
      base = i;
    }
  }
  const a = pts[base];
  const b = pts[(base + 1) % 3];
  const apex = pts[(base + 2) % 3];
  const left = a[0] <= b[0] ? a : b;
  const right = a[0] <= b[0] ? b : a;
  return { apex, left, right };
}

function lightPoints(points: string): string {
  const { apex, left, right } = faceFrame(points);
  const near = lerp(apex, left, EDGE_NEAR);
  const far = lerp(apex, left, EDGE_FAR);
  const farRight = lerp(apex, right, EDGE_FAR);
  const inner = lerp(far, farRight, INNER_ACROSS);
  return [near, far, inner].map((p) => `${round(p[0])},${round(p[1])}`).join(" ");
}

function eyesOrigin(points: string): { x: number; y: number } {
  const { apex, left, right } = faceFrame(points);
  const cx = 0.4 * apex[0] + 0.41 * left[0] + 0.19 * right[0];
  const cy = 0.4 * apex[1] + 0.41 * left[1] + 0.19 * right[1];
  return { x: round(cx - EYE_SPAN / 2), y: round(cy - EYE_H / 2) };
}

function lighten(hex: string, amount = 0.5) {
  const n = Number.parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

type MarkProps = {
  progress?: Progress;
  className?: string;
  wordmark?: boolean;
  animate?: ClusterId | null;
};

export function Mark({
  progress = emptyProgress,
  className = "h-16",
  wordmark = false,
  animate = null,
}: MarkProps) {
  const rawId = useId().replace(/:/g, "");
  const [shown, setShown] = useState<Progress>(progress);
  const [hot, setHot] = useState<ClusterId | null>(null);
  const filledCount = Object.values(shown).filter(Boolean).length;

  useEffect(() => {
    if (!animate || !progress[animate]) {
      setShown(progress);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(progress);
      return;
    }
    setShown({ ...progress, [animate]: false });
    const timer = window.setTimeout(() => setShown(progress), 40);
    return () => window.clearTimeout(timer);
  }, [animate, progress]);

  return (
    <div className={`mark-root inline-flex items-center gap-[0.55em] text-ink ${className}`}>
      <svg
        viewBox="-4 -4 138 168"
        className="h-full w-auto overflow-visible"
        role="img"
        aria-label={`Isologo de Ekumen, ${filledCount} de 4 triángulos`}
      >
        <defs>
          {facets.map((facet) => (
            <linearGradient
              key={facet.id}
              id={`${rawId}-${facet.id}`}
              x1="100%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor={facet.from} />
              <stop offset="100%" stopColor={facet.to} />
            </linearGradient>
          ))}
        </defs>
        {facets.map((facet, index) => {
          const won = shown[facet.id];
          return (
            <g
              key={facet.id}
              className="mark-facet"
              onMouseEnter={() => setHot(facet.id)}
              onMouseLeave={() => setHot((current) => (current === facet.id ? null : current))}
            >
              <polygon
                points={facet.points}
                fill={`url(#${rawId}-${facet.id})`}
                className={`facet-base facet-order-${index} ${won ? "facet-won" : "facet-pending"} ${
                  animate === facet.id && won ? "facet-in" : ""
                }`}
              />
            </g>
          );
        })}
        {seams.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="rgba(2,4,62,0.12)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        ))}
        {facets.map((facet) => {
          if (!shown[facet.id]) return null;
          const light = lightPoints(facet.points);
          const eyes = eyesOrigin(facet.points);
          return (
            <g
              key={`${facet.id}-spoiler`}
              className={`mark-spoiler${hot === facet.id ? " is-hot" : ""}`}
              aria-hidden
            >
              <polygon points={light} fill={lighten(facet.to)} />
              <g className="mark-eyes" fill="#0E1043">
                <rect x={eyes.x} y={eyes.y} width={EYE_W} height={EYE_H} rx={EYE_W / 2} />
                <rect
                  x={round(eyes.x + EYE_W + EYE_GAP)}
                  y={eyes.y}
                  width={EYE_W}
                  height={EYE_H}
                  rx={EYE_W / 2}
                />
              </g>
            </g>
          );
        })}
      </svg>
      {wordmark ? (
        <span className="font-bold tracking-[-0.06em] text-[0.92em] leading-none">
          EKUMEN
        </span>
      ) : null}
    </div>
  );
}
