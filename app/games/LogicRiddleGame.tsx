"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/Button";
import { FinishFeedback } from "@/app/components/FinishFeedback";
import { RichText } from "@/app/components/RichText";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import type { GameResult } from "@/app/lib/types";
import { riddleQuality, scoreFromQualityAndTime } from "@/app/lib/scoring";

type Person = "Ana" | "Bruno" | "Carla" | "Diego";
type Role = "Dev" | "Design" | "PM" | "QA";

const PEOPLE: Person[] = ["Ana", "Bruno", "Carla", "Diego"];
const ROLES: Role[] = ["Dev", "Design", "PM", "QA"];

const SOLUTION: Record<Person, Role> = {
  Ana: "Design",
  Bruno: "PM",
  Carla: "Dev",
  Diego: "QA",
};

const CLUES = {
  es: [
    "Ana no es Dev ni QA.",
    "Bruno no es Design, ni Dev, ni QA.",
    "Quien es PM no es Ana ni Carla.",
    "Carla no es PM ni QA.",
    "Diego no es Dev ni Design.",
    "El rol de Design no es de Bruno ni de Diego.",
  ],
  en: [
    "Ana is not Dev or QA.",
    "Bruno is not Design, Dev, or QA.",
    "Whoever is PM is not Ana or Carla.",
    "Carla is not PM or QA.",
    "Diego is not Dev or Design.",
    "Design is not Bruno or Diego.",
  ],
};

const FINISH_MS = 2500;

type Props = {
  prompt: string;
  accent: string;
  onFinish: (result: GameResult) => void;
};

export function LogicRiddleGame({ prompt, accent, onFinish }: Props) {
  const { t, locale } = useLocale();
  const started = useRef(Date.now());
  const pendingResult = useRef<GameResult | null>(null);
  const [assignment, setAssignment] = useState<Record<Person, Role | "">>({
    Ana: "",
    Bruno: "",
    Carla: "",
    Diego: "",
  });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showExtra, setShowExtra] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finishMessage, setFinishMessage] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  function setRole(person: Person, role: Role | "") {
    setAssignment((prev) => {
      const next = { ...prev };
      if (role) {
        for (const other of PEOPLE) {
          if (other !== person && next[other] === role) next[other] = "";
        }
      }
      next[person] = role;
      return next;
    });
    setFeedback(null);
  }

  function check() {
    if (PEOPLE.some((p) => !assignment[p])) {
      setFeedback(t.riddle.needAll);
      return;
    }
    const roles = PEOPLE.map((p) => assignment[p]);
    if (new Set(roles).size !== 4) {
      setFeedback(t.riddle.uniqueRoles);
      return;
    }
    const ok = PEOPLE.every((p) => assignment[p] === SOLUTION[p]);
    if (!ok) {
      setFeedback(t.riddle.wrong);
      return;
    }
    setSolved(true);
    setFeedback(null);
    setFinishMessage(t.riddle.success);
    const { total, quality, time } = scoreFromQualityAndTime(
      riddleQuality(hintsUsed),
      Date.now() - started.current,
    );
    pendingResult.current = { score: total, meta: { hintsUsed, quality, time } };
  }

  return (
    <div className="grid h-full min-h-0 gap-6 md:grid-cols-2 md:items-stretch md:gap-8">
      <div className="flex min-h-0 flex-col justify-center gap-2">
        <p className="font-medium">{t.riddle.assign}</p>
        {PEOPLE.map((person, personIndex) => (
          <div
            key={person}
            className="flex flex-col gap-2 rounded-sm border border-[#02043E]/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium">{t.riddle.people[personIndex]}</span>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role, roleIndex) => {
                const selected = assignment[person] === role;
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={solved}
                    onClick={() => setRole(person, selected ? "" : role)}
                    className={`min-h-10 rounded-sm px-3 py-2 text-sm transition-colors ${
                      selected
                        ? "bg-[#775DFD] text-white"
                        : "bg-[#02043E]/06 text-[#02043E] hover:bg-[#775DFD]/15"
                    }`}
                  >
                    {t.riddle.roles[roleIndex]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="pt-1">
          <Button
            type="button"
            accent={accent}
            onClick={check}
            disabled={solved}
            className="w-full sm:w-auto"
          >
            {t.riddle.check}
          </Button>
        </div>
        {feedback ? (
          <p className="text-[0.9375rem] leading-relaxed text-[#02043E]/70" role="status">
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-col justify-center gap-4">
        <div className="space-y-3">
          <RichText
            as="p"
            html={prompt}
            className="text-[clamp(0.875rem,0.35vw+0.7rem,1rem)] font-bold leading-relaxed text-[#02043E]"
          />
        </div>

        <div className="rounded-sm bg-[#eef2fb] p-5 md:p-6">
          <p className="text-sm font-medium tracking-[0.12em] uppercase text-[#775DFD]">
            {t.riddle.clues}
          </p>
          <ul className="mt-3 space-y-2 text-[clamp(0.8125rem,0.3vw+0.7rem,0.9375rem)] leading-relaxed text-[#02043E]/80">
            {CLUES[locale].map((clue) => (
              <li key={clue}>• {clue}</li>
            ))}
          </ul>
          {showExtra ? (
            <p className="mt-4 rounded-sm bg-white/80 px-4 py-3 text-[0.9375rem] text-[#775DFD]">
              {t.riddle.extraHint}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowExtra(true);
                setHintsUsed((n) => n + 1);
              }}
              className="mt-4 min-h-11 text-sm font-medium text-[#775DFD] underline-offset-2 hover:underline"
            >
              {t.riddle.extraHintBtn}
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
}
