"use client";

import { useEffect, useState } from "react";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  // Evitar que quede ya ordenada al azar
  if (next.length > 1 && next.every((value, index) => value === items[index])) {
    return shuffle(items);
  }
  return next;
}

export function NumberOrderGame({
  accent,
  numbers,
  onFinish,
}: {
  accent: string;
  numbers: number[];
  onFinish: (completed: boolean) => void;
}) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const [pool, setPool] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setPool(shuffle(sorted));
    setOrder([]);
    setChecked(false);
    setSolved(false);
  }, [numbers.join(",")]);

  const remaining = pool.filter((n) => !order.includes(n));
  const complete = order.length === sorted.length;

  function add(n: number) {
    if (order.includes(n) || solved) return;
    setOrder((prev) => [...prev, n]);
    setChecked(false);
  }

  function undo() {
    if (solved) return;
    setOrder((prev) => prev.slice(0, -1));
    setChecked(false);
  }

  function clear() {
    if (solved) return;
    setOrder([]);
    setChecked(false);
  }

  function check() {
    const ok = order.every((n, index) => n === sorted[index]);
    setChecked(true);
    setSolved(ok);
  }

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <h2 className="text-xl font-medium tracking-tight md:text-2xl">
        Ordená los números de menor a mayor
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[#02043E]/65">
        Tocá los números en orden. Podés deshacer si te equivocás.
      </p>

      <ol className="mt-6 flex flex-col gap-2">
        {sorted.map((_, index) => {
          const value = order[index];
          const filled = value !== undefined;
          return (
            <li
              key={`slot-${index}`}
              className={`flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-3 ${
                filled
                  ? "border-[#02043E]/15 bg-white"
                  : "border-dashed border-[#02043E]/20 bg-white/60"
              }`}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: filled ? accent : "rgba(2,4,62,0.25)" }}
              >
                {index + 1}
              </span>
              <span
                className={
                  filled
                    ? "text-lg font-medium tabular-nums tracking-tight"
                    : "text-sm text-[#02043E]/45"
                }
              >
                {filled ? value : "Todavía vacío"}
              </span>
            </li>
          );
        })}
      </ol>

      {remaining.length > 0 ? (
        <div className="mt-5">
          <p className="text-[12px] font-medium tracking-[0.14em] text-[#02043E]/45 uppercase">
            Disponibles
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {remaining.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => add(n)}
                className="min-w-[3.5rem] rounded-2xl border border-[#02043E]/10 bg-white px-4 py-3 text-lg font-medium tabular-nums transition-colors hover:border-[#02043E]/30"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={order.length === 0 || solved}
          onClick={undo}
          className="rounded-full border border-[#02043E]/15 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deshacer
        </button>
        <button
          type="button"
          disabled={order.length === 0 || solved}
          onClick={clear}
          className="rounded-full border border-[#02043E]/15 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Vaciar
        </button>
        <button
          type="button"
          disabled={!complete || solved}
          onClick={check}
          className="rounded-full px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          Comprobar
        </button>
      </div>

      {checked ? (
        <div className="mt-4 space-y-1" aria-live="polite">
          <p className="text-[15px] leading-relaxed text-[#02043E]/75">
            {solved ? "Bien. Esa es la secuencia." : "Todavía no. Reordená y volvé a comprobar."}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#02043E]/55">
          Completá la secuencia y tocá Comprobar.
        </p>
      )}

      {solved ? (
        <button
          type="button"
          onClick={() => onFinish(true)}
          className="mt-6 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          Cerrar la práctica
        </button>
      ) : null}
    </div>
  );
}
