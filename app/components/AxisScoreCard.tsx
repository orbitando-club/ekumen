"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ClusterId } from "@/app/lib/types";

export type AxisScoreItem = {
  id: ClusterId;
  icon: string;
  label: string;
  color: string;
  points: number;
  values: { name: string; line: string }[];
};

type GridProps = {
  items: AxisScoreItem[];
  pointsSuffix: string;
  expandedId: ClusterId | null;
  onToggle: (id: ClusterId) => void;
};

export function AxisScoreGrid({ items, pointsSuffix, expandedId, onToggle }: GridProps) {
  return (
    <ul className="grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
      {items.map((card) => {
        const open = expandedId === card.id;
        return (
          <li key={card.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onToggle(card.id)}
              aria-expanded={open}
              className={`flex w-full cursor-pointer flex-col justify-between p-4 text-left text-white transition-opacity hover:opacity-95 sm:p-5 ${
                open ? "" : "min-h-[108px] sm:min-h-[120px]"
              }`}
              style={{ background: card.color }}
            >
              <div className="flex items-start justify-between gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${card.icon}`}
                  alt=""
                  aria-hidden
                  className="h-7 w-7 object-contain"
                />
                <ToggleMark open={open} />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase leading-snug sm:text-[0.75rem]">
                  {card.label}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-white/85">
                  {card.points} {pointsSuffix}
                </span>
              </div>
              <Disclosure open={open}>
                <div className="mt-4 space-y-3 border-t border-white/25 pt-4">
                  {card.values.map((value) => (
                    <div key={value.name}>
                      <p className="font-semibold text-white">{value.name}</p>
                      <p className="mt-1 text-[0.875rem] leading-relaxed text-white/85">{value.line}</p>
                    </div>
                  ))}
                </div>
              </Disclosure>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export type ValueCardItem = {
  id: string;
  name: string;
  line: string;
  color: string;
  startOpen?: boolean;
};

export function ValueCardList({ items }: { items: ValueCardItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 text-left">
      {items.map((item) => (
        <ValueCard key={item.id} item={item} />
      ))}
    </ul>
  );
}

function ValueCard({ item }: { item: ValueCardItem }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!item.startOpen) return;
    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [item.startOpen]);

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-col p-4 text-left text-white transition-opacity hover:opacity-95 sm:p-5"
        style={{ background: item.color }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[0.9375rem] font-semibold leading-snug">{item.name}</span>
          <ToggleMark open={open} />
        </div>
        <Disclosure open={open}>
          <p className="mt-3 border-t border-white/25 pt-3 text-[0.875rem] leading-relaxed text-white/90">
            {item.line}
          </p>
        </Disclosure>
      </button>
    </li>
  );
}

function ToggleMark({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 text-lg leading-none text-white/80 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "rotate-45" : "rotate-0"
      }`}
    >
      +
    </span>
  );
}

function Disclosure({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={`card-disclosure grid ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
      <div className={`overflow-hidden ${open ? "opacity-100" : "opacity-0"}`}>{children}</div>
    </div>
  );
}
