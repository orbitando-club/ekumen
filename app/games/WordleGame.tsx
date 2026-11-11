"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FinishFeedback } from "@/app/components/FinishFeedback";
import { RichText } from "@/app/components/RichText";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import type { GameResult } from "@/app/lib/types";
import { scoreFailed, scoreFromQualityAndTime, wordleQuality } from "@/app/lib/scoring";
import { assignWordleWord } from "@/app/lib/wordleWords";

const MAX_GUESSES = 6;
const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const FINISH_MS = 2000;

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
  prompt: string;
  accent: string;
  onFinish: (result: GameResult) => void;
};

export function WordleGame({ prompt, accent, onFinish }: Props) {
  const { t, locale } = useLocale();
  const [word] = useState(() => assignWordleWord(locale));
  const started = useRef(Date.now());
  const pendingResult = useRef<GameResult | null>(null);
  const [rows, setRows] = useState<string[]>(Array(MAX_GUESSES).fill(""));
  const [states, setStates] = useState<LetterState[][]>(
    Array.from({ length: MAX_GUESSES }, () => Array(5).fill("empty")),
  );
  const [rowIndex, setRowIndex] = useState(0);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [finishMessage, setFinishMessage] = useState<string | null>(null);
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
      setMessage(null);
      setFinishMessage(won ? t.wordle.success : t.wordle.fail.replace("{word}", word));
      pendingResult.current = {
        score: breakdown.total,
        meta: {
          won,
          guessesUsed,
          word,
          quality: breakdown.quality,
          time: breakdown.time,
        },
      };
    },
    [t.wordle.fail, t.wordle.success, word],
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
        <div className="space-y-3">
          <RichText
            as="p"
            html={prompt}
            className="text-[clamp(0.875rem,0.35vw+0.7rem,1rem)] font-bold leading-relaxed text-[#02043E]"
          />
          <ul className="space-y-2">
            <LegendRow letter="A" tone="present" label={t.wordle.legendPresent} />
            <LegendRow letter="A" tone="correct" label={t.wordle.legendCorrect} />
          </ul>
        </div>

        {message ? (
          <p className="text-[0.9375rem] text-[#02043E]/75" role="status">
            {message}
          </p>
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

        <div className="w-full space-y-1.5">
          {KEYS.map((row) => (
            <div key={row} className="flex w-full gap-1.5">
              {row === "ZXCVBNM" ? (
                <button
                  type="button"
                  onClick={() => onKey("ENTER")}
                  className="h-12 flex-[1.4] rounded-md bg-[#02043E]/08 px-1 text-[0.6875rem] font-medium sm:text-xs"
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
                    className={`h-12 min-w-0 flex-1 rounded-md text-sm font-medium sm:text-base ${tone}`}
                  >
                    {key}
                  </button>
                );
              })}
              {row === "ZXCVBNM" ? (
                <button
                  type="button"
                  onClick={() => onKey("BACKSPACE")}
                  className="h-12 flex-[1.2] rounded-md bg-[#02043E]/08 px-1 text-[0.6875rem] font-medium sm:text-xs"
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

function LegendRow({
  letter,
  tone,
  label,
}: {
  letter: string;
  tone: "present" | "correct" | "absent";
  label: string;
}) {
  return (
    <li className="flex items-center gap-2.5 text-[0.8125rem] leading-snug text-[#02043E]/75">
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-[0.625rem] font-semibold uppercase text-white ${cellTone[tone]}`}
      >
        {letter}
      </span>
      <span>{label}</span>
    </li>
  );
}
