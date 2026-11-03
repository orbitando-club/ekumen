"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/app/components/Button";
import type { GameResult } from "@/app/lib/types";
import { scoreFromTime } from "@/app/lib/scoring";

/** Clásico de pensamiento lateral: la respuesta no es “recorrer el perímetro”. */
const CORRECT = 4;

type Props = {
  onFinish: (result: GameResult) => void;
};

export function InsightGame({ onFinish }: Props) {
  const started = useRef(Date.now());
  const [guess, setGuess] = useState("");
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(guess.trim());
    if (!Number.isFinite(value)) {
      setFeedback("Ingresá un número.");
      return;
    }
    if (value === CORRECT) {
      setSolved(true);
      setFeedback(
        "¡Insight! Con cuatro líneas rectas se pueden unir los nueve puntos si salís del marco que parece “obvio”.",
      );
      const score = scoreFromTime({
        correct: true,
        elapsedMs: Date.now() - started.current,
        idealMs: 40_000,
        floorMs: 120_000,
        penalties: wrong * 35,
      });
      window.setTimeout(() => onFinish({ score, meta: { wrong, answer: CORRECT } }), 900);
      return;
    }
    setWrong((n) => n + 1);
    setFeedback(
      wrong === 0
        ? "Todavía no. ¿Estás asumiendo que no podés salir del cuadrado imaginario?"
        : "Seguí cuestionando el enfoque. A veces la solución está fuera del marco.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-[#eef2fb] p-6 md:p-8">
        <NineDots />
        <p className="max-w-md text-center text-[15px] leading-relaxed text-[#02043E]/75">
          ¿Cuál es el <strong>mínimo</strong> de líneas rectas continuas (sin levantar el lápiz) para
          unir los nueve puntos?
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm">
          <span className="font-medium">Tu respuesta</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={guess}
            disabled={solved}
            onChange={(e) => setGuess(e.target.value)}
            className="rounded-2xl border border-[#02043E]/15 bg-white px-4 py-3 text-base outline-none focus:border-[#2B65E7]"
            placeholder="Número de líneas"
          />
        </label>
        <Button type="submit" disabled={solved || !guess.trim()}>
          Comprobar
        </Button>
      </form>

      {feedback ? (
        <p
          className={`text-[15px] leading-relaxed ${solved ? "text-[#023D8F]" : "text-[#02043E]/70"}`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
      {wrong > 0 && !solved ? (
        <p className="text-sm text-[#02043E]/45">Intentos fallidos: {wrong}</p>
      ) : null}
    </div>
  );
}

function NineDots() {
  const dots = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => ({ cx: 40 + col * 56, cy: 40 + row * 56 })),
  );
  return (
    <svg viewBox="0 0 192 192" className="h-44 w-44" role="img" aria-label="Nueve puntos en una grilla">
      {dots.map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r="8" fill="#2B65E7" />
      ))}
    </svg>
  );
}
