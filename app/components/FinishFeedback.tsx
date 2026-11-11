"use client";

import { useEffect, useRef } from "react";

type Props = {
  message: string;
  accent: string;
  durationMs: number;
  onDone: () => void;
};

/** Feedback a la derecha + anillo de progreso hasta avanzar. */
export function FinishFeedback({ message, accent, durationMs, onDone }: Props) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = window.setTimeout(() => onDoneRef.current(), durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs]);

  const size = 28;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-start gap-3" role="status">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mt-0.5 shrink-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(2,4,62,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            animation: `finish-ring-draw ${durationMs}ms linear forwards`,
          }}
        />
      </svg>
      <p className="text-[0.9375rem] leading-relaxed text-[#023D8F]">{message}</p>
    </div>
  );
}
