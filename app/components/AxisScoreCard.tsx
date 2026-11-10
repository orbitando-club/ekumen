"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ClusterId } from "@/app/lib/types";

export type AxisScoreItem = {
  id: ClusterId;
  emoji: string;
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
              className={`flex w-full cursor-pointer flex-col justify-between p-3 text-left text-white transition-opacity hover:opacity-95 sm:p-4 ${
                open ? "" : "min-h-[88px] sm:min-h-[96px]"
              }`}
              style={{ background: card.color }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xl leading-none" aria-hidden>
                  {card.emoji}
                </span>
                <ToggleMark open={open} />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase leading-snug sm:text-[11px]">
                  {card.label}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-white/85">
                  {card.points} {pointsSuffix}
                </span>
              </div>
              <Disclosure open={open}>
                <div className="mt-3 space-y-2 border-t border-white/25 pt-3">
                  {card.values.map((value) => (
                    <div key={value.name}>
                      <p className="text-sm font-semibold text-white">{value.name}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-white/85">{value.line}</p>
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
    <ul className="grid grid-cols-1 gap-1.5 text-left">
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
        className="flex w-full cursor-pointer flex-col p-3 text-left text-white transition-opacity hover:opacity-95 sm:p-3.5"
        style={{ background: item.color }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[13px] font-semibold leading-snug sm:text-[14px]">{item.name}</span>
          <ToggleMark open={open} />
        </div>
        <Disclosure open={open}>
          <p className="mt-2 border-t border-white/25 pt-2 text-[12px] leading-snug text-white/90 sm:text-[13px]">
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
      className={`inline-block shrink-0 text-base leading-none text-white/80 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
