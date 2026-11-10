"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RichText } from "@/app/components/RichText";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import type { GameResult } from "@/app/lib/types";
import { scoreFailed, scoreFromQualityAndTime, wordleQuality } from "@/app/lib/scoring";
import { assignWordleWord } from "@/app/lib/wordleWords";

const MAX_GUESSES = 6;
const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const KEY_TIP_DELAY_MS = 1000;

type LetterState = "correct" | "present" | "absent" | "empty";

function scoreGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(5).fill("absent");
  const remaining: Record<string, number> = {};
  for (let i = 0; i < 5; i += 1) {
    const ch = answer[i];
    if (guess[i] === ch) result[i] = "correct";
    else remaining[ch] = (remaining[ch] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i += 1) {
    if (result[i] === "correct") continue;
    const ch = guess[i];
    if (remaining[ch]) {
      result[i] = "present";
      remaining[ch] -= 1;
    }
  }
  return result;
}

const cellTone: Record<LetterState, string> = {
  correct: "bg-[#683C95] text-white border-[#683C95]",
  present: "bg-[#AE66FF] text-white border-[#AE66FF]",
  absent: "bg-[#02043E]/25 text-white border-transparent",
  empty: "bg-white text-[#02043E] border-[#02043E]/15",
};

type Props = {
  title: string;
  prompt: string;
  onFinish: (result: GameResult) => void;
};

