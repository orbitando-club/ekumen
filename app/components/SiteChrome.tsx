"use client";

import { Mark } from "./Mark";
import { useProgress, completedCount } from "@/app/lib/progress";

/** Header mínimo reutilizable (la experiencia principal monta el suyo). */
export function SiteHeader() {
  const { progress, ready } = useProgress();
  const done = completedCount(progress);

  return (
    <header className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-2 sm:px-6">
      <div className="text-ink" aria-label="Ekumen">
        <Mark
          progress={ready ? progress : undefined}
          wordmark
          className={`h-5 text-[18px] transition-opacity sm:h-6 sm:text-[20px] ${ready ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      <span className="text-xs text-[#02043E]/50" suppressHydrationWarning>
        {ready ? `${done}/4` : "\u00a0"}
      </span>
    </header>
  );
}
