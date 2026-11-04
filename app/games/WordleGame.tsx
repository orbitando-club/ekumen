"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import type { GameResult } from "@/app/lib/types";
import { scoreFailed, scoreFromQualityAndTime, wordleQuality } from "@/app/lib/scoring";

const WORD = "VALOR";
const MAX_GUESSES = 6;
const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

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
  onFinish: (result: GameResult) => void;
};

export function WordleGame({ onFinish }: Props) {
  const { t } = useLocale();
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

  const finish = useCallback(
    (won: boolean, guessesUsed: number) => {
      setDone(true);
      const elapsed = Date.now() - started.current;
      const breakdown = won
        ? scoreFromQualityAndTime(wordleQuality(true, guessesUsed), elapsed)
        : scoreFailed();
      setMessage(won ? t.wordle.success : t.wordle.fail);
      window.setTimeout(
        () =>
          onFinish({
            score: breakdown.total,
            meta: {
              won,
              guessesUsed,
              word: WORD,
              quality: breakdown.quality,
              time: breakdown.time,
            },
          }),
        1000,
      );
    },
    [onFinish, t.wordle.fail, t.wordle.success],
  );

  const submit = useCallback(() => {
    if (done) return;
    if (current.length !== 5) {
      setMessage(t.wordle.needFive);
      return;
    }
    const guess = current.toUpperCase();
    const result = scoreGuess(guess, WORD);
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

    if (guess === WORD) {
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
  }, [current, done, finish, rowIndex, rows, states, t.wordle.needFive]);

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
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        {Array.from({ length: MAX_GUESSES }, (_, r) => {
          const letters =
            r === rowIndex && !done ? current.padEnd(5) : (rows[r] || "").padEnd(5);
          return (
            <div key={r} className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: 5 }, (_, c) => {
                const ch = letters[c] === " " ? "" : letters[c];
                const st =
                  r === rowIndex && !done && !rows[r]
                    ? "empty"
                    : states[r][c];
                return (
                  <div
                    key={c}
                    className={`flex h-11 w-11 items-center justify-center rounded-sm border text-lg font-semibold uppercase sm:h-12 sm:w-12 ${cellTone[st]}`}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {message ? (
        <p className="text-center text-[15px] text-[#02043E]/75" role="status">
          {message}
        </p>
      ) : null}

      <div className="space-y-2">
        {KEYS.map((row) => (
          <div key={row} className="flex justify-center gap-1.5">
            {row === "ZXCVBNM" ? (
              <button
                type="button"
                onClick={() => onKey("ENTER")}
                className="min-h-11 rounded-lg bg-[#02043E]/08 px-2 py-3 text-[11px] font-medium sm:px-3 sm:text-xs"
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
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onKey(key)}
                  className={`h-11 min-w-7 rounded-lg px-1.5 text-sm font-medium sm:min-w-8 sm:px-2 ${tone}`}
                >
                  {key}
                </button>
              );
            })}
            {row === "ZXCVBNM" ? (
              <button
                type="button"
                onClick={() => onKey("BACKSPACE")}
                className="min-h-11 rounded-lg bg-[#02043E]/08 px-2 py-3 text-[11px] font-medium sm:px-3 sm:text-xs"
              >
                ⌫
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