export function WordleGame({ title, prompt, onFinish }: Props) {
  const { t, locale } = useLocale();
  const [word] = useState(() => assignWordleWord(locale));
  const started = useRef(Date.now());
  const [rows, setRows] = useState<string[]>(Array(MAX_GUESSES).fill(""));
  const [states, setStates] = useState<LetterState[][]>(
    Array.from({ length: MAX_GUESSES }, () => Array(5).fill("empty")),
  );
  const [rowIndex, setRowIndex] = useState(0);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [keyMap, setKeyMap] = useState<Record<string, LetterState>>({});

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const legendFor = useCallback(
    (st: LetterState) => {
      if (st === "correct") return t.wordle.legendCorrect;
      if (st === "present") return t.wordle.legendPresent;
      if (st === "absent") return t.wordle.legendAbsent;
      return null;
    },
    [t.wordle.legendAbsent, t.wordle.legendCorrect, t.wordle.legendPresent],
  );

  const finish = useCallback(
    (won: boolean, guessesUsed: number) => {
      setDone(true);
      const elapsed = Date.now() - started.current;
      const breakdown = won
        ? scoreFromQualityAndTime(wordleQuality(true, guessesUsed), elapsed)
        : scoreFailed();
      setMessage(won ? t.wordle.success : t.wordle.fail.replace("{word}", word));
      window.setTimeout(
        () =>
          onFinish({
            score: breakdown.total,
            meta: {
              won,
              guessesUsed,
              word,
              quality: breakdown.quality,
              time: breakdown.time,
            },
          }),
        1000,
      );
    },
    [onFinish, t.wordle.fail, t.wordle.success, word],
  );

  const submit = useCallback(() => {
    if (done) return;
    if (current.length !== 5) {
      setMessage(t.wordle.needFive);
      return;
    }
    const guess = current.toUpperCase();
    const result = scoreGuess(guess, word);
    const nextRows = [...rows];
    nextRows[rowIndex] = guess;
    const nextStates = [...states];
    nextStates[rowIndex] = result;
    setRows(nextRows);
    setStates(nextStates);

    setKeyMap((prev) => {
      const next = { ...prev };
      for (let i = 0; i < 5; i += 1) {
        const ch = guess[i];
        const st = result[i];
        const rank = { correct: 3, present: 2, absent: 1, empty: 0 };
        if ((rank[st] ?? 0) > (rank[next[ch] ?? "empty"] ?? 0)) next[ch] = st;
      }
      return next;
    });

    if (guess === word) {
      finish(true, rowIndex + 1);
      return;
    }
    if (rowIndex + 1 >= MAX_GUESSES) {
      finish(false, MAX_GUESSES);
      return;
    }
    setRowIndex((i) => i + 1);
    setCurrent("");
    setMessage(null);
  }, [current, done, finish, rowIndex, rows, states, t.wordle.needFive, word]);

  const onKey = useCallback(
    (key: string) => {
      if (done) return;
      if (key === "ENTER") {
        submit();
        return;
      }
      if (key === "⌫" || key === "BACKSPACE") {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key) && current.length < 5) {
        setCurrent((c) => c + key);
      }
    },
    [current.length, done, submit],
  );

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Enter") onKey("ENTER");
      else if (e.key === "Backspace") onKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onKey]);

  return (
    <div className="grid h-full min-h-0 gap-5 md:grid-cols-2 md:items-stretch md:gap-8">
      <div className="flex min-h-0 flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <ColorTip letter="A" tone="present" label={t.wordle.legendPresent} />
          <ColorTip letter="A" tone="correct" label={t.wordle.legendCorrect} />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          {Array.from({ length: MAX_GUESSES }, (_, r) => {
            const letters =
              r === rowIndex && !done ? current.padEnd(5) : (rows[r] || "").padEnd(5);
            return (
              <div key={r} className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, c) => {
                  const ch = letters[c] === " " ? "" : letters[c];
                  const st =
                    r === rowIndex && !done && !rows[r]
                      ? "empty"
                      : states[r][c];
                  return (
                    <div
                      key={c}
                      className={`flex h-12 w-12 items-center justify-center rounded-sm border text-lg font-semibold uppercase sm:h-14 sm:w-14 sm:text-xl ${cellTone[st]}`}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-col justify-center gap-4">
        <div className="space-y-2">
          <h2 className="text-[clamp(1.25rem,1.5vw+0.7rem,1.75rem)] font-light tracking-tight">
            {title}
          </h2>
          <RichText
            as="p"
            html={prompt}
            className="text-[clamp(0.875rem,0.35vw+0.7rem,1rem)] font-bold leading-relaxed text-[#02043E]"
          />
        </div>

        {message ? (
          <p className="text-[15px] text-[#02043E]/75" role="status">
            {message}
          </p>
        ) : null}

        <div className="w-full space-y-1.5">
          {KEYS.map((row) => (
            <div key={row} className="flex w-full gap-1.5">
              {row === "ZXCVBNM" ? (
                <button
                  type="button"
                  onClick={() => onKey("ENTER")}
                  className="h-12 flex-[1.4] rounded-md bg-[#02043E]/08 px-1 text-[11px] font-medium sm:text-xs"
                >
                  ENTER
                </button>
              ) : null}
              {row.split("").map((key) => {
                const st = keyMap[key] ?? "empty";
                const tone =
                  st === "correct"
                    ? "bg-[#683C95] text-white"
                    : st === "present"
                      ? "bg-[#AE66FF] text-white"
                      : st === "absent"
                        ? "bg-[#02043E]/2 text-white"
                        : "bg-[#02043E]/08";
                const tip = legendFor(st);
                return (
                  <DelayedTip key={key} label={tip} fill delayMs={KEY_TIP_DELAY_MS}>
                    <button
                      type="button"
                      onClick={() => onKey(key)}
                      className={`h-12 w-full rounded-md text-sm font-medium sm:text-base ${tone}`}
                    >
                      {key}
                    </button>
                  </DelayedTip>
                );
              })}
              {row === "ZXCVBNM" ? (
                <button
                  type="button"
                  onClick={() => onKey("BACKSPACE")}
                  className="h-12 flex-[1.2] rounded-md bg-[#02043E]/08 px-1 text-[11px] font-medium sm:text-xs"
                >
                  ⌫
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorTip({
  letter,
  tone,
  label,
}: {
  letter: string;
  tone: "present" | "correct";
  label: string;
}) {
  return (
    <DelayedTip label={label} delayMs={0}>
      <span
        tabIndex={0}
        aria-label={label}
        className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border text-[9px] font-semibold uppercase text-white outline-none focus-visible:ring-2 focus-visible:ring-[#683C95]/40 ${cellTone[tone]}`}
      >
        {letter}
      </span>
    </DelayedTip>
  );
}

function DelayedTip({
  label,
  children,
  fill = false,
  delayMs = 0,
}: {
  label: string | null;
  children: React.ReactNode;
  fill?: boolean;
  delayMs?: number;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  function clearTimer() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function clear() {
    clearTimer();
    setOpen(false);
  }

  function start() {
    if (!label) return;
    clearTimer();
    setOpen(false);
    if (delayMs <= 0) {
      setOpen(true);
      return;
    }
    timer.current = window.setTimeout(() => setOpen(true), delayMs);
  }

  useEffect(() => () => clearTimer(), []);

  return (
    <span
      className={`relative inline-flex ${fill ? "min-w-0 flex-1" : ""}`}
      onMouseEnter={start}
      onMouseLeave={clear}
      onFocus={start}
      onBlur={clear}
    >
      {children}
      {open && label ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-max max-w-[220px] -translate-x-1/2 rounded-sm bg-[#02043E] px-2.5 py-1.5 text-left text-[12px] leading-snug text-white shadow-lg"
        >
          {label}
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#02043E]"
          />
        </span>
      ) : null}
    </span>
  );
}
