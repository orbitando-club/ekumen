"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/Button";
import type { GameResult } from "@/app/lib/types";
import { scoreFromTime } from "@/app/lib/scoring";

type Person = "Ana" | "Bruno" | "Carla" | "Diego";
type Role = "Dev" | "Design" | "PM" | "QA";

const PEOPLE: Person[] = ["Ana", "Bruno", "Carla", "Diego"];
const ROLES: Role[] = ["Dev", "Design", "PM", "QA"];

/**
 * Solución:
 * Ana=Design, Bruno=PM, Carla=Dev, Diego=QA
 */
const SOLUTION: Record<Person, Role> = {
  Ana: "Design",
  Bruno: "PM",
  Carla: "Dev",
  Diego: "QA",
};

const CLUES = [
  "Ana no es Dev ni QA.",
  "Bruno no es Design, ni Dev, ni QA.",
  "Quien es PM no es Ana ni Carla.",
  "Carla no es PM ni QA.",
  "Diego no es Dev ni Design.",
  "El rol de Design no es de Bruno ni de Diego.",
];

const EXTRA_HINT = "Carla es Dev y Diego es QA. Con eso el resto encaja por eliminación.";

type Props = {
  onFinish: (result: GameResult) => void;
};

export function LogicRiddleGame({ onFinish }: Props) {
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
      setFeedback("Asigná un rol a cada persona.");
      return;
    }
    const roles = PEOPLE.map((p) => assignment[p]);
    if (new Set(roles).size !== 4) {
      setFeedback("Cada rol solo puede usarse una vez.");
      return;
    }
    const ok = PEOPLE.every((p) => assignment[p] === SOLUTION[p]);
    if (!ok) {
      setFeedback("Todavía no cierra. Revisá las pistas y ajustá.");
      return;
    }
    setSolved(true);
    setFeedback("¡Resolviste el acertijo! Probar, observar y ajustar: esa es la forma.");
    const score = scoreFromTime({
      correct: true,
      elapsedMs: Date.now() - started.current,
      idealMs: 70_000,
      floorMs: 180_000,
      penalties: hintsUsed * 40,
    });
    window.setTimeout(() => onFinish({ score, meta: { hintsUsed } }), 900);
  }

  function takeHint() {
    if (showExtra) return;
    setShowExtra(true);
    setHintsUsed((n) => n + 1);
  }

  const taken = usedRoles();

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-[#eef2fb] p-5 md:p-6">
        <p className="text-sm font-medium tracking-[0.12em] uppercase text-[#775DFD]">
          Pistas
        </p>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[#02043E]/80">
          {CLUES.map((clue) => (
            <li key={clue}>• {clue}</li>
          ))}
        </ul>
        {showExtra ? (
          <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-[15px] text-[#775DFD]">
            Pista extra: {EXTRA_HINT}
          </p>
        ) : (
          <button
            type="button"
            onClick={takeHint}
            className="mt-4 text-sm font-medium text-[#775DFD] underline-offset-2 hover:underline"
          >
            Pedir una pista (−40 pts)
          </button>
        )}
      </div>

      <div className="space-y-3">
        <p className="font-medium">Asigná un rol a cada persona</p>
        {PEOPLE.map((person) => (
          <div
            key={person}
            className="flex flex-col gap-2 rounded-2xl border border-[#02043E]/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium">{person}</span>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => {
                const selected = assignment[person] === role;
                const blocked = !selected && taken.has(role);
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={solved || blocked}
                    onClick={() => setRole(person, selected ? "" : role)}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      selected
                        ? "bg-[#775DFD] text-white"
                        : blocked
                          ? "bg-[#02043E]/05 text-[#02043E]/30"
                          : "bg-[#02043E]/06 text-[#02043E] hover:bg-[#775DFD]/15"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" onClick={check} disabled={solved}>
        Comprobar
      </Button>

      {feedback ? (
        <p
          className={`text-[15px] leading-relaxed ${solved ? "text-[#023D8F]" : "text-[#02043E]/70"}`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
