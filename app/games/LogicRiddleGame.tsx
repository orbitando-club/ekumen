"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/Button";
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

type Props = {
  onFinish: (result: GameResult) => void;
};

export function LogicRiddleGame({ onFinish }: Props) {
  const { t, locale } = useLocale();
  const started = useRef(Date.now());
  const [assignment, setAssignment] = useState<Record<Person, Role | "">>({
    Ana: "",
    Bruno: "",
    Carla: "",
    Diego: "",
  });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showExtra, setShowExtra] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  function setRole(person: Person, role: Role | "") {
    setAssignment((prev) => ({ ...prev, [person]: role }));
    setFeedback(null);
  }

  function usedRoles() {
    return new Set(PEOPLE.map((p) => assignment[p]).filter(Boolean));
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
    setFeedback(t.riddle.success);
    const { total, quality, time } = scoreFromQualityAndTime(
      riddleQuality(hintsUsed),
      Date.now() - started.current,
    );
    window.setTimeout(
      () => onFinish({ score: total, meta: { hintsUsed, quality, time } }),
      900,
    );
  }

  const taken = usedRoles();

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="shrink-0 rounded-sm bg-[#eef2fb] px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#775DFD]">
            {t.riddle.clues}
          </p>
          {!showExtra ? (
            <button
              type="button"
              onClick={() => {
                setShowExtra(true);
                setHintsUsed((n) => n + 1);
              }}
              className="text-[11px] font-medium text-[#775DFD] underline-offset-2 hover:underline"
            >
              {t.riddle.extraHintBtn}
            </button>
          ) : null}
        </div>
        <ul className="mt-1.5 columns-1 gap-x-6 text-[12px] leading-snug text-[#02043E]/80 sm:columns-2 sm:text-[13px]">
          {CLUES[locale].map((clue) => (
            <li key={clue} className="mb-1 break-inside-avoid">
              • {clue}
            </li>
          ))}
        </ul>
        {showExtra ? (
          <p className="mt-2 rounded-sm bg-white/80 px-2.5 py-2 text-[12px] leading-snug text-[#775DFD]">
            {t.riddle.extraHint}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
        <p className="text-xs font-medium sm:text-sm">{t.riddle.assign}</p>
        {PEOPLE.map((person, personIndex) => (
          <div
            key={person}
            className="flex items-center justify-between gap-2 rounded-sm border border-[#02043E]/10 bg-white px-2.5 py-1.5 sm:px-3"
          >
            <span className="shrink-0 text-[13px] font-medium">{t.riddle.people[personIndex]}</span>
            <div className="flex flex-wrap justify-end gap-1">
              {ROLES.map((role, roleIndex) => {
                const selected = assignment[person] === role;
                const blocked = !selected && taken.has(role);
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={solved || blocked}
                    onClick={() => setRole(person, selected ? "" : role)}
                    className={`min-h-8 rounded-sm px-2.5 py-1 text-[12px] transition-colors sm:px-3 ${
                      selected
                        ? "bg-[#775DFD] text-white"
                        : blocked
                          ? "bg-[#02043E]/05 text-[#02043E]/30"
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
      </div>

      <div className="shrink-0 space-y-1.5">
        <Button type="button" onClick={check} disabled={solved} className="w-full sm:w-auto">
          {t.riddle.check}
        </Button>
        {feedback ? (
          <p
            className={`text-[12px] leading-snug ${solved ? "text-[#023D8F]" : "text-[#02043E]/70"}`}
            role="status"
          >
            {feedback}
          </p>
        ) : null}
      </div>
    </div>
  );
}
