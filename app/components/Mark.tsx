"use client";

import { useEffect, useId, useState } from "react";
import type { ClusterId, Progress } from "@/app/lib/types";
import { emptyProgress } from "@/app/lib/types";

const facets: { id: ClusterId; points: string; from: string; to: string }[] = [
  { id: "think", points: "43,0 0,80 86,80", from: "#023D8F", to: "#2B65E7" },
  { id: "together", points: "43,0 129,0 86,80", from: "#2B65E7", to: "#448FF4" },
  { id: "happen", points: "0,80 86,80 43,160", from: "#453CA3", to: "#775DFD" },
  { id: "deliver", points: "86,80 129,160 43,160", from: "#683C95", to: "#AE66FF" },
];

const seams = ["M43 0 L86 80", "M0 80 L86 80", "M43 160 L86 80"];

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
    <div className={`inline-flex items-center gap-[0.55em] text-ink ${className}`}>
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
        {facets.map((facet) =>
          shown[facet.id] ? (
            <polygon
              key={facet.id}
              points={facet.points}
              fill={`url(#${rawId}-${facet.id})`}
              className={animate === facet.id ? "facet-in" : undefined}
            />
          ) : (
            <polygon
              key={facet.id}
              points={facet.points}
              fill="transparent"
              stroke="rgba(2,4,62,0.22)"
              strokeWidth="1.25"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ),
        )}
        {seams.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="rgba(2,4,62,0.18)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {wordmark ? (
        <span className="font-bold tracking-[-0.06em] text-[0.92em] leading-none">
          EKUMEN
        </span>
      ) : null}
    </div>
  );
}
